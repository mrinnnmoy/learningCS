# How to Build.

```
1. Scaffold the Anchor workspace.

   Run:
     anchor init config-program
     cd config-program

2. Replace programs/config-program/Cargo.toml's [dependencies] and
   src/lib.rs with the versions in the Solution section below.

3. Anchor 1.1.2's default `anchor init` scaffold no longer creates a
   tests/ folder or wires up TypeScript/Mocha testing by default —
   check this before assuming otherwise.

   Run:
     ls tests/

   If that reports "No such file or directory", create it yourself:

   Run:
     mkdir tests

   Then create tests/config-program.ts with the version in the
   Solution section below.

4. Install the TS test dependencies at the PROJECT ROOT (not
   client/ — this project has no client/ folder, since Medium is
   test-only). ts-mocha/ts-node do NOT work with TypeScript 7 (the
   new Go-native compiler has no compiler API yet, which ts-node
   depends on), so use mocha with tsx as the loader instead.

   Run:
     npm install --save-dev @anchor-lang/core @solana/web3.js
     npm install --save-dev mocha tsx chai @types/mocha @types/chai

5. Open Anchor.toml and fix THREE things:

   a. The default [scripts] test line points at `cargo test`, which
      only runs Rust's scaffolded sanity test, never your actual
      TypeScript suite. Point it at mocha + tsx instead, with an
      explicit file path (globs like tests/**/*.ts are unreliable
      through Anchor's script runner):

        [scripts]
        test = "NODE_OPTIONS='--import tsx' npx mocha -t 1000000 tests/config-program.ts"

   b. This assignment's second test airdrops SOL to a throwaway
      "attacker" Keypair — only legitimate and only reliable against
      a disposable LOCAL validator, never live devnet (devnet airdrops
      are rate-limited and will eventually 429). Set:

        [provider]
        cluster = "localnet"

   c. Local-validator testing requires Anchor to actually spin one
      up, which the default scaffold may have disabled. Set (or
      remove the line entirely, false is the default):

        skip_local_validator = false

6. Run the test suite. Note: NO --skip-deploy this time — with a
   local validator, anchor test needs to build, launch a fresh
   ephemeral validator, deploy to it, run the suite, then tear it
   all down, giving you a clean slate on every single run, which is
   also what makes the airdrop and re-init issues disappear.

   Run:
     anchor build
     anchor test
```