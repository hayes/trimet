var Parser = require('./parser')
var path = require('path')
var fs = require('fs')

var start = new Date

module.exports.shapes = {}
module.exports.trips = {}

fs.createReadStream(path.resolve(__dirname, '../gtfs/shapes.txt'))
  .pipe(new Parser)
  .on('data', addPoint)
  .on('end', function() {
    console.log(new Date - start)
    console.log(module.exports.shapes[217767].points)
  })

fs.createReadStream(path.resolve(__dirname, '../gtfs/trips.txt'))
  .pipe(new Parser)
  .on('data', addTrip)

function addPoint(point) {
  if(module.exports.shapes[point.shape_id]) {
    return module.exports.shapes[point.shape_id].points.push(point)
  }

  module.exports.shapes[point.shape_id] = {points: [point]}
}

function addTrip(trip) {
  module.exports.trips[trip.trip_id] = trip
}
