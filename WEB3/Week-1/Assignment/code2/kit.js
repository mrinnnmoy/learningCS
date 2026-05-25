import { runDoctor } from "./lib/doctor.js";
import { markDone, listProgress } from "./lib/progress.js";

const args = process.argv.slice(2);
const [command, subcommand, value] = args;

function printUsage() {
    console.log(`
Usage:
  node kit.js doctor           Check required/upcoming tool versions
  node kit.js track list       List all 42 weeks and completion status
  node kit.js track done <n>   Mark week <n> as complete
`);
}

function main() {
    if (command === "doctor") {
        const allGood = runDoctor();
        process.exit(allGood ? 0 : 1);
    }

    if (command === "track" && subcommand === "list") {
        console.log("\nCourse progress:\n");
        console.log(listProgress().join("\n"));
        console.log("");
        return;
    }

    if (command === "track" && subcommand === "done") {
        const weekNumber = Number(value);
        if (!Number.isInteger(weekNumber)) {
            console.error(`"${value}" is not a valid week number.`);
            process.exit(1);
        }
        try {
            markDone(weekNumber);
            console.log(`Marked week ${weekNumber} as done.`);
        } catch (err) {
            console.error(err.message);
            process.exit(1);
        }
        return;
    }

    printUsage();
    process.exit(command ? 1 : 0);
}

main();