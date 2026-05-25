import { execSync } from "node:child_process";

const TOOLS = [
    { name: "git", command: "git --version", required: true },
    { name: "node", command: "node --version", required: true },
    { name: "npm", command: "npm --version", required: true },
    { name: "rustc", command: "rustc --version", required: false },
    { name: "cargo", command: "cargo --version", required: false },
];

function checkTool(tool) {
    try {
        const output = execSync(tool.command, {
            stdio: ["ignore", "pipe", "pipe"],
        }).toString().trim();
        return { ...tool, found: true, version: output };
    } catch (err) {
        return { ...tool, found: false, version: null };
    }
}

function printReport(results) {
    console.log("\nWeb3 Orientation Kit — Toolchain Doctor\n");

    const nameWidth = Math.max(...results.map((r) => r.name.length));

    for (const r of results) {
        const paddedName = r.name.padEnd(nameWidth, " ");
        if (r.found) {
            console.log(`  [ OK ] ${paddedName}  ${r.version}`);
        } else if (r.required) {
            console.log(`  [FAIL] ${paddedName}  not found (required now)`);
        } else {
            console.log(`  [ -- ] ${paddedName}  not installed yet (needed later in the course)`);
        }
    }
    console.log("");
}

function main() {
    const results = TOOLS.map(checkTool);
    printReport(results);

    const missingRequired = results.filter((r) => r.required && !r.found);

    if (missingRequired.length > 0) {
        console.log(
            `${missingRequired.length} required tool(s) missing. Install them before continuing.\n`
        );
        process.exit(1);
    }

    console.log("All required tools are present.\n");
}

main();