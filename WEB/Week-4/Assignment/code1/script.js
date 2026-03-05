let count = localStorage.getItem("counter");

// Check if no value exists, start atr 0
if (count === null) {
    count = 0;
} else {
    count = Number(count);
}

// Display initial value
const countElement = document.getElementById("count");
countElement.textContent = count;


// Save count to localStorage
function saveCount() {
    localStorage.setItem("counter", count);
}

// Increment function
function increment() {
    count++;
    countElement.textContent = count;
    saveCount();
}

// Decrement function
function decrement() {
    if (count > 0) {
        count--;
        countElement.textContent = count;
        saveCount();
    }
}

// Reset function
function resetCounter() {
    count = 0;
    countElement.textContent = count;
    saveCount();
}