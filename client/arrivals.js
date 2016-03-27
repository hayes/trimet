var delegate = require('dom-delegate')
var concat = require('concat-stream')
var request = require('hyperquest')
var altr = require('altr')
var fs = require('fs')

var template = fs.readFileSync(
    __dirname + '/templates/arrivals.html'
  , 'utf8'
)

module.exports = Arrivals

function Arrivals(stack) {
  if(!(this instanceof Arrivals)) {
    return new Arrivals(stack)
  }

  var self = this

  self.title = 'Arrivals'
  self.waiting = true
  self.view = altr(template, self)
  self.el = self.view.rootNodes()

  var events = delegate(self.el[0])

  events.on('click', '[rel=stop-location]', function(ev, target) {
    ev.preventDefault()
    stack.push(
        'stop'
      , target.getAttribute('data-id')
      , target.getAttribute('data-title')
    )
  })

  navigator.geolocation.watchPosition(function(location) {
    self.location = location
    self.update()
  })
}

Arrivals.prototype.update = update
Arrivals.prototype.pause = pause
Arrivals.prototype.destroy = pause
Arrivals.prototype.resume = resume

function update() {
  var self = this
  var url = window.location.protocol + '//' + window.location.host + '/arrivals?location=' +
    self.location.coords.latitude + ',' + self.location.coords.longitude

  request.get(url).pipe(concat(function(data) {
    self.data = JSON.parse(data)
    self.waiting = false
    self.view.update(self, true)
    clearTimeout(self.timer)
    if(!self.paused) {
      self.timer = setTimeout(update.bind(self), 5000)
    }
  }))
}

function pause() {
  this.paused = true
  clearTimeout(this.timer)
}

function resume() {
  this.paused = false
  this.update()
}
