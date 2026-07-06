use anchor_lang::prelude::*;

declare_id!("8eMb1hAdTdfkzELvq7rsAjUp7Re4M335Qy8xuvreqTaQ");

#[program]
pub mod overflow_vault {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        vault.owner = ctx.accounts.owner.key();
        vault.balance = 0;
        Ok(())
    }

    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        require!(amount > 0, VaultError::ZeroAmount);

        let vault = &mut ctx.accounts.vault;
        vault.balance = vault
            .balance
            .checked_add(amount)
            .ok_or(VaultError::Overflow)?;

        Ok(())
    }

    pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
        require!(amount > 0, VaultError::ZeroAmount);

        let vault = &mut ctx.accounts.vault;
        vault.balance = vault
            .balance
            .checked_sub(amount)
            .ok_or(VaultError::InsufficientBalance)?;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = owner,
        space = 8 + VaultAccount::SIZE,
        seeds = [b"vault", owner.key().as_ref()],
        bump,
    )]
    pub vault: Account<'info, VaultAccount>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(
        mut,
        seeds = [b"vault", owner.key().as_ref()],
        bump,
        has_one = owner,
    )]
    pub vault: Account<'info, VaultAccount>,
    pub owner: Signer<'info>,
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(
        mut,
        seeds = [b"vault", owner.key().as_ref()],
        bump,
        has_one = owner,
    )]
    pub vault: Account<'info, VaultAccount>,
    pub owner: Signer<'info>,
}

#[account]
pub struct VaultAccount {
    pub owner: Pubkey,
    pub balance: u64,
}
impl VaultAccount {
    pub const SIZE: usize = 32 + 8;
}

#[error_code]
pub enum VaultError {
    #[msg("Amount must be greater than zero")]
    ZeroAmount,
    #[msg("Deposit would overflow the vault's balance")]
    Overflow,
    #[msg("Withdrawal amount exceeds the vault's balance")]
    InsufficientBalance,
}