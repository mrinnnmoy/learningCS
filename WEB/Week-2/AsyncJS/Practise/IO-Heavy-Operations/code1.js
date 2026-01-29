// Write a code in JS to read a file synchronously.

const fs = require("fs");

const contents = fs.readFileSync('a.txt', "utf-8");
console.log(contents);