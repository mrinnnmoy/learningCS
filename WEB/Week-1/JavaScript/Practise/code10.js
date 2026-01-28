// Write a function that takes an array of users as inputs
//  and returns only the users who are more than 18 years old.

function vote(user){
    let result = [];

    for(let i = 0; i < user.length; i++){
        if(user[i].age >= 18){
            result.push(user[i].name);
        }
    }
    return result;
}


let user = [
    {
        name : "Max",
        age : 18
    },
    {
        name : "Sam",
        age : 16
    },
    {
        name : "Alex",
        age : 20
    }
]

console.log(vote(user));