// Import fs module
const fs = require("fs");

// Get command line arguments
const command = process.argv[2];
const fileName = process.argv[3];
const content = process.argv[4];

// CREATE FILE
if (command === "create") {

    fs.writeFile(fileName, "", (error) => {

        if (error) {
            console.log("Error creating file.");
            return;
        }

        console.log("File created successfully.");
    });
}


// WRITE TO FILE
else if (command === "write") {

    fs.writeFile(fileName, content, (error) => {

        if (error) {
            console.log("Error writing to file.");
            return;
        }

        console.log("Content written to file.");
    });
}


// READ FILE
else if (command === "read") {

    fs.readFile(fileName, "utf8", (error, data) => {

        if (error) {
            console.log("Error reading file.");
            return;
        }

        console.log("File content:");
        console.log(data);
    });
}


// DELETE FILE
else if (command === "delete") {

    fs.unlink(fileName, (error) => {

        if (error) {
            console.log("Error deleting file.");
            return;
        }

        console.log("File deleted.");
    });
}


// INVALID COMMAND
else {

    console.log("Invalid command.");

    console.log(`
Usage:

Create File:
node fileManager.js create notes.txt

Write File:
node fileManager.js write notes.txt "Learning NodeJS"

Read File:
node fileManager.js read notes.txt

Delete File:
node fileManager.js delete notes.txt
  `);
}