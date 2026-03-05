// Fake API Call
function fakeApiCall(id, delay) {
    return new Promise((resolve, reject) => {

        setTimeout(() => {

            // Random failure
            if (Math.random() > 0.7) {
                reject(`Task ${id} failed`);
            } else {
                resolve(`Task ${id} completed`);
            }

        }, delay);

    });
}

// Create 5 fake tasks
const tasks = [
    () => fakeApiCall(1, 1000),
    () => fakeApiCall(2, 1500),
    () => fakeApiCall(3, 2000),
    () => fakeApiCall(4, 1200),
    () => fakeApiCall(5, 1800)
];


// ===============================
// SEQUENTIAL EXECUTION
// ===============================

async function runSequential() {

    console.log("===== Sequential Execution =====");

    const startTime = Date.now();

    for (const task of tasks) {

        try {

            const result = await task();

            console.log(result);

        } catch (error) {

            console.log("Error:", error);

            // Continue running remaining tasks
        }
    }

    const endTime = Date.now();

    console.log(
        `Sequential Total Time: ${(endTime - startTime) / 1000
        } seconds`
    );
}


// ===============================
// PARALLEL EXECUTION
// ===============================

async function runParallel() {

    console.log("\n===== Parallel Execution =====");

    const startTime = Date.now();

    try {

        // Run all tasks together
        const results = await Promise.all(
            tasks.map(task => task())
        );

        console.log(results);

    } catch (error) {

        console.log("Error:", error);

        // Promise.all stops immediately on first rejection
    }

    const endTime = Date.now();

    console.log(
        `Parallel Total Time: ${(endTime - startTime) / 1000
        } seconds`
    );
}


// ===============================
// RUN BOTH
// ===============================

runSequential().then(() => {
    runParallel();
});