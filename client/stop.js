var concat = require('concat-stream')
var request = require('hyperquest')
var altr = require('altr')
var fs = require('fs')

module.exports = Stop

var template = fs.readFileSync(
    __dirname + '/templates/stop.html'
  , 'utf8'
)

function Stop(id, title) {
  if(!(this instanceof Stop)) {
    return new Stop(id, title)
  }

  this.id = id
  this.waiting = true
  this.title = title
  this.view = altr(template, this)
  this.el = this.view.rootNodes()
  this.update()
}

Stop.prototype.update = update
Stop.prototype.pause = pause
Stop.prototype.destroy = pause

function update() {
  var self = this
  var url = 'http://' + window.location.host + '/arrivals/' + self.id

  request.get(url).pipe(concat(function(data) {
    self.data = JSON.parse(data)
    self.raw = JSON.stringify(self.data, null, 2)
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
