var altr = require('altr')
var fs = require('fs')

module.exports = Details

var template = fs.readFileSync(
    __dirname + '/templates/line.html'
  , 'utf8'
)

function Details(arrivals, i) {
  if(!(this instanceof Details)) {
    return new Details(arrivals, i)
  }

  this.data = {}
  this.title = 'Details'
  this.waiting = true
  this.view = altr(template, this)
  this.el = this.view.rootNodes()
  arrivals.view.lookups.register('data.lines.' + i, this.update.bind(this))
}

Details.prototype.update = update

function update(data) {
  this.data = JSON.stringify(data, null, 4)
  this.view.update(this)
}
