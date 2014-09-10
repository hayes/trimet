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

request.get('http://' + location.host + '/arrivals').pipe(concat(function(data) {
  view.update({lines: JSON.parse(data)})
}))
