import Globe from "globe.gl";
import * as d3 from "d3-dsv";
import indexBy from "index-array-by";

const COUNTRY = 'Ghana';
const OPACITY = 0.22;

const myGlobe = Globe()
    (document.getElementById('globe'))

    .globeImageUrl("./img/nasa_night_lights.jpg")
    .pointOfView({ lat: 8.0593, lng: -1.7296, altitude: 0.21 }) // aim at continental Ghana centroid

    .arcLabel(d => `${d.airline}: ${d.srcIata} &#8594; ${d.dstIata}`)
    .arcStartLat(d => +d.srcAirport.lat)
    .arcStartLng(d => +d.srcAirport.lng)
    .arcEndLat(d => +d.dstAirport.lat)
    .arcEndLng(d => +d.dstAirport.lng)
    .arcDashLength(0.25)
    .arcDashGap(1)
    .arcDashInitialGap(() => Math.random())
    .arcDashAnimateTime(4000)
    .arcColor(d => [`rgba(0, 255, 0, ${OPACITY})`, `rgba(255, 0, 0, ${OPACITY})`])
    .arcsTransitionDuration(0)

    .pointColor(() => 'orange')
    .pointAltitude(0)
    .pointRadius(0.02)
    .pointsMerge(true);

// load data
const airportParse = ([airportId, name, city, country, iata, icao, lat, lng, alt, timezone, dst, tz, type, source]) => ({ airportId, name, city, country, iata, icao, lat, lng, alt, timezone, dst, tz, type, source });
const routeParse = ([airline, airlineId, srcIata, srcAirportId, dstIata, dstAirportId, codeshare, stops, equipment]) => ({ airline, airlineId, srcIata, srcAirportId, dstIata, dstAirportId, codeshare, stops, equipment});

Promise.all([
fetch('./data/airports.dat').then(res => res.text())
    .then(d => d3.csvParseRows(d, airportParse)),
fetch('./data/routes.dat').then(res => res.text())
    .then(d => d3.csvParseRows(d, routeParse))
]).then(([airports, routes]) => {

    const byIata = indexBy(airports, 'iata', false);

    const filteredRoutes = routes
        .filter(d => byIata.hasOwnProperty(d.srcIata) && byIata.hasOwnProperty(d.dstIata)) // exclude unknown airports
        .filter(d => d.stops === '0') // non-stop flights only
        .map(d => Object.assign(d, {
        srcAirport: byIata[d.srcIata],
        dstAirport: byIata[d.dstIata]
        }))
        .filter(d => d.srcAirport.country === COUNTRY && d.dstAirport.country !== COUNTRY); // international routes from country

    myGlobe
        .pointsData(airports)
        .arcsData(filteredRoutes);
});