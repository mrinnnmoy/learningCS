use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

declare_id!("6F1tcqNj6opfNfRkxBxZEbsQPvcrhaHM79gGJhebhDhu");

const MAX_LEVERAGE: u64 = 10;
const MAINTENANCE_MARGIN_BPS: u64 = 625; // 6.25%
const BPS_DENOMINATOR: i64 = 10_000;
const SECONDS_PER_DAY: i64 = 86_400;

fn apply_funding(position: &mut Position, market: &Market, now: i64) -> Result<()> {
    let elapsed = now.checked_sub(position.last_funding_ts).ok_or(PerpError::Overflow)?;
    if elapsed <= 0 {
        return Ok(());
    }
    // Concept 9/14: identical accrual shape to Week 19's staking reward math.
    let payment = (position.size as i128)
        .checked_mul(market.funding_rate_bps as i128)
        .ok_or(PerpError::Overflow)?
        .checked_mul(elapsed as i128)
        .ok_or(PerpError::Overflow)?
        / (BPS_DENOMINATOR as i128 * SECONDS_PER_DAY as i128);

    // Convention: positive size (long) pays when funding_rate_bps is positive.
    let new_collateral = position.collateral as i128 - payment;
    require!(new_collateral >= 0, PerpError::InsufficientCollateral);
    position.collateral = new_collateral as u64;
    position.last_funding_ts = now;
    Ok(())
}

#[program]
pub mod perp_market {
    use super::*;

    pub fn initialize_market(ctx: Context<InitializeMarket>, initial_price: u64, funding_rate_bps: i64) -> Result<()> {
        require!(initial_price > 0, PerpError::ZeroAmount);
        let market = &mut ctx.accounts.market;
        market.authority = ctx.accounts.authority.key();
        market.mint = ctx.accounts.mint.key();
        market.index_price = initial_price;
        market.funding_rate_bps = funding_rate_bps;
        Ok(())
    }

    pub fn update_index_price(ctx: Context<UpdateIndexPrice>, new_price: u64) -> Result<()> {
        require!(new_price > 0, PerpError::ZeroAmount);
        ctx.accounts.market.index_price = new_price;
        Ok(())
    }

