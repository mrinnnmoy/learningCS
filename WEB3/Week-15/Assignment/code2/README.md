# How to Build.

```
1.  Start from Easy's already-existing `counter-anchor/ folder`.
    No new project is created for this assignment.

2.  Ensure the project follows the standard Anchor workspace layout.

    The project root should contain `package.json`, `tsconfig.json`, `node_modules/`,
    `Anchor.toml`, `programs/`, `target/` and `tests/`.

    If your Easy assignment placed the TypeScript client inside a separate
    `client/` folder, move the Node project (`package.json`, `package-lock.json`,
    `tsconfig json`) to the project root and run:

        npm install

3.  Install the testing dependencies if they are not already present:

        npm install --save-dev mocha chai ts-mocha @types/mocha @types/chai typescript

4.  Update `Anchor.toml` so the test script runs the TypeScript test suite:

        [scripts]
        test = "npx ts-mocha -p tsconfig.json -t 1000000 tests/**/*.ts"

5.  Replace the scaffolded `tests/counter-anchor.ts` with the version shown
    in the Solutionsection.

6.  Run the test suite:

        anchor test

    Anchor will automatically start a fresh local validator, build the program, deploy
    it to the validator, run the TypeScript tests, and then shut the validator down.

    None of this touches devnet.

7.  Compare how long this takes against Easy's `anchor deploy` to devnet. As with Week 14,
    this is simply an observation about the different testing tiers rather than a
    formal test case.
```
