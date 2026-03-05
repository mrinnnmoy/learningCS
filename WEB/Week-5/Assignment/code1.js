// Synchronous logs
console.log("1. Script Start");

// setTimeout #1
setTimeout(() => {
    console.log("8. setTimeout 1");
}, 0);

// Promise.then #1
Promise.resolve().then(() => {
    console.log("4. Promise.then 1");

    // Nested Promise inside then
    Promise.resolve().then(() => {
        console.log("6. Nested Promise.then");
    });
});

// setTimeout #2
setTimeout(() => {
    console.log("9. setTimeout 2");
}, 0);

// Promise.then #2
Promise.resolve().then(() => {
    console.log("5. Promise.then 2");
});

// Async function
async function runAsync() {
    console.log("2. Async Function Start");

    // await example
    await Promise.resolve();

    console.log("7. After await");
}

runAsync();

// Final synchronous log
console.log("3. Script End");
