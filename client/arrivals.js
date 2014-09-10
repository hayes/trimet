var concat = require('concat-stream')
var request = require('hyperquest')
var altr = require('altr')
var fs = require('fs')

var template = fs.readFileSync(__dirname + '/templates/arrivals.html', 'utf8')

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
    self.lines = JSON.parse(data)
    self.waiting = false
    self.view.update(self, true)
    clearTimeout(self.timer)
    self.timer = setTimeout(update.bind(self, location), 5000)
  }))
}
