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

export function runDoctor() {
    const results = TOOLS.map(checkTool);
    const nameWidth = Math.max(...results.map((r) => r.name.length));

    console.log("\nWeb3 Orientation Kit — Toolchain Doctor\n");
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

    const missingRequired = results.filter((r) => r.required && !r.found);
    return missingRequired.length === 0;
}

export function runDoctorAsJson() {
    const results = TOOLS.map(checkTool);
    const allRequiredPresent = results
        .filter((r) => r.required)
        .every((r) => r.found);

    return {
        allRequiredPresent,
        tools: results.map((r) => ({
            name: r.name,
            required: r.required,
            found: r.found,
            version: r.version,
        })),
    };
}