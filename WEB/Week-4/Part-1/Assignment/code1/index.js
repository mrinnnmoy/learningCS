// Create a command line interface that lets the user specify a file path and
// the nodejs process counts the number of lines inside it.

// CLI Input - node index.js count a.txt || npm start count a.txt
// Output - There are 10 lines in this file.


const fs = require('fs');
const { Command } = require('commander');
const program = new Command();

program
    .name('counter')
    .description('CLI to do file based tasks')
    .version('0.8.0');

program.command('count')
    .description('Count the number of lines in a file')
    .argument('<file>', 'file to count')
    .action((file) => {
        fs.readFile(file, 'utf8', (err, data) => {
            if (err) {
                console.log(err);
            } else {
                const lines = data.split('\n').length;
                console.log(`There are ${lines} lines in ${file}`);
            }
        });
    });

program.parse();