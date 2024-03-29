const express = require('express');
const app = express();
var service = require("./service");
const { MongoClient } = require('mongodb');
var GeoJSON = require('geojson');
var cors = require('cors')
const fetch = require("node-fetch");
const { json } = require('express');



// add new database values, current one sucks


// const fs = require('fs')
// const readLine = require('readline')

app.use(cors())

app.get('/', (req, res) => {
    res.send("Hello, World!")
})

app.get('/search', (req, res) => {
    const connectionString = "mongodb+srv://" + process.env.USER + ":" + process.env.PASS +"@" + process.env.CLUSTER + "/test?retryWrites=true&w=majority"
    MongoClient.connect(connectionString, { useUnifiedTopology: true })
    .then(client => {
        const db = client.db('airport');
        db.collection("airportdata").createIndex( { name: "text", city: "text", country: "text" } )
        db.collection("airportdata").find({
            $text: {
                $search: req.query.name
            }
        }).toArray((err, result) => {
            res.json(result)
            console.log(result)
        })
    })
})


app.get('/results', (req, res) => {
    const connectionString = "mongodb+srv://" + process.env.USER + ":" + process.env.PASS +"@" + process.env.CLUSTER + "/test?retryWrites=true&w=majority"
    MongoClient.connect(connectionString, { useUnifiedTopology: true })
    .then(client => {
        const db = client.db('airport');

        db.collection("airportdata").createIndex( { location: "2dsphere" } )
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
            console.log(result)
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
                "x-rapidapi-key": process.env.KEY,
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

                                var originId = texts[i].Quotes[j].OutboundLeg.OriginId;
                                var destId = texts[i].Quotes[j].OutboundLeg.DestinationId;
                                var originName = "";
                                var destinationName = "";

                                for (var p = 0; p < texts[i].Places.length; p++) {
                                    if (texts[i].Places[p].PlaceId === originId) {
                                        originName = texts[i].Places[p].Name + " (" + texts[i].Places[p].IataCode + "), " + texts[i].Places[p].CityName
                                    }
                                    if (texts[i].Places[p].PlaceId === destId) {
                                        destinationName = texts[i].Places[p].Name + " (" + texts[i].Places[p].IataCode + "), " + texts[i].Places[p].CityName
                                    }
                                }
                                
                                
                                var flightInfo = {
                                    price: texts[i].Quotes[j].MinPrice,
                                    direct: texts[i].Quotes[j].Direct,
                                    outbound: texts[i].Quotes[j].OutboundLeg.DepartureDate.substring(0, 10),
                                    inbound: texts[i].Quotes[j].InboundLeg.DepartureDate.substring(0, 10),
                                    outboundFlight: outboundCarriers,
                                    inboundFlight: inboundCarriers,
                                    origin: originName,
                                    destination: destinationName
                                }
                                results.push(flightInfo);
                            }
                        }
                        else {
                            console.log("none")
                        }
                    }

                    results.sort((a, b) => (a.price) - (b.price))
                    // console.log(results.slice(0, 15));
                    res.json(results.slice(0, 15))
                })
        })  

    })
})


// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//     console.log(`App listening on port ${PORT}`);
//     console.log('Run http://localhost:3000')
//     console.log('Press Ctrl+C to quit.');
// })

module.exports = app;