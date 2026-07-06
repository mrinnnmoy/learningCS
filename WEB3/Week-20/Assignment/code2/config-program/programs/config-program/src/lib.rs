use anchor_lang::prelude::*;

declare_id!("BR9JoeTRjCmtNJMnaa76uExjcvQbX9yMgPy3cgwWcGt8");

#[program]
pub mod config_program {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, fee_bps: u16) -> Result<()> {
        require!(fee_bps <= 10_000, ConfigError::InvalidFee);

        let config = &mut ctx.accounts.config;
        config.admin = ctx.accounts.admin.key();
        config.fee_bps = fee_bps;
        Ok(())
    }

    pub fn update_fee(ctx: Context<UpdateFee>, new_fee_bps: u16) -> Result<()> {
        require!(new_fee_bps <= 10_000, ConfigError::InvalidFee);

        ctx.accounts.config.fee_bps = new_fee_bps;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = admin,
        space = 8 + Config::SIZE,
        seeds = [b"config"],
        bump,
    )]
    pub config: Account<'info, Config>,
    #[account(mut)]
    pub admin: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateFee<'info> {
    // The load-bearing line: `has_one = admin` requires config.admin to
    // equal the pubkey of whichever account is passed as `admin` below,
    // AND `admin` is typed Signer, so it must also have signed this
    // transaction. Removing EITHER half breaks this (Concept 2 alone
    // without Concept 3's ownership tie, or vice versa).
    #[account(mut, seeds = [b"config"], bump, has_one = admin)]
    pub config: Account<'info, Config>,
    pub admin: Signer<'info>,
}

#[account]
pub struct Config {
    pub admin: Pubkey,
    pub fee_bps: u16,
}
impl Config {
    pub const SIZE: usize = 32 + 2;
}

#[error_code]
pub enum ConfigError {
    #[msg("Fee must be at most 10000 basis points (100%)")]
    InvalidFee,
}