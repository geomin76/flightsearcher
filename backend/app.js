const express = require('express');
const app = express();
var secrets = require('./secrets.js');
const request = require('request');
var unirest = require("unirest");

app.get('/', (req, res) => {

    console.log(req.query.inbound);

    //form

    //location, get from google

    //destination

    //dates
    res.send("Hello, World!")
})

app.get('/results', (req, res) => {

    var results = [];


    // http://localhost:3000/results?origin=JFK&destination=SFO&outbound=2020-09-15&inbound=2020-10-15

    //getting flight quote data from SkyScanner Flight API
    var url = "https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com/apiservices/browsequotes/v1.0/US/USD/en-US/" 
    + req.query.origin + "/" + req.query.destination + "/" + req.query.outbound + "/" + req.query.inbound

    var req = unirest("GET", url);

    req.headers({
        "x-rapidapi-host": "skyscanner-skyscanner-flight-search-v1.p.rapidapi.com",
        "x-rapidapi-key": secrets.key,
        "useQueryString": true
    });


    req.end(function (res) {
        if (res.error) throw new Error(res.error);

        //if quotes even exist
        if (res.body.Quotes[0]) {

            var outboundCarriers = [];
            var inboundCarriers = [];
            
            //getting carrier names from outbound + inbound legs
            for (var i = 0; i < res.body.Carriers.length; i++) {
                for (var j = 0; j < res.body.Quotes[0].OutboundLeg.CarrierIds.length; j++) {
                    if (res.body.Quotes[0].OutboundLeg.CarrierIds[j] == res.body.Carriers[i].CarrierId) {
                        outboundCarriers.push(res.body.Carriers[i].Name);
                    }
                }
                for (var j = 0; j < res.body.Quotes[0].InboundLeg.CarrierIds.length; j++) {
                    if (res.body.Quotes[0].InboundLeg.CarrierIds[j] == res.body.Carriers[i].CarrierId) { 
                        inboundCarriers.push(res.body.Carriers[i].Name);
                    }
                }
            }

            //creating object with price, direct flight or not, and carrier names
            var flightInfo = {
                price: res.body.Quotes[0].MinPrice,
                direct: res.body.Quotes[0].Direct,
                outbound: outboundCarriers,
                inbound: inboundCarriers
            }
            results.push(flightInfo);
            console.log(flightInfo);
        }
        else {
            console.log("None")
        }
        
    });
    res.send("WOO");
})



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
    console.log('Run http://localhost:3000')
    console.log('Press Ctrl+C to quit.');
})

module.exports = app;