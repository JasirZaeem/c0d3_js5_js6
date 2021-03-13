const express = require("express");
const router = express.Router();
const fetch = require("node-fetch");

const cities = {}; // Store location and visits to it

const getVisitorList = () =>
  Object.entries(cities).reduce(
    (listItems, [city, visitors]) =>
      listItems + `<li><h2>${city} - ${visitors}</h2></li>`,
    ""
  );

router.get("/api/visitors", async (req, res) => res.send(cities));

router.get("/visitors", async (req, res) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const {
    country,
    region,
    city,
    ll: [lat, lng],
    ...data
  } = await fetch(`https://js5.c0d3.com/location/api/ip/${ip}`).then((r) =>
    r.json()
  );

  const location = `${city}, ${region}, ${country}`;

  cities[location] = cities[location] + 1 || 1;

  return res.send(`
    <h1>You are visiting from ${location}</h1>
    <h3>${JSON.stringify(data)}</h3>
    <div id="googleMap" style="width: 100%; height: 500px; position: relative; overflow: hidden;"></div>
    <div>
      <h1>The cities our visitors come from</h1>
      <ul>
        ${getVisitorList()}
      </ul>
    </di>
    <script>
      function myMap() {
        const mapProp = {
          center: new google.maps.LatLng(${lat}, ${lng}),
          zoom: 11,
        };
        const map = new google.maps.Map(document.getElementById("googleMap"), mapProp);

        new google.maps.Marker({
          position: {lat: ${lat}, lng: ${lng}},
          map: map,
          title: '2 Hits'
        })

        new google.maps.Marker({
          position: {lat: ${lat}, lng: ${lng}},
          map: map,
          title: '5 Hits'
        })

      }
    </script>
    <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyB29pGpCzE_JGIEMLu1SGIqwoIbc0sHFHo&amp;callback=myMap"></script>
  `);
});

module.exports = router;
