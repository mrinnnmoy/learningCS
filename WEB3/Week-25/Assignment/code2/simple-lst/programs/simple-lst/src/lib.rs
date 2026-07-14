use anchor_lang::prelude::*;
use anchor_lang::system_program::{self, Transfer as SystemTransfer};
use anchor_spl::token::{self, Mint, MintTo, Token, TokenAccount, Burn};

declare_id!("DoFF3AB2mSTQrWQQiNRMPkuqd9EFjHNyghDw4BGys8U1");

const COOLDOWN_SECONDS: i64 = 5; // Concept 5/9: real cooldowns are ~epochs (days); compressed here for a runnable assignment.

#[program]
pub mod simple_lst {
    use super::*;

    pub fn initialize_pool(ctx: Context<InitializePool>) -> Result<()> {
        let reserve = Rent::get()?.minimum_balance(8 + Pool::SIZE);
        let pool = &mut ctx.accounts.pool;
        pool.lst_mint = ctx.accounts.lst_mint.key();
        pool.rent_exempt_reserve = reserve;
        Ok(())
    }

    pub fn stake(ctx: Context<Stake>, lamports: u64) -> Result<()> {
        require!(lamports > 0, LstError::ZeroAmount);

        let total_staked_before = ctx
            .accounts
            .pool
            .to_account_info()
            .lamports()
            .checked_sub(ctx.accounts.pool.rent_exempt_reserve)
            .ok_or(LstError::Overflow)?;
        let lst_supply = ctx.accounts.lst_mint.supply;

        let lst_to_mint: u64 = if lst_supply == 0 || total_staked_before == 0 {
            lamports
        } else {
            ((lamports as u128)
                .checked_mul(lst_supply as u128)
                .ok_or(LstError::Overflow)?
                / total_staked_before as u128)
                .try_into()
                .map_err(|_| LstError::Overflow)?
        };
        require!(lst_to_mint > 0, LstError::InsufficientAmount);

        system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.key(),
                SystemTransfer { from: ctx.accounts.staker.to_account_info(), to: ctx.accounts.pool.to_account_info() },
            ),
            lamports,
        )?;

        let bump = ctx.bumps.pool;
        let signer_seeds: &[&[&[u8]]] = &[&[b"pool", &[bump]]];
        token::mint_to(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.key(),
                MintTo { mint: ctx.accounts.lst_mint.to_account_info(), to: ctx.accounts.staker_lst_account.to_account_info(), authority: ctx.accounts.pool.to_account_info() },
                signer_seeds,
            ),
            lst_to_mint,
        )?;

        Ok(())
    }

    pub fn simulate_rewards(ctx: Context<SimulateRewards>, reward_lamports: u64) -> Result<()> {
        require!(reward_lamports > 0, LstError::ZeroAmount);
        // Concept 11: an explicit stand-in for real validator rewards,
        // which land automatically at epoch boundaries in a real pool.
        system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.key(),
                SystemTransfer { from: ctx.accounts.admin.to_account_info(), to: ctx.accounts.pool.to_account_info() },
            ),
            reward_lamports,
        )
    }

    pub fn request_unstake(ctx: Context<RequestUnstake>, _nonce: u64, lst_amount: u64) -> Result<()> {
        require!(lst_amount > 0, LstError::ZeroAmount);

        let total_staked = ctx
            .accounts
            .pool
            .to_account_info()
            .lamports()
            .checked_sub(ctx.accounts.pool.rent_exempt_reserve)
            .ok_or(LstError::Overflow)?;
        let lst_supply = ctx.accounts.lst_mint.supply;

        let lamports_owed: u64 = ((lst_amount as u128)
            .checked_mul(total_staked as u128)
            .ok_or(LstError::Overflow)?
            / lst_supply as u128)
            .try_into()
            .map_err(|_| LstError::Overflow)?;

        token::burn(
            CpiContext::new(
                ctx.accounts.token_program.key(),
                Burn { mint: ctx.accounts.lst_mint.to_account_info(), from: ctx.accounts.staker_lst_account.to_account_info(), authority: ctx.accounts.staker.to_account_info() },
            ),
            lst_amount,
        )?;

        let clock = Clock::get()?;
        let ticket = &mut ctx.accounts.ticket;
        ticket.staker = ctx.accounts.staker.key();
        ticket.lamports_owed = lamports_owed;
        ticket.ready_at = clock.unix_timestamp.checked_add(COOLDOWN_SECONDS).ok_or(LstError::Overflow)?;
        Ok(())
    }

    pub fn claim_unstake(ctx: Context<ClaimUnstake>) -> Result<()> {
        let clock = Clock::get()?;
        require!(clock.unix_timestamp >= ctx.accounts.ticket.ready_at, LstError::TooEarly);

        let amount = ctx.accounts.ticket.lamports_owed;
        **ctx.accounts.pool.to_account_info().try_borrow_mut_lamports()? -= amount;
        **ctx.accounts.staker.to_account_info().try_borrow_mut_lamports()? += amount;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializePool<'info> {
    #[account(init, payer = admin, space = 8 + Pool::SIZE, seeds = [b"pool"], bump)]
    pub pool: Account<'info, Pool>,
    #[account(init, payer = admin, seeds = [b"lst-mint"], bump, mint::decimals = 9, mint::authority = pool)]
    pub lst_mint: Account<'info, Mint>,
    #[account(mut)]
    pub admin: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct Stake<'info> {
    #[account(mut, seeds = [b"pool"], bump)]
    pub pool: Account<'info, Pool>,
    #[account(mut, seeds = [b"lst-mint"], bump)]
    pub lst_mint: Account<'info, Mint>,
    #[account(mut)]
    pub staker: Signer<'info>,
    #[account(mut)]
    pub staker_lst_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SimulateRewards<'info> {
    #[account(mut, seeds = [b"pool"], bump)]
    pub pool: Account<'info, Pool>,
    #[account(mut)]
    pub admin: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(nonce: u64)]
