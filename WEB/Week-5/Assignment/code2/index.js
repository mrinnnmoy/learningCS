const express = require('express');
const app = express();


let totalRequests = 0;

// Middleware to count
app.use(function requestCounter(req, res, next) {
    totalRequests += 1;
    next();
})

// Sameple route
app.get("/", (req, res) => {
    res.send("Hello World.");
})

// Endpoint to expose total request count
app.get('/counter', (req, res) => {
    res.json({
        totalRequests: totalRequests
    });
});

// Starting server
app.listen(3000, () => {
    console.log(`Server is running at http://localhost:3000`)
})