use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, MintTo, Token, TokenAccount, Transfer};

declare_id!("E35JNQp6VccPEJoBmxkkv485PuCiEu3qoVJCvYaruuj");

const REWARD_RATE_BPS: u64 = 1000; // 10% illustrative APR
const BPS_DENOMINATOR: u64 = 10_000;
const SECONDS_PER_YEAR: i64 = 31_536_000;

#[program]
pub mod staking_program {
    use super::*;

    pub fn initialize_vault(_ctx: Context<InitializeVault>) -> Result<()> {
        Ok(())
    }

    pub fn stake(ctx: Context<Stake>, amount: u64, lock_duration_seconds: i64) -> Result<()> {
        require!(amount > 0, StakingError::ZeroAmount);
        require!(lock_duration_seconds > 0, StakingError::InvalidLockDuration);

        // Anchor 1.x: CpiContext::new takes the program's Pubkey, not its
        // AccountInfo — the redundant AccountInfo field was removed from
        // CpiContext itself.
        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.key(),
                Transfer {
                    from: ctx.accounts.staker_token_account.to_account_info(),
                    to: ctx.accounts.vault.to_account_info(),
                    authority: ctx.accounts.staker.to_account_info(),
                },
            ),
            amount,
        )?;

        let clock = Clock::get()?;
        let position = &mut ctx.accounts.stake_position;
        position.staker = ctx.accounts.staker.key();
        position.amount = amount;
        position.deposited_at = clock.unix_timestamp;
        position.unlock_at = clock
            .unix_timestamp
            .checked_add(lock_duration_seconds)
            .ok_or(StakingError::Overflow)?;
        position.state = PositionState::Active;

        Ok(())
    }

    pub fn unstake(ctx: Context<Unstake>) -> Result<()> {
        require!(
            ctx.accounts.stake_position.state == PositionState::Active,
            StakingError::AlreadyUnstaked
        );

        let clock = Clock::get()?;
        require!(
            clock.unix_timestamp >= ctx.accounts.stake_position.unlock_at,
            StakingError::StillLocked
        );

        let elapsed = clock
            .unix_timestamp
            .checked_sub(ctx.accounts.stake_position.deposited_at)
            .ok_or(StakingError::Overflow)?;
        let amount = ctx.accounts.stake_position.amount;

        let reward = (amount as u128)
            .checked_mul(REWARD_RATE_BPS as u128)
            .ok_or(StakingError::Overflow)?
            .checked_mul(elapsed as u128)
            .ok_or(StakingError::Overflow)?
            .checked_div(BPS_DENOMINATOR as u128)
            .ok_or(StakingError::Overflow)?
            .checked_div(SECONDS_PER_YEAR as u128)
            .ok_or(StakingError::Overflow)? as u64;

        let bump = ctx.bumps.authority;
        let signer_seeds: &[&[&[u8]]] = &[&[b"authority", &[bump]]];

        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.key(),
                Transfer {
                    from: ctx.accounts.vault.to_account_info(),
                    to: ctx.accounts.staker_token_account.to_account_info(),
                    authority: ctx.accounts.authority.to_account_info(),
                },
                signer_seeds,
            ),
            amount,
        )?;

        if reward > 0 {
            token::mint_to(
                CpiContext::new_with_signer(
                    ctx.accounts.token_program.key(),
                    MintTo {
                        mint: ctx.accounts.mint.to_account_info(),
                        to: ctx.accounts.staker_token_account.to_account_info(),
                        authority: ctx.accounts.authority.to_account_info(),
                    },
                    signer_seeds,
                ),
                reward,
            )?;
        }

        ctx.accounts.stake_position.state = PositionState::Withdrawn;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeVault<'info> {
    #[account(
        init,
        payer = payer,
        seeds = [b"vault"],
        bump,
        token::mint = mint,
        token::authority = authority,
    )]
    pub vault: Account<'info, TokenAccount>,
    /// CHECK: PDA authority only — validated by the seeds constraint,
    /// nothing else about it needs checking.
    #[account(seeds = [b"authority"], bump)]
    pub authority: UncheckedAccount<'info>,
    pub mint: Account<'info, Mint>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct Stake<'info> {
    #[account(
        init,
        payer = staker,
        space = 8 + StakePosition::SIZE,
        seeds = [b"position", staker.key().as_ref()],
        bump,
    )]
    pub stake_position: Account<'info, StakePosition>,
    #[account(mut)]
    pub staker: Signer<'info>,
    #[account(mut)]
    pub staker_token_account: Account<'info, TokenAccount>,
    #[account(mut, seeds = [b"vault"], bump)]
    pub vault: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
    // Required for `init` on stake_position above: Anchor's `init`
    // constraint itself CPIs into the System Program to create the
    // account, so system_program has to be present in this struct
    // (this was a real bug in the original template, unrelated to the
    // Anchor 1.x upgrade — anchor build never surfaced it as a version
    // mismatch, only as a missing-account error).
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Unstake<'info> {
    #[account(
        mut,
        seeds = [b"position", staker.key().as_ref()],
        bump,
    )]
    pub stake_position: Account<'info, StakePosition>,
    pub staker: Signer<'info>,
    #[account(mut)]
    pub staker_token_account: Account<'info, TokenAccount>,
    #[account(mut, seeds = [b"vault"], bump)]
    pub vault: Account<'info, TokenAccount>,
    #[account(mut)]
    pub mint: Account<'info, Mint>,
    /// CHECK: PDA authority only — validated by the seeds constraint.
    #[account(seeds = [b"authority"], bump)]
    pub authority: UncheckedAccount<'info>,
    pub token_program: Program<'info, Token>,
}

#[account]
pub struct StakePosition {
    pub staker: Pubkey,
    pub amount: u64,
    pub deposited_at: i64,
    pub unlock_at: i64,
    pub state: PositionState,
}
impl StakePosition {
    pub const SIZE: usize = 32 + 8 + 8 + 8 + 1;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum PositionState {
    Active,
    Withdrawn,
}

#[error_code]
pub enum StakingError {
    #[msg("Amount must be greater than zero")]
    ZeroAmount,
    #[msg("Lock duration must be greater than zero")]
    InvalidLockDuration,
    #[msg("Tokens are still locked")]
    StillLocked,
    #[msg("This position has already been unstaked")]
    AlreadyUnstaked,
    #[msg("Arithmetic overflow")]
    Overflow,
}