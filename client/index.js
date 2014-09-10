var delegate = require('dom-delegate')
var Arrivals = require('./arrivals')
var Details = require('./details')
var Stack = require('./stack')
var altr = require('altr')

var events = delegate(document)

altr.addFilter('remaining', function(change) {
  return function(time) {
    change(Math.floor((new Date(time) - new Date) / (60 * 1000)))
  }
})

events.on('click', '[rel=sidebar-toggle]', toggle_sidebar)
events.on('click', '[rel=line-arrival]', show_detail)

var stack = new Stack(document.body)
var arrivals = new Arrivals()

stack.push(arrivals)

function toggle_sidebar(ev) {
  ev.preventDefault()
  document.querySelector('[rel=sidebar]').classList.toggle('hidden')
}

function show_detail(ev, target) {
  ev.preventDefault()
  stack.push(new Details(arrivals, target.getAttribute('data-index')))
}
