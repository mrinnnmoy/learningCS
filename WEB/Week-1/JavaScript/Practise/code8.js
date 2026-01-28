// Write a function that takes a new object as input which has
// name , age  and gender and greets the user with their gender.
// (Hi Mr/Mrs/Others harkirat, your age is 21)
// Also tell the user if they are legal to vote or not.

function greet(user){

    let title;
    if (user.gender === 'male') {
        title = 'Mr';
    } else if (user.gender === 'female') {
        title = 'Mrs';
    } else {
        title = 'Others';
    }

    let voteStatus;
    if(user.age >= 18){
        voteStatus = 'Eligible to Vote.';
    } else {
        voteStatus = 'Not Eligible to Vote.';
    }

    console.log(`Hi ${title} ${user.name}, your age is ${user.age}.`);
    console.log(voteStatus);
}

const user = {
    name : "Mrinmoy",
    age : 24,
    gender : "male"
};

greet(user);