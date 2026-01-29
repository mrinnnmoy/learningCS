// Now create another file (b.txt)
// Write a code to read the multiple files synchronously.

const fs = require("fs");

const contents1 = fs.readFileSync('a.txt', "utf-8");
console.log(contents1);

const contents2 = fs.readFileSync('b.txt', "utf-8");
console.log(contents2);