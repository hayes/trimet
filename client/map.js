mapboxgl.accessToken = 'pk.eyJ1IjoibWljaGFlbGdoYXllcyIsImEiOiJaWWV4R0cwIn0.NS_qMx2bWjM5oeiqfxG-bQ';

var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v9'
});

map.setCenter([-122, 45])
map.setZoom(16)

document.getElementById('map').classList.add('hidden')
setTimeout(function () {
  document.getElementById('map').classList.remove('initial')
})
module.exports = map
