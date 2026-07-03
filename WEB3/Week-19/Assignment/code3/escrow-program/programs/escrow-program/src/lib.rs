
use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

declare_id!("4pdehRChod4tVoutSJoaW4KGoGFCDdbYNVDk4hYBDjQ9");

#[program]
pub mod escrow_program {
    use super::*;

    pub fn make(ctx: Context<Make>, amount_a: u64, amount_b: u64) -> Result<()> {
        require!(amount_a > 0 && amount_b > 0, EscrowError::ZeroAmount);

        // Anchor 1.x: CpiContext::new takes the program's Pubkey, not its
        // AccountInfo (same change as Easy/Week 19's staking program).
        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.key(),
                Transfer {
                    from: ctx.accounts.maker_token_a.to_account_info(),
                    to: ctx.accounts.vault.to_account_info(),
                    authority: ctx.accounts.maker.to_account_info(),
                },
            ),
            amount_a,
        )?;

        let escrow = &mut ctx.accounts.escrow;
        escrow.maker = ctx.accounts.maker.key();
        escrow.mint_a = ctx.accounts.mint_a.key();
        escrow.mint_b = ctx.accounts.mint_b.key();
        escrow.amount_a = amount_a;
        escrow.amount_b = amount_b;
        escrow.state = EscrowStatus::Open;

        Ok(())
    }

    pub fn take(ctx: Context<Take>) -> Result<()> {
        require!(ctx.accounts.escrow.state == EscrowStatus::Open, EscrowError::NotOpen);

        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.key(),
                Transfer {
                    from: ctx.accounts.taker_token_b.to_account_info(),
                    to: ctx.accounts.maker_token_b.to_account_info(),
                    authority: ctx.accounts.taker.to_account_info(),
                },
            ),
            ctx.accounts.escrow.amount_b,
        )?;

        let maker_key = ctx.accounts.escrow.maker;
        let bump = ctx.bumps.vault_authority;
        let signer_seeds: &[&[&[u8]]] = &[&[b"escrow-vault-authority", maker_key.as_ref(), &[bump]]];

        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.key(),
                Transfer {
                    from: ctx.accounts.vault.to_account_info(),
                    to: ctx.accounts.taker_token_a.to_account_info(),
                    authority: ctx.accounts.vault_authority.to_account_info(),
                },
                signer_seeds,
            ),
            ctx.accounts.escrow.amount_a,
        )?;

        ctx.accounts.escrow.state = EscrowStatus::Fulfilled;
        Ok(())
    }

    pub fn cancel(ctx: Context<Cancel>) -> Result<()> {
        require!(ctx.accounts.escrow.state == EscrowStatus::Open, EscrowError::NotOpen);
        require!(ctx.accounts.maker.key() == ctx.accounts.escrow.maker, EscrowError::NotMaker);

        let maker_key = ctx.accounts.escrow.maker;
        let bump = ctx.bumps.vault_authority;
        let signer_seeds: &[&[&[u8]]] = &[&[b"escrow-vault-authority", maker_key.as_ref(), &[bump]]];

        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.key(),
                Transfer {
                    from: ctx.accounts.vault.to_account_info(),
                    to: ctx.accounts.maker_token_a.to_account_info(),
                    authority: ctx.accounts.vault_authority.to_account_info(),
                },
                signer_seeds,
            ),
            ctx.accounts.escrow.amount_a,
        )?;

        ctx.accounts.escrow.state = EscrowStatus::Cancelled;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Make<'info> {
    #[account(
        init,
        payer = maker,
        space = 8 + EscrowState::SIZE,
        seeds = [b"escrow", maker.key().as_ref()],
        bump,
    )]
    pub escrow: Account<'info, EscrowState>,
    #[account(
        init,
        payer = maker,
        seeds = [b"escrow-vault", maker.key().as_ref()],
        bump,
        token::mint = mint_a,
        token::authority = vault_authority,
    )]
    pub vault: Account<'info, TokenAccount>,
    /// CHECK: PDA authority only — validated by the seeds constraint.
    #[account(seeds = [b"escrow-vault-authority", maker.key().as_ref()], bump)]
    pub vault_authority: UncheckedAccount<'info>,
    #[account(mut)]
    pub maker: Signer<'info>,
    #[account(mut)]
    pub maker_token_a: Account<'info, TokenAccount>,
    pub mint_a: Account<'info, Mint>,
    pub mint_b: Account<'info, Mint>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct Take<'info> {
    #[account(mut, seeds = [b"escrow", escrow.maker.as_ref()], bump)]
    pub escrow: Account<'info, EscrowState>,
    #[account(mut, seeds = [b"escrow-vault", escrow.maker.as_ref()], bump)]
    pub vault: Account<'info, TokenAccount>,
    /// CHECK: PDA authority only — validated by the seeds constraint.
    #[account(seeds = [b"escrow-vault-authority", escrow.maker.as_ref()], bump)]
    pub vault_authority: UncheckedAccount<'info>,
    #[account(mut)]
    pub taker: Signer<'info>,
    #[account(mut)]
    pub taker_token_a: Account<'info, TokenAccount>,
    #[account(mut)]
    pub taker_token_b: Account<'info, TokenAccount>,
    #[account(mut)]
    pub maker_token_b: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct Cancel<'info> {
    #[account(mut, seeds = [b"escrow", escrow.maker.as_ref()], bump)]
    pub escrow: Account<'info, EscrowState>,
    #[account(mut, seeds = [b"escrow-vault", escrow.maker.as_ref()], bump)]
    pub vault: Account<'info, TokenAccount>,
    /// CHECK: PDA authority only — validated by the seeds constraint.
    #[account(seeds = [b"escrow-vault-authority", escrow.maker.as_ref()], bump)]
    pub vault_authority: UncheckedAccount<'info>,
    pub maker: Signer<'info>,
    #[account(mut)]
    pub maker_token_a: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[account]
pub struct EscrowState {
    pub maker: Pubkey,
    pub mint_a: Pubkey,
    pub mint_b: Pubkey,
    pub amount_a: u64,
    pub amount_b: u64,
    pub state: EscrowStatus,
}
impl EscrowState {
    pub const SIZE: usize = 32 + 32 + 32 + 8 + 8 + 1;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum EscrowStatus {
    Open,
    Fulfilled,
    Cancelled,
}

#[error_code]
pub enum EscrowError {
    #[msg("Both amounts must be greater than zero")]
    ZeroAmount,
    #[msg("This escrow is not open")]
    NotOpen,
    #[msg("Only the original maker can cancel this escrow")]
    NotMaker,
}