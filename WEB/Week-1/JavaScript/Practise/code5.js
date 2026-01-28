// Write a function called sum that finds the sum from 1 to a number.

function sum(num){
    let calculate = 0;

    // Using for loop.
    // for(let i = 1; i <= num; i++){
    //     calculate += i; // calculate = calculate + i;
    // }

    // Using while loop.
    let i = 1;
    while(i <= num){
        calculate += i;
        i++;
    }

    return calculate;
}

console.log(sum(255));