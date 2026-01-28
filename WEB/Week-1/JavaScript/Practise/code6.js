// Write a function that takes a user as an input and greets them with their name and age.

function greet(user){
    return "Hi " + user.name + ", your age is " + user.age + ".";
}

let user = {
    name : "Mrinmoy",
    age : 24
}

console.log(greet(user));