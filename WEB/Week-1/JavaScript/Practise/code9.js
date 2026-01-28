// Write a function that takes an array of numbers as input,
//  and returns a new array with only even values. Read about filter in JS.

function even(num){
    let result = [];

    for(let i = 0; i < num.length; i++){
        if(num[i] % 2 === 0){
            result.push(num[i]);
        }
    }
    return result;
}

let num = [1,2,3,4,5,6,7,8,9];
console.log(even(num));