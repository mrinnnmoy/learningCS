use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

declare_id!("2ext2KEFSdtStDAHcyBmVNfXJXt9wih9awJme2gDYHKJ");

#[program]
pub mod per_user_vault {
    use super::*;

    pub fn initialize_vault(_ctx: Context<InitializeVault>) -> Result<()> {
        Ok(())
    }

    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        require!(amount > 0, VaultError::ZeroAmount);

        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.key(),
                Transfer {
                    from: ctx.accounts.owner_token_account.to_account_info(),
                    to: ctx.accounts.vault.to_account_info(),
                    authority: ctx.accounts.owner.to_account_info(),
                },
            ),
            amount,
        )?;

        Ok(())
    }

    pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
        require!(amount > 0, VaultError::ZeroAmount);

        let owner_key = ctx.accounts.owner.key();
        let bump = ctx.bumps.vault_authority;
        let signer_seeds: &[&[&[u8]]] = &[&[b"vault-authority", owner_key.as_ref(), &[bump]]];

        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.key(),
                Transfer {
                    from: ctx.accounts.vault.to_account_info(),
                    to: ctx.accounts.owner_token_account.to_account_info(),
                    authority: ctx.accounts.vault_authority.to_account_info(),
                },
                signer_seeds,
            ),
            amount,
        )?;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeVault<'info> {
    // Seeds include owner.key() — the Concept 5 fix. A vulnerable
    // version using seeds = [b"vault"] alone would resolve every
    // user's vault to the SAME PDA, silently colliding.
    #[account(
        init,
        payer = owner,
        seeds = [b"vault", owner.key().as_ref()],
        bump,
        token::mint = mint,
        token::authority = vault_authority,
    )]
    pub vault: Account<'info, TokenAccount>,
    /// CHECK: PDA authority only — validated by the seeds constraint,
    /// nothing else about it needs checking.
    #[account(seeds = [b"vault-authority", owner.key().as_ref()], bump)]
    pub vault_authority: UncheckedAccount<'info>,
    pub mint: Account<'info, Mint>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(mut, seeds = [b"vault", owner.key().as_ref()], bump)]
    pub vault: Account<'info, TokenAccount>,
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(mut)]
    pub owner_token_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut, seeds = [b"vault", owner.key().as_ref()], bump)]
    pub vault: Account<'info, TokenAccount>,
    /// CHECK: PDA authority only — validated by the seeds constraint.
    #[account(seeds = [b"vault-authority", owner.key().as_ref()], bump)]
    pub vault_authority: UncheckedAccount<'info>,
    pub owner: Signer<'info>,
    #[account(mut)]
    pub owner_token_account: Account<'info, TokenAccount>,
    // The Concept 8 fix — Program<'info, Token> checks this account's
    // OWN pubkey equals Token::id() before the instruction body runs.
    // An UncheckedAccount here would accept ANY program address
    // silently, the arbitrary-CPI vulnerability this assignment
    // demonstrates directly in the test below.
    pub token_program: Program<'info, Token>,
}

#[error_code]
pub enum VaultError {
    #[msg("Amount must be greater than zero")]
    ZeroAmount,
}