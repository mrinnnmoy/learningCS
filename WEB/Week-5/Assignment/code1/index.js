const express = require('express');
const app = express();

// Middleware function
app.use(function requestLogger(req, res, next) {
    const timestamp = new Date().toISOString();

    console.log(`[${timestamp}], ${req.method}, ${req.originalUrl}`);
    next();
});

// Example route
app.get('/', function (req, res) {
    res.send("Hello world.");
})

// Start server
app.listen(3000, () => {
    console.log(`Server is running at http://localhost:3000`);
})