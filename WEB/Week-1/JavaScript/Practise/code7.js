// Write a function that takes a new object as input which has
// name, age and gender and greets the user with their gender.
// (Hi Mr/Mrs/Others harkirat, your age is 21)

function greet(user){
    if(user.gender === 'male'){
        return "Hi Mr. " + user.name + ", your age is " + user.age + ".";
    } else if (user.gender === 'female'){
        return "Hi Mrs. " + user.name + ", your age is " + user.age + ".";
    } else {
        return "Hi Others " + user.name + ", your age is " + user.age + ".";
    }
}

let user = {
    name : "Mrinmoy",
    age : 24,
    gender : "male"
};

console.log(greet(user));