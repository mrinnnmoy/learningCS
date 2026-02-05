const express = require('express');
const app = express();

// route-handlers
app.get('/', (req, res) => {
    res.send('Hello World')
})

app.get('/name', (req, res) => {
    res.send('Hello Mrinmoy')
})

app.get('/task', (req, res) => {
    res.send('Learning HTTP Servers')
})

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000')
})