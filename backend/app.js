const express = require('express');
const app = express();
var secrets = require('./secrets.js');
var service = require("./service");
const { MongoClient } = require('mongodb');
var GeoJSON = require('geojson');
var cors = require('cors')
const fetch = require("node-fetch");


// const fs = require('fs')
// const readLine = require('readline')

app.use(cors())

app.get('/', (req, res) => {
    res.send("Hello, World!")
})


//this method connects with mongodb database, checks with a lng/lat the closest airports near that lng/lat and returns the data
const connectionString = "mongodb+srv://" + secrets.user + ":" + secrets.pass +"@" + secrets.cluster + "/test?retryWrites=true&w=majority"
MongoClient.connect(connectionString, { useUnifiedTopology: true })
  .then(client => {
    console.log('Connected to Database')
    const db = client.db('airport');

    // service.getData(db, "airportdata")

    // this "2dsphere" indexing allows distance to be calculated by sphere distance rather than straight line distance
    // db.collection("airportdata").createIndex( { location: "2dsphere" } )


    // http://localhost:3000/results?lng=-77.018727&lat=38.859887&destination=LAX&outbound=2020-10&inbound=2020-10


    app.get('/results', (req, res) => {

        // var results = [];
        var codes = [];
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
                codes.push(result[i].code)
            }

            var destination = req.query.destination;
            var outbound = req.query.outbound;
            var inbound = req.query.inbound;
        
            var urls = [];
        
            for (var i = 0; i < codes.length; i++) {
                urls.push(("https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com/apiservices/browsequotes/v1.0/US/USD/en-US/" 
                    + codes[i] + "/" + destination + "/" + outbound + "/" + inbound))
            }
            requiredHeaders = {
                "x-rapidapi-host": "skyscanner-skyscanner-flight-search-v1.p.rapidapi.com",
                "x-rapidapi-key": secrets.key,
                "useQueryString": true
            }

            var results = [];
  
            //optimize this method, not great efficiency rn
            Promise.all(urls.map(url => fetch(url, {method: 'GET', headers: requiredHeaders})))
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
                            }
                        }
                        else {
                            console.log("No flights available")
                        }
                    }
                    results.sort((a, b) => (a.price) - (b.price))
                    // console.log(results.slice(0, 15));
                    res.json(results.slice(0, 15))
                })
        })    
    })

})


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
    console.log('Run http://localhost:3000')
    console.log('Press Ctrl+C to quit.');
})

module.exports = app;