pub struct RequestUnstake<'info> {
    #[account(mut, seeds = [b"pool"], bump)]
    pub pool: Account<'info, Pool>,
    #[account(mut, seeds = [b"lst-mint"], bump)]
    pub lst_mint: Account<'info, Mint>,
    #[account(init, payer = staker, space = 8 + UnstakeTicket::SIZE, seeds = [b"ticket", staker.key().as_ref(), nonce.to_le_bytes().as_ref()], bump)]
    pub ticket: Account<'info, UnstakeTicket>,
    #[account(mut)]
    pub staker: Signer<'info>,
    #[account(mut)]
    pub staker_lst_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ClaimUnstake<'info> {
    #[account(mut, seeds = [b"pool"], bump)]
    pub pool: Account<'info, Pool>,
    #[account(mut, close = staker, has_one = staker)]
    pub ticket: Account<'info, UnstakeTicket>,
    #[account(mut)]
    pub staker: Signer<'info>,
}

#[account]
pub struct Pool {
    pub lst_mint: Pubkey,
    pub rent_exempt_reserve: u64,
}
impl Pool {
    pub const SIZE: usize = 32 + 8;
}

#[account]
pub struct UnstakeTicket {
    pub staker: Pubkey,
    pub lamports_owed: u64,
    pub ready_at: i64,
}
impl UnstakeTicket {
    pub const SIZE: usize = 32 + 8 + 8;
}

#[error_code]
pub enum LstError {
    #[msg("Amount must be greater than zero")]
    ZeroAmount,
    #[msg("Amount too small to mint or redeem any LST")]
    InsufficientAmount,
    #[msg("The cooldown period has not elapsed yet")]
    TooEarly,
    #[msg("Arithmetic overflow")]
    Overflow,
}