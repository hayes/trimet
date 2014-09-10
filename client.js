var request = require('hyperquest')
var concat = require('concat-stream')
var altr = require('altr')

altr.addFilter('remaining', function(change) {
  return function(time) {
    change(Math.floor((new Date(time) - new Date) / (60 * 1000)))
  }
})

var arrival_el = document.querySelector('[rel=arrivals]')
var detail_el = document.querySelector('[rel=details]')
var view = altr(arrival_el)

arrival_el.removeAttribute('style')
arrival_el.addEventListener('click', function() {
  arrival_el.classList.add('off-left')
  detail_el.classList.remove('off-right')
})

detail_el.addEventListener('click', function() {
  arrival_el.classList.remove('off-left')
  detail_el.classList.add('off-right')
})

var timer

navigator.geolocation.watchPosition(function(location) {
  clearTimeout(timer)
  update(location)
})

function update(location) {
  var url = 'http://' + window.location.host + '/arrivals?location=' +
    location.coords.latitude + ',' + location.coords.longitude

  request.get(url).pipe(concat(function(data) {
    view.update({lines: JSON.parse(data)})
    timer = setTimeout(update.bind(null, location), 5000)
  }))
}
