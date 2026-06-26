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
        let counter_key = ctx.accounts.counter.key();

        let counter = &mut ctx.accounts.counter;

        counter.count = counter
            .count
            .checked_add(1)
            .ok_or(CounterError::Overflow)?;

        emit!(CounterIncremented {
            counter: counter_key,
            new_count: counter.count,
        });

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
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

#[event]
pub struct CounterIncremented {
    pub counter: Pubkey,
    pub new_count: u64,
}

#[error_code]
pub enum CounterError {
    #[msg("Counter overflowed")]
    Overflow,
}