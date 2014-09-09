var request = require('hyperquest')
var concat = require('concat-stream')
var altr = require('altr')

altr.addFilter('remaining', function(change) {
    return function(time) {
        change(Math.floor((new Date(time) - new Date) / (60 * 1000)))
    }
})

var view = altr(document.querySelector('ul'))

document.querySelector('ul').removeAttribute('style')

request.get('http://' + location.host + '/arrivals').pipe(concat(function(data) { 
    view.update({lines: JSON.parse(data)})
}))