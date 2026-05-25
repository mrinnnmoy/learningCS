**How to Build.**

```
1. Step 1 — Scaffold the project.

    mkdir web3-orientation-kit && cd web3-orientation-kit
    npm init -y
    mkdir lib data

    Add `"type": "module"` to `package.json` again, same reasoning as the Easy assignment.

2. Step 2 — Move the doctor logic into `lib/doctor.js`.

    Take the `TOOLS`, `checkTool`, and `printReport` logic from Easy's `check.js` and adapt it into an exported function (see Solution).

3. Step 3 — Write `lib/progress.js`.

    This module owns all reading/writing of `data/progress.json`.

4. Step 4 — Write `kit.js` as a thin command router.

    It should read `process.argv`, decide which subcommand was requested and call into `lib/doctor.js` or `lib/progress.js` accordingly.

5. Step 5 — Seed `data/progress.json`.

    Create it with 42 entries, all `false`.

6. Step 6 — Run it.

    node kit.js doctor
    node kit.js track list
    node kit.js track done 1
    node kit.js track list
```
