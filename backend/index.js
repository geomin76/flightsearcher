const express = require('express');
const app = express();
var secrets = require('./secrets.js');
const https = require('https');

app.get('/', (req, res) => {
    res.send("Hello, World!")
})



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
    console.log('Run http://localhost:3000')
    console.log('Press Ctrl+C to quit.');
})

module.exports = app;