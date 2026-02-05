const express = require('express');

function sum(n) {
    let ans = 0;
    for (let i = 1; i <= n; i++) {
        ans += i;
    }
    return ans;
}

const app = express();

app.get('/', function (req, res) {
    const n = req.query.n;
    const ans = sum(n)
    res.send(ans.toString());
})

app.listen(3000, (req, res) => {
    console.log("Server running at http://localhost:3000");
})

// If you want to put value and see the result through the browser,
// try this, "http://localhost:3000?n=30"