    pub fn open_position(ctx: Context<OpenPosition>, collateral_amount: u64, size: i64) -> Result<()> {
        require!(collateral_amount > 0 && size != 0, PerpError::ZeroAmount);

        let notional = (size.unsigned_abs() as u128)
            .checked_mul(ctx.accounts.market.index_price as u128)
            .ok_or(PerpError::Overflow)?;
        let max_notional = (collateral_amount as u128)
            .checked_mul(MAX_LEVERAGE as u128)
            .ok_or(PerpError::Overflow)?;
        require!(notional <= max_notional, PerpError::ExcessiveLeverage);

        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.key(),
                Transfer {
                    from: ctx.accounts.trader_token_account.to_account_info(),
                    to: ctx.accounts.vault.to_account_info(),
                    authority: ctx.accounts.trader.to_account_info(),
                },
            ),
            collateral_amount,
        )?;

        let clock = Clock::get()?;
        let position = &mut ctx.accounts.position;
        position.trader = ctx.accounts.trader.key();
        position.market = ctx.accounts.market.key();
        position.collateral = collateral_amount;
        position.size = size;
        position.entry_price = ctx.accounts.market.index_price;
        position.last_funding_ts = clock.unix_timestamp;
        Ok(())
    }

    pub fn settle_funding(ctx: Context<SettleFunding>) -> Result<()> {
        let clock = Clock::get()?;
        let market = &ctx.accounts.market;
        apply_funding(&mut ctx.accounts.position, market, clock.unix_timestamp)
    }

    pub fn close_position(ctx: Context<ClosePosition>) -> Result<()> {
        let clock = Clock::get()?;
        {
            let market = &ctx.accounts.market;
            apply_funding(&mut ctx.accounts.position, market, clock.unix_timestamp)?;
        }

        let position = &ctx.accounts.position;
        let market = &ctx.accounts.market;
        let pnl = (position.size as i128)
            .checked_mul(market.index_price as i128 - position.entry_price as i128)
            .ok_or(PerpError::Overflow)?;
        let payout_i128 = position.collateral as i128 + pnl;
        let payout: u64 = if payout_i128 < 0 { 0 } else { payout_i128 as u64 };

        let mint_key = ctx.accounts.market.mint;
        let bump = ctx.bumps.market_authority;
        let signer_seeds: &[&[&[u8]]] = &[&[b"market-authority", mint_key.as_ref(), &[bump]]];

        if payout > 0 {
            token::transfer(
                CpiContext::new_with_signer(
                    ctx.accounts.token_program.key(),
                    Transfer {
                        from: ctx.accounts.vault.to_account_info(),
                        to: ctx.accounts.trader_token_account.to_account_info(),
                        authority: ctx.accounts.market_authority.to_account_info(),
                    },
                    signer_seeds,
                ),
                payout,
            )?;
        }

        Ok(())
    }

    pub fn liquidate(ctx: Context<Liquidate>) -> Result<()> {
        let clock = Clock::get()?;
        {
            let market = &ctx.accounts.market;
            apply_funding(&mut ctx.accounts.position, market, clock.unix_timestamp)?;
        }

        let position = &ctx.accounts.position;
        let market = &ctx.accounts.market;
        
        let notional = (position.size.unsigned_abs() as i128)
            .checked_mul(market.index_price as i128)
            .ok_or(PerpError::Overflow)?;

        require!(notional > 0, PerpError::ZeroAmount);

        // Calculate unrealized PnL.
        let pnl = (position.size as i128)
            .checked_mul(
                market.index_price as i128
                    - position.entry_price as i128,
            )
            .ok_or(PerpError::Overflow)?;

        // Equity = collateral + PnL.
        let equity = position.collateral as i128 + pnl;

        // Bankrupt positions are always liquidatable.
        if equity <= 0 {
            // continue to liquidation
        } else {
            let margin_ratio_bps =
                equity
                    .checked_mul(BPS_DENOMINATOR as i128)
                    .ok_or(PerpError::Overflow)?
                    / notional;

            msg!("Entry price: {}", position.entry_price);
            msg!("Current price: {}", market.index_price);
            msg!("Collateral: {}", position.collateral);
            msg!("PnL: {}", pnl);
            msg!("Equity: {}", equity);
            msg!("Notional: {}", notional);
            msg!("Margin ratio: {}", margin_ratio_bps);

            require!(
                margin_ratio_bps < MAINTENANCE_MARGIN_BPS as i128,
                PerpError::NotLiquidatable
            );
        }

        let seized = position.collateral;
        let mint_key = ctx.accounts.market.mint;
        let bump = ctx.bumps.market_authority;
        let signer_seeds: &[&[&[u8]]] = &[&[b"market-authority", mint_key.as_ref(), &[bump]]];

        if seized > 0 {
            token::transfer(
                CpiContext::new_with_signer(
                    ctx.accounts.token_program.key(),
                    Transfer {
                        from: ctx.accounts.vault.to_account_info(),
                        to: ctx.accounts.liquidator_token_account.to_account_info(),
                        authority: ctx.accounts.market_authority.to_account_info(),
                    },
                    signer_seeds,
                ),
                seized,
            )?;
        }

        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeMarket<'info> {
    #[account(init, payer = authority, space = 8 + Market::SIZE, seeds = [b"market", mint.key().as_ref()], bump)]
    pub market: Account<'info, Market>,
    /// CHECK: PDA authority only — validated by the seeds constraint.
    #[account(seeds = [b"market-authority", mint.key().as_ref()], bump)]
    pub market_authority: UncheckedAccount<'info>,
    #[account(
        init, payer = authority,
        seeds = [b"vault", mint.key().as_ref()], bump,
        token::mint = mint, token::authority = market_authority,
    )]
    pub vault: Account<'info, TokenAccount>,
    pub mint: Account<'info, Mint>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct UpdateIndexPrice<'info> {
    #[account(mut, seeds = [b"market", market.mint.as_ref()], bump, has_one = authority)]
    pub market: Account<'info, Market>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct OpenPosition<'info> {
    #[account(seeds = [b"market", market.mint.as_ref()], bump)]
    pub market: Account<'info, Market>,
    #[account(
        init, payer = trader,
        space = 8 + Position::SIZE,
        seeds = [b"position", trader.key().as_ref(), market.key().as_ref()],
        bump,
    )]
    pub position: Account<'info, Position>,
    #[account(mut, seeds = [b"vault", market.mint.as_ref()], bump)]
    pub vault: Account<'info, TokenAccount>,
    #[account(mut)]
    pub trader: Signer<'info>,
    #[account(mut)]
    pub trader_token_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SettleFunding<'info> {
    #[account(seeds = [b"market", market.mint.as_ref()], bump)]
    pub market: Account<'info, Market>,
    #[account(mut, seeds = [b"position", position.trader.as_ref(), market.key().as_ref()], bump)]
    pub position: Account<'info, Position>,
}

