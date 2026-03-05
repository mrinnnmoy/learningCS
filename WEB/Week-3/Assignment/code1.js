// Array of student marks
const marks = [72, 45, 90, 33, 68, 55];

// Variables
let passed = 0;
let failed = 0;
let highest = marks[0];
let lowest = marks[0];
let total = 0;

// Loop through marks
for (let i = 0; i < marks.length; i++) {
    let mark = marks[i];

    // Count pass/fail
    if (mark >= 40) {
        passed++;
    } else {
        failed++;
    }

    // Find highest mark
    if (mark > highest) {
        highest = mark;
    }

    // Find lowest mark
    if (mark < lowest) {
        lowest = mark;
    }

    // Add to total
    total += mark;
}

// Calculate average
let average = total / marks.length;

// Print results
console.log("Student Marks Analysis");
console.log("----------------------");
console.log("Marks:", marks);
console.log("Passed Students:", passed);
console.log("Failed Students:", failed);
console.log("Highest Mark:", highest);
console.log("Lowest Mark:", lowest);
console.log("Average Mark:", average.toFixed(2));