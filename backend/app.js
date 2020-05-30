const express = require('express');
const app = express();
var secrets = require('./secrets.js');
const request = require('request');
var unirest = require("unirest");

app.get('/', (req, res) => {
    res.send("Hello, World!")
})

app.get('/createSession', (req, res) => {

    var req = unirest("GET", "https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com/apiservices/autosuggest/v1.0/UK/GBP/en-GB/");

    req.query({
        "query": "Stockholm"
    });

    req.headers({
        "x-rapidapi-host": "skyscanner-skyscanner-flight-search-v1.p.rapidapi.com",
        "x-rapidapi-key": secrets.key,
        "useQueryString": true
    });


    req.end(function (res) {
        if (res.error) throw new Error(res.error);

        console.log(res.body);
    });
})



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
    console.log('Run http://localhost:3000')
    console.log('Press Ctrl+C to quit.');
})

module.exports = app;