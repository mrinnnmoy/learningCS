use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

declare_id!("Fpb3pB8C9rbBnedH7nzxmGUi3HP2hcQHsGDvLTVU8qrk");

#[program]
pub mod subscription_vault {
    use super::*;

    pub fn create_subscription(ctx: Context<CreateSubscription>, amount_per_period: u64, period_seconds: i64) -> Result<()> {
        require!(amount_per_period > 0 && period_seconds > 0, SubscriptionError::ZeroAmount);
        let clock = Clock::get()?;

        let sub = &mut ctx.accounts.subscription;

        sub.subscriber = ctx.accounts.subscriber.key();
        sub.merchant = ctx.accounts.merchant.key();
        sub.amount_per_period = amount_per_period;
        sub.period_seconds = period_seconds;

        // First charge becomes available only after one full period.
        sub.next_charge_ts = clock
            .unix_timestamp
            .checked_add(period_seconds)
            .ok_or(SubscriptionError::Overflow)?;

        Ok(())
    }

    pub fn top_up(ctx: Context<TopUp>, amount: u64) -> Result<()> {
        require!(amount > 0, SubscriptionError::ZeroAmount);
        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.key(),
                Transfer {
                    from: ctx.accounts.subscriber_token_account.to_account_info(),
                    to: ctx.accounts.vault.to_account_info(),
                    authority: ctx.accounts.subscriber.to_account_info(),
                },
            ),
            amount,
        )
    }

    pub fn charge(ctx: Context<Charge>) -> Result<()> {
        let clock = Clock::get()?;
        let sub = &ctx.accounts.subscription;
        require!(clock.unix_timestamp >= sub.next_charge_ts, SubscriptionError::TooEarly);
        require!(ctx.accounts.vault.amount >= sub.amount_per_period, SubscriptionError::InsufficientFunds);

        let subscriber_key = sub.subscriber;
        let merchant_key = sub.merchant;
        let bump = ctx.bumps.vault_authority;
        let signer_seeds: &[&[&[u8]]] = &[&[b"vault-authority", subscriber_key.as_ref(), merchant_key.as_ref(), &[bump]]];
        let amount = sub.amount_per_period;

        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.key(),
                Transfer {
                    from: ctx.accounts.vault.to_account_info(),
                    to: ctx.accounts.merchant_token_account.to_account_info(),
                    authority: ctx.accounts.vault_authority.to_account_info(),
                },
                signer_seeds,
            ),
            amount,
        )?;

        let sub = &mut ctx.accounts.subscription;
        sub.next_charge_ts = sub
            .next_charge_ts
            .checked_add(sub.period_seconds)
            .ok_or(SubscriptionError::Overflow)?;
        Ok(())
    }

    pub fn cancel_subscription(ctx: Context<CancelSubscription>) -> Result<()> {
        let remaining = ctx.accounts.vault.amount;
        if remaining > 0 {
            let subscriber_key = ctx.accounts.subscription.subscriber;
            let merchant_key = ctx.accounts.subscription.merchant;
            let bump = ctx.bumps.vault_authority;
            let signer_seeds: &[&[&[u8]]] = &[&[b"vault-authority", subscriber_key.as_ref(), merchant_key.as_ref(), &[bump]]];

            token::transfer(
                CpiContext::new_with_signer(
                    ctx.accounts.token_program.key(),
                    Transfer {
                        from: ctx.accounts.vault.to_account_info(),
                        to: ctx.accounts.subscriber_token_account.to_account_info(),
                        authority: ctx.accounts.vault_authority.to_account_info(),
                    },
                    signer_seeds,
                ),
                remaining,
            )?;
        }
        Ok(())
    }
}

#[derive(Accounts)]
pub struct CreateSubscription<'info> {
    #[account(
        init, payer = subscriber, space = 8 + Subscription::SIZE,
        seeds = [b"subscription", subscriber.key().as_ref(), merchant.key().as_ref()], bump,
    )]
    pub subscription: Account<'info, Subscription>,
    /// CHECK: PDA authority only — validated by the seeds constraint.
    #[account(seeds = [b"vault-authority", subscriber.key().as_ref(), merchant.key().as_ref()], bump)]
    pub vault_authority: UncheckedAccount<'info>,
    #[account(
        init, payer = subscriber,
        seeds = [b"vault", subscriber.key().as_ref(), merchant.key().as_ref()], bump,
        token::mint = mint, token::authority = vault_authority,
    )]
    pub vault: Account<'info, TokenAccount>,
    pub mint: Account<'info, Mint>,
    #[account(mut)]
    pub subscriber: Signer<'info>,
    /// CHECK: only ever read for its pubkey, stored, never deserialized.
    pub merchant: UncheckedAccount<'info>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct TopUp<'info> {
    #[account(seeds = [b"subscription", subscriber.key().as_ref(), subscription.merchant.as_ref()], bump, has_one = subscriber)]
    pub subscription: Account<'info, Subscription>,
    #[account(mut, seeds = [b"vault", subscriber.key().as_ref(), subscription.merchant.as_ref()], bump)]
    pub vault: Account<'info, TokenAccount>,
    pub subscriber: Signer<'info>,
    #[account(mut)]
    pub subscriber_token_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct Charge<'info> {
    #[account(mut, seeds = [b"subscription", subscription.subscriber.as_ref(), merchant.key().as_ref()], bump, has_one = merchant)]
    pub subscription: Account<'info, Subscription>,
    /// CHECK: PDA authority only — validated by the seeds constraint.
    #[account(seeds = [b"vault-authority", subscription.subscriber.as_ref(), merchant.key().as_ref()], bump)]
    pub vault_authority: UncheckedAccount<'info>,
    #[account(mut, seeds = [b"vault", subscription.subscriber.as_ref(), merchant.key().as_ref()], bump)]
    pub vault: Account<'info, TokenAccount>,
    pub merchant: Signer<'info>,
    #[account(mut)]
    pub merchant_token_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct CancelSubscription<'info> {
    #[account(
        mut, close = subscriber,
        seeds = [b"subscription", subscriber.key().as_ref(), subscription.merchant.as_ref()], bump,
        has_one = subscriber,
    )]
    pub subscription: Account<'info, Subscription>,
    /// CHECK: PDA authority only — validated by the seeds constraint.
    #[account(seeds = [b"vault-authority", subscriber.key().as_ref(), subscription.merchant.as_ref()], bump)]
    pub vault_authority: UncheckedAccount<'info>,
    #[account(mut, seeds = [b"vault", subscriber.key().as_ref(), subscription.merchant.as_ref()], bump)]
    pub vault: Account<'info, TokenAccount>,
    #[account(mut)]
    pub subscriber: Signer<'info>,
    #[account(mut)]
    pub subscriber_token_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[account]
pub struct Subscription {
    pub subscriber: Pubkey,
    pub merchant: Pubkey,
    pub amount_per_period: u64,
    pub period_seconds: i64,
    pub next_charge_ts: i64,
}
impl Subscription {
    pub const SIZE: usize = 32 + 32 + 8 + 8 + 8;
}

#[error_code]
pub enum SubscriptionError {
    #[msg("Amount must be greater than zero")]
    ZeroAmount,
    #[msg("The next charge period has not been reached yet")]
    TooEarly,
    #[msg("The subscription vault does not have enough funds for this period's charge")]
    InsufficientFunds,
    #[msg("Arithmetic overflow")]
    Overflow,
}