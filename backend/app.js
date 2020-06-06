const express = require('express');
const app = express();
var secrets = require('./secrets.js');
var service = require("./service");
const request = require('request');
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
    codes = ["IAD", "BWI", "ATL"]
    var destination = req.query.destination;
    var outbound = req.query.outbound;
    var inbound = req.query.inbound;

    var urls = [];

    for (var i = 0; i< codes.length; i++) {
        urls.push(("https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com/apiservices/browsequotes/v1.0/US/USD/en-US/" 
            + codes[i] + "/" + destination + "/" + outbound + "/" + inbound))
    }
    requiredHeaders = {
        "x-rapidapi-host": "skyscanner-skyscanner-flight-search-v1.p.rapidapi.com",
        "x-rapidapi-key": secrets.key,
        "useQueryString": true
    }

    return service.getFlightData(results, urls, destination, outbound, inbound)

    // http://localhost:3000/results?destination=LAX&outbound=2020-10&inbound=2020-10

    res.send("WOO");
})



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
    console.log('Run http://localhost:3000')
    console.log('Press Ctrl+C to quit.');
})

module.exports = app;