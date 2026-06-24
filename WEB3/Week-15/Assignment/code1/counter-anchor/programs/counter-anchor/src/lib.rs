use anchor_lang::prelude::*;

declare_id!("8Usiwh28LZ451hEpwmjLiJVcY2QsXa8SsrSpcmr2vy7e");

#[program]
pub mod counter_anchor {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        ctx.accounts.counter.count = 0;
        Ok(())
    }

    pub fn increment(ctx: Context<Increment>) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        counter.count = counter.count.checked_add(1).ok_or(CounterError::Overflow)?;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    // Discriminator (8 bytes, Concept 3) + count: u64 (8 bytes).
    #[account(
        init,
        payer = payer,
        space = 8 + 8,
        seeds = [b"counter", payer.key().as_ref()],
        bump,
    )]
    pub counter: Account<'info, CounterAccount>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Increment<'info> {
    #[account(
        mut,
        seeds = [b"counter", payer.key().as_ref()],
        bump,
    )]
    pub counter: Account<'info, CounterAccount>,
    pub payer: Signer<'info>,
}

#[account]
pub struct CounterAccount {
    pub count: u64,
}

#[error_code]
pub enum CounterError {
    #[msg("Counter overflowed")]
    Overflow,
}