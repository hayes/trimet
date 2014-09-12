var delegate = require('dom-delegate')
var Arrivals = require('./arrivals')
var Stop = require('./stop')
var altr = require('altr')

var types = {
    arrivals: Arrivals
  , stop: Stop
}

module.exports = Stack

function Stack(el) {
  if(!(this instanceof Stack)) {
    return new Stack(el)
  }

  var self = this

  self.el = el
  self.index = -1
  self.stack = []
  self.view = altr(el, self)
  self.events = delegate(el)
  self.events.on('click', '[rel=pop]', function(ev) {
    ev.preventDefault()
    window.history.back()
  })

  window.onpopstate = function(ev) {
    if(ev.state && ev.state.index > self.index) {
      return self.create.apply(self, ev.state.args)
    }

    self.pop()
  }
}

Stack.prototype.create = create
Stack.prototype.push = push
Stack.prototype.pop = pop

function push() {
  var frame = this.create.apply(this, arguments)

  window.history.pushState({
      args: [].slice.call(arguments)
    , index: this.index
  }, frame.title, '/')
}

function create(type) {
  var self = this
  var frame = Object.create(types[type].prototype)
  var args = [].slice.call(arguments, 1).concat([self])
  var result = types[type].apply(frame, args)

  frame = typeof result === 'undefined' ? frame : result
  self.stack.push(frame)
  console.log(frame)
  self.view.update(self, true)
  self.index += 1

  if(self.index > 0) {
    self.stack[self.index - 1].pause && self.stack[self.index - 1].pause()
  }

  setTimeout(function() {
    self.view.update(self, true)
  }, 10)

  return frame
}

function pop(ev) {
  var self = this
  var top = self.stack[self.index]
  var next = self.stack[self.index - 1]

  ev && ev.preventDefault && ev.preventDefault()
  self.index -= 1
  self.view.update(self, true)
  next.resume && next.resume()
  setTimeout(function() {
    self.stack.splice(self.stack.indexOf(top), 1)
    self.view.update(self, true)
    top.destroy && top.destroy()
  }, 500)
}
