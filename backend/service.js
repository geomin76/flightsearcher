// parsing txt file and obtaining airport data (Name, IATA code, GPS coordinates)
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
            location: { type: "Point", coordinates: [ parseFloat(res[5]), parseFloat(res[4]) ] }
      })

    }
    console.log("done")
}