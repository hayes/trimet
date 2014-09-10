var Hapi = require('hapi')
var server = new Hapi.Server(3000)
var arrivals = require('./arrivals')
var watchify = require('watchify/bin/args')

var bundle = watchify()

bundle.add('./client.js')

server.route({
    method: 'GET'
  , path: '/'
  , handler: {
        file: './index.html'
    }
})

server.route({
    method: 'GET'
  , path: '/index.css'
  , handler: {
        file: './index.css'
    }
})

server.route({
    method: 'GET'
  , path: '/client.js'
  , handler: function(req, reply) {
      reply(bundle.bundle())
    }
})

server.route({
    method: 'GET'
  , path: '/arrivals'
  , handler: function(req, reply) {
      arrivals(function(err, data) {
        reply(data)
      })
    }
})

server.start(function() {
  console.log('Server running at:', server.info.uri)
})
