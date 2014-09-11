var concat = require('concat-stream')
var request = require('hyperquest')
var altr = require('altr')
var fs = require('fs')

var template = fs.readFileSync(
    __dirname + '/templates/arrivals.html'
  , 'utf8'
)

altr.addFilter('route', format_route)
altr.addFilter('remaining', remaining)

module.exports = Arrivals

function Arrivals() {
  if(!(this instanceof Arrivals)) {
    return new Arrivals()
  }

  var self = this

  self.title = 'Arrivals'
  self.waiting = true
  self.view = altr(template, self)
  self.el = self.view.rootNodes()

  navigator.geolocation.watchPosition(function(location) {
    self.location = location
    self.update()
  })
}

Arrivals.prototype.update = update

function update() {
  var self = this
  var url = 'http://' + window.location.host + '/arrivals?location=' +
    self.location.coords.latitude + ',' + self.location.coords.longitude

  request.get(url).pipe(concat(function(data) {
    self.data = JSON.parse(data)
    self.waiting = false
    self.view.update(self, true)
    clearTimeout(self.timer)
    //self.timer = setTimeout(update.bind(self, location), 5000)
  }))
}

function format_route(change) {
  var colors = {
      90: 'red'
    , 100: 'blue'
    , 190: 'yellow'
    , 193: 'teal'
    , 194: 'lime'
    , 200: 'green'
  }

  return function(route) {
    if(!route) {
      return change('')
    } else if(route.type === 'B') {
      return change(
          '<span class="bus-line-header">' + route.route + '</span>' +
            '<span class="line-description">' +
            route.desc.split(/\-/)[1] + '</span>'
      )
    }

    return change(
        '<span class="rail-line-header ' + colors[route.route] + '">' +
          route.desc + '</span>'
    )
  }
}

function remaining(change) {
  return function(arrival, query) {
    if(!arrival || !query) {
      return
    }

    var time = arrival.estimated || arrival.scheduled
    var remaining = (time - query) / (60 * 1000)

    remaining = remaining < 0 ? Math.ceil(remaining) : Math.floor(remaining)
    change(format(remaining))
  }
}

function format(min) {
  return '<span class="time">' +
    (min > 60 ? Math.floor(min / 60) + ':' + pad(min) % 60 : min) +
    '</span><span class="unit">' + unit(min) + '</span>'
}

function pad(n) {
  return ('00' + n).slice(-2)
}

function unit(n) {
  return (n > 59 ? 'hour' : 'minute') + ((n === 1 || n === 60) ? '' : 's')
}
