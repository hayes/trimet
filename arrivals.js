var qs = require('querystring')
var app_id = 'E21CBC63D8695BCEDC122DE03'
var location = '45.534054,-122.6495752'
var concat = require('concat-stream')
var request = require('hyperquest')


module.exports = function(done) {
  get_stops(location, function(err, stops) {
    get_arrivals(stops, function(err, arrivals) {
      var lines = {}
        , list = []
        , key

      for(var i = 0, l = stops.length; i < l; ++i) {
        stops[i].route && stops[i].route.forEach(add.bind(null, stops[i]))
      }

      for(var i = 0, l = arrivals.length; i < l; ++i) {
        key = arrivals[i].dir ? 'inbound' : 'outbound'
        lines[arrivals[i].route][key].arrivals.push(arrivals[i])
      }

      done(null, list)

      function add(stop, route) {
        var line = lines[route.route]
        
        if(!line) {
            var line = {
              route: route
          }

          lines[route.route] = line
          list.push(line)
        }

        for(var i = 0, l = route.dir.length; i < l; ++i) {
          line[route.dir[i].dir ? 'inbound' : 'outbound'] = {
              stop: stop
            , arrivals: []
            , desc: route.dir[i].desc
          }
        }
      }
    })
  })
}

function get_arrivals(stops, done) {
 var options = {
      appID: app_id
    , locIDs: stops.map(get_locid).join(',')
    , showPosition: true
    , minutes: 20
    , arrivals: 2
    , json: true
  }

  var url = 'http://developer.trimet.org/ws/v2/arrivals?' + qs.stringify(options)

  request.get(url).pipe(concat(function(data) {
    done(null, JSON.parse(data).resultSet.arrival)
  }))

  function get_locid(stop) {
    return stop.locid
  }
}

function get_stops(location, done) {
  var options = {
      appID: app_id
    , ll: location
    , showRoutes: true
    , showRouteDirs: true
    , feet: 2640
    , json: true
  }

  var url = 'http://developer.trimet.org/ws/V1/stops?' + qs.stringify(options)

  request.get(url).pipe(concat(function(data) {
    var seen = {}
    var stops = JSON.parse(data).resultSet.location.filter(unique).slice(0, 10)

    done(null, stops)

    function unique(stop) {
      var routes = get_routes(stop)
      var has_new = false

      for(var i = 0, l = routes.length; i < l; ++i) {
        if(!seen[routes[i]]) {
          seen[routes[i]] = stop
          has_new = true
        }
      }

      return has_new
    }
  }))

  function get_routes(stop) {
    if(!stop.route) {
      return []
    }

    var routes = []

    stop.route.forEach(function(route) {
      route.dir.forEach(function(dir) {
        routes.push(route.desc + ' - ' + dir.desc)
      })
    })

    return routes
  }
}