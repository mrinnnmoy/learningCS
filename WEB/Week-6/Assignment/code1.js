// Read name from command line arguments
const userName = process.argv[2];

// Check if name is provided
if (!userName) {
    console.log("Please provide your name.");
    console.log("Example: node greet.js Mrinmoy");
    process.exit();
}

// Greeting message
console.log(`Hello ${userName}, welcome to NodeJS!\n`);

// Node version
console.log("Node Version:", process.version);

// Current working directory
console.log("Current Directory:", process.cwd());

// Process ID
console.log("Process ID:", process.pid);