#[derive(Accounts)]
pub struct ClosePosition<'info> {
    #[account(seeds = [b"market", market.mint.as_ref()], bump)]
    pub market: Account<'info, Market>,
    /// CHECK: PDA authority only — validated by the seeds constraint.
    #[account(seeds = [b"market-authority", market.mint.as_ref()], bump)]
    pub market_authority: UncheckedAccount<'info>,
    #[account(
        mut, close = trader,
        seeds = [b"position", trader.key().as_ref(), market.key().as_ref()], bump,
        has_one = trader,
    )]
    pub position: Account<'info, Position>,
    #[account(mut, seeds = [b"vault", market.mint.as_ref()], bump)]
    pub vault: Account<'info, TokenAccount>,
    #[account(mut)]
    pub trader: Signer<'info>,
    #[account(mut)]
    pub trader_token_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct Liquidate<'info> {
    #[account(seeds = [b"market", market.mint.as_ref()], bump)]
    pub market: Account<'info, Market>,
    /// CHECK: PDA authority only — validated by the seeds constraint.
    #[account(seeds = [b"market-authority", market.mint.as_ref()], bump)]
    pub market_authority: UncheckedAccount<'info>,
    #[account(mut, close = liquidator, seeds = [b"position", position.trader.as_ref(), market.key().as_ref()], bump)]
    pub position: Account<'info, Position>,
    #[account(mut, seeds = [b"vault", market.mint.as_ref()], bump)]
    pub vault: Account<'info, TokenAccount>,
    #[account(mut)]
    pub liquidator: Signer<'info>,
    #[account(mut)]
    pub liquidator_token_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[account]
pub struct Market {
    pub authority: Pubkey,
    pub mint: Pubkey,
    pub index_price: u64,
    pub funding_rate_bps: i64,
}
impl Market {
    pub const SIZE: usize = 32 + 32 + 8 + 8;
}

#[account]
pub struct Position {
    pub trader: Pubkey,
    pub market: Pubkey,
    pub collateral: u64,
    pub size: i64,
    pub entry_price: u64,
    pub last_funding_ts: i64,
}
impl Position {
    pub const SIZE: usize = 32 + 32 + 8 + 8 + 8 + 8;
}

#[error_code]
pub enum PerpError {
    #[msg("Amount must be greater than zero")]
    ZeroAmount,
    #[msg("Position exceeds the maximum allowed leverage")]
    ExcessiveLeverage,
    #[msg("Position's margin ratio has not breached the maintenance threshold")]
    NotLiquidatable,
    #[msg("Funding payment would exceed the position's remaining collateral")]
    InsufficientCollateral,
    #[msg("Arithmetic overflow")]
    Overflow,
}