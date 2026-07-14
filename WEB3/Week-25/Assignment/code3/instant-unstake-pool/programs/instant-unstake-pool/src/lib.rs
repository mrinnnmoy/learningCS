use anchor_lang::prelude::*;
use anchor_spl::token::{self, Burn, Mint, MintTo, Token, TokenAccount, Transfer};

declare_id!("C1UUig4375m6ReDbrjeJQkGJw4Jayhn3dnhJuRu7jnTu");

const FEE_DENOMINATOR: u64 = 10_000;

fn isqrt(n: u128) -> u128 {
    if n == 0 {
        return 0;
    }
    let mut x = n;
    let mut y = (x + 1) / 2;
    while y < x {
        x = y;
        y = (x + n / x) / 2;
    }
    x
}

#[program]
pub mod instant_unstake_pool {
    use super::*;

    pub fn initialize_pool(ctx: Context<InitializePool>, fee_bps: u16) -> Result<()> {
        require!(fee_bps < FEE_DENOMINATOR as u16, PoolError::InvalidFee);
        let pool = &mut ctx.accounts.pool;
        pool.mint_a = ctx.accounts.mint_a.key();
        pool.mint_b = ctx.accounts.mint_b.key();
        pool.lp_mint = ctx.accounts.lp_mint.key();
        pool.fee_bps = fee_bps;
        Ok(())
    }

