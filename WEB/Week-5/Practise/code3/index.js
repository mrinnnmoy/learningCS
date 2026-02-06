const express = require('express');
const app = express();

// app.use(function (req, res, next) {
//     console.log("request recieved");
//     next();
// })

// app.get("/sum", function (req, res) {
//     const a = parseInt(req.query.a);
//     const b = parseInt(req.query.b);

//     res.json({
//         ans: a + b
//     })
// })


// Modifying the request
// app.use(function (req, res, next) {
//     req.name = "Mrinmoy";
//     next();
// })

// app.get('/sum', function (req, res) {
//     console.log(req.name);

//     const a = parseInt(req.query.a);
//     const b = parseInt(req.query.b);

//     res.json({
//         ans: a + b
//     })
// })


// Ending the request/response cycle
// app.use(function(req,res, next) {
//     res.json({
//         message: "You're not allowed."
//     })
// })

// app.get("/sum", function(req, res) {
//     console.log(req.name);
//     const a = parseInt(req.query.a);
//     const b = parseInt(req.query.b);

//     res.json({
//         ans: a + b
//     })
// })


// Calling the next middleware function in the stack
app.use(function (req, res, next) {
    console.log("request recieved");
    next();
})

app.get("/sum", function (req, res) {
    const a = parseInt(req.query.a);
    const b = parseInt(req.query.b);

    res.json({
        ans: a + b
    })
})




app.listen(3000, () => {
    console.log(`Server is running at http://localhost:3000`);
})