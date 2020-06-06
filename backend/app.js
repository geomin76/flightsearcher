const express = require('express');
const app = express();
var secrets = require('./secrets.js');
var service = require("./service");
const request = require('request');
var unirest = require("unirest");
const { MongoClient } = require('mongodb');
var GeoJSON = require('geojson');
const fetch = require("node-fetch");

const fs = require('fs')
const readLine = require('readline')

// var codes = [];


const connectionString = "mongodb+srv://" + secrets.user + ":" + secrets.pass +"@" + secrets.cluster + "/test?retryWrites=true&w=majority"
MongoClient.connect(connectionString, { useUnifiedTopology: true })
  .then(client => {
    console.log('Connected to Database')
    const db = client.db('airport');

    // service.getData(db, "airportdata")

    //http://localhost:3000/query?lng=-76.795915&lat=37.408109
    // 33.939725, -118.408609
    // 37.408109, -76.795915
    

    app.get('/query', (req, res) => {
        //lng, lat for GPS coordinates
        // db.collection("airportdata").createIndex( { location: "2dsphere" } )
        db.collection("airportdata").find(
            {
            "location":
                { $near:
                {
                    $geometry: { type: "Point",  coordinates: [ parseFloat(req.query.lng), parseFloat(req.query.lat) ] },
                    $maxDistance: 200000
                }
                }
            }
        ).limit(5).toArray((err, result) => {
            for (var i = 0; i < result.length; i++) {
                // codes.push(result[i].code)
            }
            console.log(result)
        })
        res.send("works")
    })

})



app.get('/', (req, res) => {
    res.send("Hello, World!")
})

app.get('/results', (req, res) => {

    var results = [];
    codes = ["IAD", "BWI"]
    var destination = req.query.destination;
    var outbound = req.query.outbound;
    var inbound = req.query.inbound;

    var test = [];

    for (var i = 0; i< codes.length; i++) {
        test.push(("https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com/apiservices/browsequotes/v1.0/US/USD/en-US/" 
            + codes[i] + "/" + destination + "/" + outbound + "/" + inbound))
    }
    requiredHeaders = {
        "x-rapidapi-host": "skyscanner-skyscanner-flight-search-v1.p.rapidapi.com",
        "x-rapidapi-key": secrets.key,
        "useQueryString": true
    }

    Promise.all(test.map(url => fetch(url, {method: 'GET', headers: requiredHeaders})))
    .then(responses => 
        Promise.all(responses.map(res => res.json())))
        .then(texts => {
            for (var i = 0; i < texts.length; i++) {
                if (texts[i].Quotes) {                    
                    for (var j = 0; j < texts[i].Quotes.length; j++) {
                        var outboundCarriers = [];
                        var inboundCarriers = [];

                        //do method for finding origin/destination, same method as carriers
        
                        //find a more efficient method
                        for (var m = 0; m < texts[i].Carriers.length; m++) {
                            for (var k = 0; k < texts[i].Quotes[j].OutboundLeg.CarrierIds.length; k++) {
                                if (texts[i].Quotes[j].OutboundLeg.CarrierIds[k] == texts[i].Carriers[m].CarrierId) {
                                    outboundCarriers.push(texts[i].Carriers[m].Name);
                                }
                            }
                            for (var k = 0; k < texts[i].Quotes[j].InboundLeg.CarrierIds.length; k++) {
                                if (texts[i].Quotes[j].InboundLeg.CarrierIds[k] == texts[i].Carriers[m].CarrierId) { 
                                    inboundCarriers.push(texts[i].Carriers[m].Name);
                                }
                            }
                        }
        
                        var flightInfo = {
                            price: texts[i].Quotes[j].MinPrice,
                            direct: texts[i].Quotes[j].Direct,
                            outbound: texts[i].Quotes[j].OutboundLeg.DepartureDate.substring(0, 10),
                            inbound: texts[i].Quotes[j].InboundLeg.DepartureDate.substring(0, 10),
                            outboundFlight: outboundCarriers,
                            inboundFlight: inboundCarriers,
                            // origin: origin,
                            // destination: destination
                        }
                        results.push(flightInfo);
                        // console.log(flightInfo)
                    }
                }
                else {
                    console.log("No flights available")
                }
            }
            // console.log(results)
            results.sort((a, b) => (a.price) - (b.price))
            console.log(results);
        })
        // .catch(error => {
        //     console.log(error)
        // })




    // http://localhost:3000/results?destination=SFO&outbound=2020-10&inbound=2020-10

    //select a month/year of travel, sort 10-20 lowest prices + dates from airports nearest you

    res.send("WOO");
})



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
    console.log('Run http://localhost:3000')
    console.log('Press Ctrl+C to quit.');
})

module.exports = app;