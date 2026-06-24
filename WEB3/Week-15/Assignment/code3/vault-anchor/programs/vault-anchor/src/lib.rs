use anchor_lang::prelude::*;
use anchor_lang::system_program::{self, Transfer};

declare_id!("2wSvvqUyuh7pgWwnAyRumXiZc5Y7jQhYGCYBB34s9HF6");

#[program]
pub mod vault_anchor {
    use super::*;

    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        // A real signer (the depositor) already authorizes this
        // transaction — a plain CpiContext::new (no seeds) is enough,
        // exactly Week 14's plain invoke() case.
        let cpi_ctx = CpiContext::new(
            ctx.accounts.system_program.key(),
            Transfer {
                from: ctx.accounts.depositor.to_account_info(),
                to: ctx.accounts.vault.to_account_info(),
            },
        );
        system_program::transfer(cpi_ctx, amount)?;
        Ok(())
    }

    pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
        require!(
            ctx.accounts.vault.lamports() >= amount,
            VaultError::InsufficientVaultFunds
        );

        let depositor_key = ctx.accounts.depositor.key();
        let bump = ctx.bumps.vault;
        let signer_seeds: &[&[&[u8]]] = &[&[b"vault", depositor_key.as_ref(), &[bump]]];

        // The vault PDA has no private key (Week 13, Concept 2) —
        // new_with_signer is CpiContext's version of invoke_signed
        // (Week 14, Concept 6), same runtime mechanism underneath.
        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.system_program.key(),
            Transfer {
                from: ctx.accounts.vault.to_account_info(),
                to: ctx.accounts.depositor.to_account_info(),
            },
            signer_seeds,
        );
        system_program::transfer(cpi_ctx, amount)?;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Deposit<'info> {
    /// CHECK: a plain, dataless, System-Program-owned PDA — nothing
    /// to deserialize, so Anchor's SystemAccount wrapper (rather than
    /// Account<'info, T>) is the correct, honest type for it here.
    #[account(mut, seeds = [b"vault", depositor.key().as_ref()], bump)]
    pub vault: SystemAccount<'info>,
    #[account(mut)]
    pub depositor: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut, seeds = [b"vault", depositor.key().as_ref()], bump)]
    pub vault: SystemAccount<'info>,
    #[account(mut)]
    pub depositor: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[error_code]
pub enum VaultError {
    #[msg("Vault does not hold enough lamports for this withdrawal")]
    InsufficientVaultFunds,
}
