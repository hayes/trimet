var Stack = require('./stack')
var altr = require('altr')

altr.addFilter('format_line', format_line)
altr.addFilter('arrival_type', type)
altr.addFilter('remaining', remaining)
altr.addFilter('color', color)
altr.addFilter('split', split)
altr.addFilter('time', time)

document.querySelector('[rel=sidebar-toggle]')
  .addEventListener('click', toggle_sidebar)

var stack = new Stack(document.body)

stack.create('arrivals')

function toggle_sidebar(ev) {
  ev.preventDefault()
  document.querySelector('[rel=sidebar]').classList.toggle('hidden')
}

function format_line(change) {
  return function(desc) {
    if(desc) {
      change(desc.replace(/^.*?[ -]/, ''))
    }
  }
}

function type(change) {
  return function(arrival) {
    if(arrival) {
      change(
          arrival.streetCar || !arrival.fullSign.indexOf('MAX') ? 'rail' : 'bus'
      )
    }
  }
}

function split(change) {
  return function(text, arg) {
    if(typeof text === 'string') {
      change(text.split(arg))
    }
  }
}

function remaining(change) {
  return function(arrival, query) {
    if(!arrival || !query) {
      change('')
    }

    var time = typeof arrival === 'object' ?
      arrival.estimated || arrival.scheduled :
      arrival

    var remaining = (time - query) / (60 * 1000)

    remaining = remaining < 0 ? Math.ceil(remaining) : Math.floor(remaining)
    change(format(remaining, time))
  }
}

function format(min, time) {
  if(min < 60) {
    return '<span class="time">' + min + '</span><span class="unit">' +
      unit(min) + '</span>'
  }

  time = format_time(new Date(time))

  return '<span class="time">' + time.time +
    '</span><span class="unit">' + time.unit + '</span>'
}

function pad(n) {
  return ('00' + n).slice(-2)
}

function unit(n) {
  return (n > 59 ? 'hour' : 'minute') + ((n === 1 || n === 60) ? '' : 's')
}

function color(change) {
  return function(line) {
    var colors = {
        90: 'red'
      , 100: 'blue'
      , 190: 'yellow'
      , 193: 'teal'
      , 194: 'lime'
      , 200: 'green'
    }

    change(colors[line] || 'light-blue')
  }
}

function time(change) {
  return function(ts) {
    var date = format_time(new Date(ts))

    change(date.time + ' ' + date.unit)
  }
}

function format_time(date) {
  var parts = {
      hours: (((date.getHours() - 1) % 12) + 1)
    , minutes: pad(date.getMinutes())
    , part: (date.getHours() > 12 ? 'pm' : 'am')
    , days: (date.getDay() - new Date().getDay() + 7 ) % 7
  }

  var diff = (date - new Date)

  if(parts.days && diff > 6 * 60 * 60 * 1000) {
    return {unit: parts.days > 1 ? 'days' : 'day', time: parts.days}
  }

  return {unit: parts.part, time: parts.hours + ':' + parts.minutes}
}
