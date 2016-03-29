var bindings = require('gtfs-realtime-bindings')
var concat = require('concat-stream')
var http = require('http')

http.get('http://developer.trimet.org/ws/V1/TripUpdate/?appid=E21CBC63D8695BCEDC122DE03&json=true', function (res) {
  res.pipe(concat(parse))
})

function parse(data) {
  console.log(bindings.FeedMessage.decode(data).entity[60].trip_update)
}
