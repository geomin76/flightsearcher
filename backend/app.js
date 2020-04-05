const express = require('express');
const app = express();
var secrets = require('./secrets.js');
const request = require('request');

app.get('/', (req, res) => {
    res.send("Hello, World!")
})

app.get('/createSession', (req, res) => {
    /**
     * https://partners.api.skyscanner.net/apiservices/pricing/v1.0
     * Params required:
     * - Country
     * - Currency
     * - Locale
     * - originPlace
     * - destinationPLace
     * - outboundDate
     * - adults
     * - apiKey
     */
})



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
    console.log('Run http://localhost:3000')
    console.log('Press Ctrl+C to quit.');
})

module.exports = app;