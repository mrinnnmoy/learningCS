// Write an if/else statement that checks if a number is even or odd.
// If it's even, print "The number is even." Otherwise, print "The number is odd."


function num(x){
    if(x % 2 === 0){
        return "Number is Even.";
    } else {
        return "Number is Odd.";
    }
}

console.log(num(12345786));