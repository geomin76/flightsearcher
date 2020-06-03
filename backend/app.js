const express = require('express');
const app = express();
var secrets = require('./secrets.js');
const request = require('request');
var unirest = require("unirest");
const { MongoClient } = require('mongodb');


const connectionString = "mongodb+srv://" + secrets.user + ":" + secrets.pass +"@" + secrets.cluster + "/test?retryWrites=true&w=majority"
MongoClient.connect(connectionString, { useUnifiedTopology: true })
  .then(client => {
    console.log('Connected to Database')
    const db = client.db('airport')
    const airportData = db.collection('airportdata')

    //do data submission here once, where airportname, airport code, gps coordinates

    //can set apis here

  })


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

    //select a month/year of travel, sort 10-20 lowest prices + dates from airports nearest you

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

        if (res.body.Quotes) {

            for (var i = 0; i < res.body.Quotes.length; i++) {
                var outboundCarriers = [];
                var inboundCarriers = [];

                //find a more efficient method
                for (var m = 0; m < res.body.Carriers.length; m++) {
                    for (var j = 0; j < res.body.Quotes[i].OutboundLeg.CarrierIds.length; j++) {
                        if (res.body.Quotes[i].OutboundLeg.CarrierIds[j] == res.body.Carriers[m].CarrierId) {
                            outboundCarriers.push(res.body.Carriers[m].Name);
                        }
                    }
                    for (var j = 0; j < res.body.Quotes[i].InboundLeg.CarrierIds.length; j++) {
                        if (res.body.Quotes[i].InboundLeg.CarrierIds[j] == res.body.Carriers[m].CarrierId) { 
                            inboundCarriers.push(res.body.Carriers[m].Name);
                        }
                    }
                }

                var flightInfo = {
                    price: res.body.Quotes[i].MinPrice,
                    direct: res.body.Quotes[i].Direct,
                    outbound: res.body.Quotes[i].OutboundLeg.DepartureDate.substring(0, 10),
                    inbound: res.body.Quotes[i].InboundLeg.DepartureDate.substring(0, 10),
                    outboundFlight: outboundCarriers,
                    inboundFlight: inboundCarriers
                }
                results.push(flightInfo);
            }
        }
        else {
            console.log("No flight(s) available")
        }

        results.sort((a, b) => (a.price) - (b.price))
        console.log(results);

        //add all queries to results, then cut off to only 15 cheapest flights
        
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