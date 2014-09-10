var request = require('hyperquest')
var concat = require('concat-stream')
var altr = require('altr')

altr.addFilter('remaining', function(change) {
  return function(time) {
    change(Math.floor((new Date(time) - new Date) / (60 * 1000)))
  }
})

var main_el = document.querySelector('[rel=main]')
var arrival_el = document.querySelector('[rel=arrivals]')
var detail_el = document.querySelector('[rel=details]')
var sidebar_toggle = document.querySelector('[rel=sidebar-toggle]')
var sidebar_el = document.querySelector('[rel=sidebar]')
var view = altr(main_el, {})

arrival_el.removeAttribute('style')
arrival_el.addEventListener('click', function() {
  arrival_el.classList.add('off-left')
  detail_el.classList.remove('off-right')
})

detail_el.addEventListener('click', function() {
  arrival_el.classList.remove('off-left')
  detail_el.classList.add('off-right')
})

sidebar_toggle.addEventListener('click', toggle_sidebar)

var timer

navigator.geolocation.watchPosition(function(location) {
  arrival_el.classList.remove('off-right')
  clearTimeout(timer)
  update(location)
})

function update(location) {
  var url = 'http://' + window.location.host + '/arrivals?location=' +
    location.coords.latitude + ',' + location.coords.longitude

  request.get(url).pipe(concat(function(data) {
    view.update({lines: JSON.parse(data), location: location}, true)
    timer = setTimeout(update.bind(null, location), 5000)
  }))
}

function toggle_sidebar(ev) {
  ev.preventDefault()
  sidebar_el.classList.toggle('hidden')
}
