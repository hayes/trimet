var qs = require('querystring')
var app_id = 'E21CBC63D8695BCEDC122DE03'
var concat = require('concat-stream')
var request = require('hyperquest')

module.exports = function(options, done) {
  get_stops(options.location, function(err, stops) {
    if(err) {
      return done(err)
    }

    get_arrivals(stops.map(get_locid), {}, function(err, data) {
      if(err) {
        return done(err)
      }

      var arrivals = data.arrivals
      var time = data.time

      var lines = {}
        , list = []
        , key
        , i
        , l

      for(i = 0, l = stops.length; i < l; ++i) {
        stops[i].route && stops[i].route.forEach(add.bind(null, stops[i]))
      }

      for(i = 0, l = arrivals.length; i < l; ++i) {
        key = arrivals[i].dir ? 'inbound' : 'outbound'

        if(!lines[arrivals[i].route][key].arrivals.length) {
          lines[arrivals[i].route][key].arrivals.push(arrivals[i])
        } else if(arrivals[i].route == 77) {
        }
      }

      done(null, {time: time, lines: list})

      function add(stop, route) {
        var line = lines[route.route]
        var key

        if(!line) {
          line = {
              route: route
          }

          lines[route.route] = line
          list.push(line)
        }

        for(var j = 0, l2 = route.dir.length; j < l2; ++j) {
          key = route.dir[j].dir ? 'inbound' : 'outbound'

          if(line[key]) {
            continue
          }

          line[key] = {
              stop: stop
            , arrivals: []
            , desc: route.dir[j].desc
          }
        }
      }
    })
  })
}

module.exports.stop = function(id, done) {
  get_arrivals([id], {data: true, arrivals: 4, showPosition: true}, function(err, data) {
    if(err) {
      return done(err)
    }

    data.location = data.locations[0]
    done(data)
  })
}

function get_arrivals(stops, options, done) {
  options.appID = app_id
  options.json = true

  var url = 'http://developer.trimet.org/ws/v2/arrivals?'

  var remaining = Math.ceil(stops.length / 10)
  var arrivals = []
  var locations = []
  var detours = []
  var results = new Array(remaining)

  for(var i = 0, l = remaining; i < l; ++i) {
    options.locIDs = stops.slice(i * 10, (i + 1) * 10).join(',')
    request.get(url + qs.stringify(options)).pipe(concat(on_results.bind(null, i)))
  }

  function on_results(i, data) {
    results[i] = JSON.parse(data).resultSet

    if(--remaining) {
      return
    }

    var output = {
        arrivals: []
      , locations: []
      , detours: []
    }

    for(var j = 0, l2 = results.length; j < l2; ++j) {
      output.arrivals = output.arrivals.concat(results[j].arrival)
      output.locations = output.locations.concat(results[j].location)
      output.detours = output.detours.concat(results[j].detour)
    }

    output.time = results[i].queryTime
    done(null, output)
  }
}

function get_locid(stop) {
  return stop.locid
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
    var stops = JSON.parse(data).resultSet.location.filter(unique)

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
