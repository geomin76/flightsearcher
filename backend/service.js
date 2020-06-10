const fetch = require("node-fetch");
var secrets = require('./secrets.js');
const fs = require('fs')
const readLine = require('readline')

// parsing txt file and obtaining airport data (Name, IATA code, GPS coordinates)
//all this data is passed into a mongodb database
async function getData(db, collectionName) {
    var allData = [];
    const fileStream = fs.createReadStream('data.txt');

    const rl = readLine.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });
  
    for await (const line of rl) {
      var res = line.split(",");


      db.collection(collectionName).insert({
            name: res[3],
            code: res[13],
            city: res[10],
            countryCode: res[8],
            location: { type: "Point", coordinates: [ parseFloat(res[5]), parseFloat(res[4]) ] }
      })

    }
    console.log("done")
}


function getAirports(db, lng, lat) {
    var codes = [];
    db.collection("airportdata").find(
        {
        "location":
            { $near:
            {
                $geometry: { type: "Point",  coordinates: [ parseFloat(lng), parseFloat(lat) ] },
                $maxDistance: 200000
            }
            }
        }
    ).limit(5).toArray((err, result) => {
        for (var i = 0; i < result.length; i++) {
            codes.push(result[i].code)
        }
        return codes
    })
}


function getFlightData(urls, destination, outbound, inbound) {

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
            console.log(results.slice(0, 15));
            //only gets first 15 results
            return results.slice(0, 15)
        })

        //do a catch method so no errors

}


module.exports = {getFlightData, getAirports, getData}