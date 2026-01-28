// Create a function that takes an array of objects as input,
// and returns the users whose age > 18 and are male.

function getAdultMales(users) {
    let result = [];

    for (let i = 0; i < users.length; i++) {
        if (users[i].age > 18 && users[i].gender === "male") {
            result.push(users[i]);
        }
    }

    return result;
}

// Example
let users = [
    { name: "Aman", age: 22, gender: "male" },
    { name: "Riya", age: 19, gender: "female" },
    { name: "Rahul", age: 17, gender: "male" },
    { name: "Karan", age: 25, gender: "male" }
];

console.log(getAdultMales(users));