    pub fn add_liquidity(ctx: Context<AddLiquidity>, amount_a: u64, amount_b: u64) -> Result<()> {
        require!(amount_a > 0 && amount_b > 0, PoolError::ZeroAmount);

        let reserve_a = ctx.accounts.vault_a.amount;
        let reserve_b = ctx.accounts.vault_b.amount;
        let lp_supply = ctx.accounts.lp_mint.supply;

        let lp_to_mint: u64 = if lp_supply == 0 {
            isqrt((amount_a as u128) * (amount_b as u128))
                .try_into()
                .map_err(|_| PoolError::Overflow)?
        } else {
            let from_a = (amount_a as u128)
                .checked_mul(lp_supply as u128)
                .ok_or(PoolError::Overflow)?
                / reserve_a as u128;
            let from_b = (amount_b as u128)
                .checked_mul(lp_supply as u128)
                .ok_or(PoolError::Overflow)?
                / reserve_b as u128;
            std::cmp::min(from_a, from_b)
                .try_into()
                .map_err(|_| PoolError::Overflow)?
        };
        require!(lp_to_mint > 0, PoolError::InsufficientLiquidity);

        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.key(),
                Transfer {
                    from: ctx.accounts.user_token_a.to_account_info(),
                    to: ctx.accounts.vault_a.to_account_info(),
                    authority: ctx.accounts.user.to_account_info(),
                },
            ),
            amount_a,
        )?;
        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.key(),
                Transfer {
                    from: ctx.accounts.user_token_b.to_account_info(),
                    to: ctx.accounts.vault_b.to_account_info(),
                    authority: ctx.accounts.user.to_account_info(),
                },
            ),
            amount_b,
        )?;

        let mint_a_key = ctx.accounts.pool.mint_a;
        let mint_b_key = ctx.accounts.pool.mint_b;
        let bump = ctx.bumps.pool_authority;
        let signer_seeds: &[&[&[u8]]] =
            &[&[b"pool-authority", mint_a_key.as_ref(), mint_b_key.as_ref(), &[bump]]];

        token::mint_to(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.key(),
                MintTo {
                    mint: ctx.accounts.lp_mint.to_account_info(),
                    to: ctx.accounts.user_lp_token.to_account_info(),
                    authority: ctx.accounts.pool_authority.to_account_info(),
                },
                signer_seeds,
            ),
            lp_to_mint,
        )?;

        Ok(())
    }

    pub fn remove_liquidity(ctx: Context<RemoveLiquidity>, lp_amount: u64) -> Result<()> {
        require!(lp_amount > 0, PoolError::ZeroAmount);

        let reserve_a = ctx.accounts.vault_a.amount;
        let reserve_b = ctx.accounts.vault_b.amount;
        let lp_supply = ctx.accounts.lp_mint.supply;

        let amount_a_out: u64 = ((lp_amount as u128)
            .checked_mul(reserve_a as u128)
            .ok_or(PoolError::Overflow)?
            / lp_supply as u128)
            .try_into()
            .map_err(|_| PoolError::Overflow)?;
        let amount_b_out: u64 = ((lp_amount as u128)
            .checked_mul(reserve_b as u128)
            .ok_or(PoolError::Overflow)?
            / lp_supply as u128)
            .try_into()
            .map_err(|_| PoolError::Overflow)?;

        token::burn(
            CpiContext::new(
                ctx.accounts.token_program.key(),
                Burn {
                    mint: ctx.accounts.lp_mint.to_account_info(),
                    from: ctx.accounts.user_lp_token.to_account_info(),
                    authority: ctx.accounts.user.to_account_info(),
                },
            ),
            lp_amount,
        )?;

        let mint_a_key = ctx.accounts.pool.mint_a;
        let mint_b_key = ctx.accounts.pool.mint_b;
        let bump = ctx.bumps.pool_authority;
        let signer_seeds: &[&[&[u8]]] =
            &[&[b"pool-authority", mint_a_key.as_ref(), mint_b_key.as_ref(), &[bump]]];

        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.key(),
                Transfer {
                    from: ctx.accounts.vault_a.to_account_info(),
                    to: ctx.accounts.user_token_a.to_account_info(),
                    authority: ctx.accounts.pool_authority.to_account_info(),
                },
                signer_seeds,
            ),
            amount_a_out,
        )?;
        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.key(),
                Transfer {
                    from: ctx.accounts.vault_b.to_account_info(),
                    to: ctx.accounts.user_token_b.to_account_info(),
                    authority: ctx.accounts.pool_authority.to_account_info(),
                },
                signer_seeds,
            ),
            amount_b_out,
        )?;

        Ok(())
    }

    pub fn swap(ctx: Context<Swap>, amount_in: u64, min_amount_out: u64, a_to_b: bool) -> Result<()> {
        require!(amount_in > 0, PoolError::ZeroAmount);

        let fee_bps = ctx.accounts.pool.fee_bps as u128;
        let reserve_a = ctx.accounts.vault_a.amount as u128;
        let reserve_b = ctx.accounts.vault_b.amount as u128;

        let (reserve_in, reserve_out) = if a_to_b { (reserve_a, reserve_b) } else { (reserve_b, reserve_a) };

        let amount_in_with_fee = (amount_in as u128)
            .checked_mul(FEE_DENOMINATOR as u128 - fee_bps)
            .ok_or(PoolError::Overflow)?
            / FEE_DENOMINATOR as u128;

        // Constant product (Concept 1): out = reserve_out - (reserve_in * reserve_out) / (reserve_in + amount_in_with_fee)
        let numerator = reserve_in.checked_mul(reserve_out).ok_or(PoolError::Overflow)?;
        let new_reserve_in = reserve_in.checked_add(amount_in_with_fee).ok_or(PoolError::Overflow)?;
        let new_reserve_out = numerator / new_reserve_in;
        let amount_out: u64 = (reserve_out - new_reserve_out)
            .try_into()
            .map_err(|_| PoolError::Overflow)?;

        require!(amount_out >= min_amount_out, PoolError::SlippageExceeded);

        let mint_a_key = ctx.accounts.pool.mint_a;
        let mint_b_key = ctx.accounts.pool.mint_b;
        let bump = ctx.bumps.pool_authority;
        let signer_seeds: &[&[&[u8]]] =
            &[&[b"pool-authority", mint_a_key.as_ref(), mint_b_key.as_ref(), &[bump]]];

        let (user_in, vault_in, vault_out, user_out) = if a_to_b {
            (
                ctx.accounts.user_token_a.to_account_info(),
                ctx.accounts.vault_a.to_account_info(),
                ctx.accounts.vault_b.to_account_info(),
                ctx.accounts.user_token_b.to_account_info(),
            )
        } else {
            (
                ctx.accounts.user_token_b.to_account_info(),
                ctx.accounts.vault_b.to_account_info(),
                ctx.accounts.vault_a.to_account_info(),
                ctx.accounts.user_token_a.to_account_info(),
            )
        };

        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.key(),
                Transfer { from: user_in, to: vault_in, authority: ctx.accounts.user.to_account_info() },
            ),
            amount_in,
        )?;
        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.key(),
                Transfer { from: vault_out, to: user_out, authority: ctx.accounts.pool_authority.to_account_info() },
                signer_seeds,
            ),
            amount_out,
        )?;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializePool<'info> {
    #[account(
        init,
        payer = payer,
        space = 8 + Pool::SIZE,
        seeds = [b"pool", mint_a.key().as_ref(), mint_b.key().as_ref()],
        bump,
    )]
    pub pool: Account<'info, Pool>,
    /// CHECK: PDA authority only — validated by the seeds constraint.
    #[account(seeds = [b"pool-authority", mint_a.key().as_ref(), mint_b.key().as_ref()], bump)]
    pub pool_authority: UncheckedAccount<'info>,
    #[account(
        init, payer = payer,
        seeds = [b"vault-a", mint_a.key().as_ref(), mint_b.key().as_ref()], bump,
        token::mint = mint_a, token::authority = pool_authority,
    )]
    pub vault_a: Account<'info, TokenAccount>,
    #[account(
        init, payer = payer,
        seeds = [b"vault-b", mint_a.key().as_ref(), mint_b.key().as_ref()], bump,
        token::mint = mint_b, token::authority = pool_authority,
    )]
    pub vault_b: Account<'info, TokenAccount>,
    #[account(
        init, payer = payer,
        seeds = [b"lp-mint", mint_a.key().as_ref(), mint_b.key().as_ref()], bump,
        mint::decimals = 6, mint::authority = pool_authority,
    )]
    pub lp_mint: Account<'info, Mint>,
    pub mint_a: Account<'info, Mint>,
    pub mint_b: Account<'info, Mint>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct AddLiquidity<'info> {
    #[account(seeds = [b"pool", pool.mint_a.as_ref(), pool.mint_b.as_ref()], bump)]
    pub pool: Account<'info, Pool>,
    /// CHECK: PDA authority only — validated by the seeds constraint.
    #[account(seeds = [b"pool-authority", pool.mint_a.as_ref(), pool.mint_b.as_ref()], bump)]
    pub pool_authority: UncheckedAccount<'info>,
    #[account(mut, seeds = [b"vault-a", pool.mint_a.as_ref(), pool.mint_b.as_ref()], bump)]
    pub vault_a: Account<'info, TokenAccount>,
    #[account(mut, seeds = [b"vault-b", pool.mint_a.as_ref(), pool.mint_b.as_ref()], bump)]
    pub vault_b: Account<'info, TokenAccount>,
    #[account(mut, seeds = [b"lp-mint", pool.mint_a.as_ref(), pool.mint_b.as_ref()], bump)]
    pub lp_mint: Account<'info, Mint>,
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut)]
    pub user_token_a: Account<'info, TokenAccount>,
    #[account(mut)]
    pub user_token_b: Account<'info, TokenAccount>,
    #[account(mut)]
    pub user_lp_token: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct RemoveLiquidity<'info> {
    #[account(seeds = [b"pool", pool.mint_a.as_ref(), pool.mint_b.as_ref()], bump)]
    pub pool: Account<'info, Pool>,
    /// CHECK: PDA authority only — validated by the seeds constraint.
    #[account(seeds = [b"pool-authority", pool.mint_a.as_ref(), pool.mint_b.as_ref()], bump)]
    pub pool_authority: UncheckedAccount<'info>,
    #[account(mut, seeds = [b"vault-a", pool.mint_a.as_ref(), pool.mint_b.as_ref()], bump)]
    pub vault_a: Account<'info, TokenAccount>,
    #[account(mut, seeds = [b"vault-b", pool.mint_a.as_ref(), pool.mint_b.as_ref()], bump)]
    pub vault_b: Account<'info, TokenAccount>,
    #[account(mut, seeds = [b"lp-mint", pool.mint_a.as_ref(), pool.mint_b.as_ref()], bump)]
    pub lp_mint: Account<'info, Mint>,
    pub user: Signer<'info>,
    #[account(mut)]
    pub user_token_a: Account<'info, TokenAccount>,
    #[account(mut)]
    pub user_token_b: Account<'info, TokenAccount>,
    #[account(mut)]
    pub user_lp_token: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct Swap<'info> {
    #[account(seeds = [b"pool", pool.mint_a.as_ref(), pool.mint_b.as_ref()], bump)]
    pub pool: Account<'info, Pool>,
    /// CHECK: PDA authority only — validated by the seeds constraint.
    #[account(seeds = [b"pool-authority", pool.mint_a.as_ref(), pool.mint_b.as_ref()], bump)]
    pub pool_authority: UncheckedAccount<'info>,
    #[account(mut, seeds = [b"vault-a", pool.mint_a.as_ref(), pool.mint_b.as_ref()], bump)]
    pub vault_a: Account<'info, TokenAccount>,
    #[account(mut, seeds = [b"vault-b", pool.mint_a.as_ref(), pool.mint_b.as_ref()], bump)]
    pub vault_b: Account<'info, TokenAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut)]
    pub user_token_a: Account<'info, TokenAccount>,
    #[account(mut)]
    pub user_token_b: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[account]
pub struct Pool {
    pub mint_a: Pubkey,
    pub mint_b: Pubkey,
    pub lp_mint: Pubkey,
    pub fee_bps: u16,
}
impl Pool {
    pub const SIZE: usize = 32 + 32 + 32 + 2;
}

#[error_code]
pub enum PoolError {
    #[msg("Amount must be greater than zero")]
    ZeroAmount,
    #[msg("Fee must be less than 100%")]
    InvalidFee,
    #[msg("Deposit would mint zero LP tokens")]
    InsufficientLiquidity,
    #[msg("Swap output is below the minimum acceptable amount")]
    SlippageExceeded,
    #[msg("Arithmetic overflow")]
    Overflow,
}