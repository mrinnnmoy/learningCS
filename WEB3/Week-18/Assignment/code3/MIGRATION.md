# Token Migration from Legacy SPL Token to Token-2022

There is no in-place upgrade from the legacy SPL Token program to
Token-2022. A project must create a brand-new Token-2022 mint and
enable only the extensions it requires (for example,
DefaultAccountState or InterestBearingConfig).

Existing balances do not automatically move to the new mint.
Every holder must receive newly issued Token-2022 tokens through a
controlled re-issuance, redemption, or swap process.

Because the new token has a different mint address, every downstream
integration must also migrate. Wallets, exchanges, explorers, price
feeds, liquidity pools, and any on-chain programs that reference the
legacy mint must be updated to recognize and support the new
Token-2022 mint.

Only after holders and integrations have successfully migrated should
the legacy mint be retired or deprecated.