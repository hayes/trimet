var delegate = require('dom-delegate')
var altr = require('altr')

module.exports = Stack

function Stack(el) {
  if(!(this instanceof Stack)) {
    return new Stack(el)
  }

  this.el = el
  this.index = -1
  this.stack = []
  this.view = altr(el, this)
  this.events = delegate(el)
  this.events.on('click', '[rel=pop]', this.pop.bind(this))
}

Stack.prototype.push = push
Stack.prototype.pop = pop

function push(item) {
  var self = this

  self.stack.push(item)
  self.view.update(self, true)
  self.index += 1
  setTimeout(function() {
    self.view.update(self)
  }, 10)
}

function pop(ev) {
  var self = this
  var top = self.index

  ev && ev.preventDefault && ev.preventDefault()
  self.index -= 1
  self.view.update(self, true)
  setTimeout(function() {
    self.stack.splice(top, 1)
    self.view.update(self, true)
  }, 1000)
}
