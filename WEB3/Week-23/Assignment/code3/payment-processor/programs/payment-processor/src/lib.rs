use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

declare_id!("3Rkdh4CN9z3B8czZARv1dGSkpW9T7Vgozm4UUz8XZQeC");

#[program]
pub mod payment_processor {
    use super::*;

    pub fn pay(ctx: Context<Pay>, order_id: u64, amount: u64) -> Result<()> {
        require!(amount > 0, PaymentError::ZeroAmount);

        // Concept 12: the customer authorizes the transfer; the fee
        // and this account's rent are covered by the relayer instead
        // (payer = relayer in the InitializeVault-equivalent below).
        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.key(),
                Transfer {
                    from: ctx.accounts.customer_token_account.to_account_info(),
                    to: ctx.accounts.merchant_token_account.to_account_info(),
                    authority: ctx.accounts.customer.to_account_info(),
                },
            ),
            amount,
        )?;

        let payment = &mut ctx.accounts.payment;
        payment.payer = ctx.accounts.customer.key();
        payment.merchant = ctx.accounts.merchant.key();
        payment.mint = ctx.accounts.mint.key();
        payment.amount = amount;
        payment.order_id = order_id;
        payment.status = PaymentStatus::Paid;
        Ok(())
    }

    pub fn refund(ctx: Context<Refund>) -> Result<()> {
        require!(ctx.accounts.payment.status == PaymentStatus::Paid, PaymentError::AlreadyRefunded);

        let amount = ctx.accounts.payment.amount;
        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.key(),
                Transfer {
                    from: ctx.accounts.merchant_token_account.to_account_info(),
                    to: ctx.accounts.customer_token_account.to_account_info(),
                    authority: ctx.accounts.merchant.to_account_info(),
                },
            ),
            amount,
        )?;

        ctx.accounts.payment.status = PaymentStatus::Refunded;
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(order_id: u64)]
pub struct Pay<'info> {
    #[account(
        init,
        payer = relayer,
        space = 8 + Payment::SIZE,
        seeds = [b"payment", merchant.key().as_ref(), order_id.to_le_bytes().as_ref()],
        bump,
    )]
    pub payment: Account<'info, Payment>,
    pub customer: Signer<'info>,
    #[account(mut)]
    pub relayer: Signer<'info>,
    #[account(mut)]
    pub customer_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub merchant_token_account: Account<'info, TokenAccount>,
    /// CHECK: only ever read for its pubkey, stored, never deserialized.
    pub merchant: UncheckedAccount<'info>,
    pub mint: Account<'info, Mint>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Refund<'info> {
    #[account(mut, seeds = [b"payment", merchant.key().as_ref(), payment.order_id.to_le_bytes().as_ref()], bump, has_one = merchant)]
    pub payment: Account<'info, Payment>,
    pub merchant: Signer<'info>,
    #[account(mut)]
    pub merchant_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub customer_token_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[account]
pub struct Payment {
    pub payer: Pubkey,
    pub merchant: Pubkey,
    pub mint: Pubkey,
    pub amount: u64,
    pub order_id: u64,
    pub status: PaymentStatus,
}
impl Payment {
    pub const SIZE: usize = 32 + 32 + 32 + 8 + 8 + 1;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum PaymentStatus {
    Paid,
    Refunded,
}

#[error_code]
pub enum PaymentError {
    #[msg("Amount must be greater than zero")]
    ZeroAmount,
    #[msg("This payment has already been refunded")]
    AlreadyRefunded,
}