use anchor_lang::prelude::*;

declare_id!("9C18a5FF8qcPZKG1aTnprVdC82trq4Wa4ppGhhW2GxJi");

#[program]
pub mod counter_events {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        counter.owner = ctx.accounts.owner.key();
        counter.value = 0;
        Ok(())
    }

    pub fn increment(ctx: Context<Increment>, amount: u64) -> Result<()> {
        require!(amount > 0, CounterError::ZeroAmount);
        let counter = &mut ctx.accounts.counter;
        counter.value = counter.value.checked_add(amount).ok_or(CounterError::Overflow)?;

        emit!(CounterIncremented {
            owner: counter.owner,
            amount,
            new_value: counter.value,
        });

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = owner, space = 8 + Counter::SIZE, seeds = [b"counter", owner.key().as_ref()], bump)]
    pub counter: Account<'info, Counter>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Increment<'info> {
    #[account(mut, seeds = [b"counter", owner.key().as_ref()], bump, has_one = owner)]
    pub counter: Account<'info, Counter>,
    pub owner: Signer<'info>,
}

#[account]
pub struct Counter {
    pub owner: Pubkey,
    pub value: u64,
}
impl Counter {
    pub const SIZE: usize = 32 + 8;
}

#[event]
pub struct CounterIncremented {
    pub owner: Pubkey,
    pub amount: u64,
    pub new_value: u64,
}

#[error_code]
pub enum CounterError {
    #[msg("Amount must be greater than zero")]
    ZeroAmount,
    #[msg("Arithmetic overflow")]
    Overflow,
}