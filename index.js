var nr = require('newrelic')
var Hapi = require('hapi')
var server = new Hapi.Server(8080)
var arrivals = require('./server/arrivals')
var watchify = require('watchify/bin/args')
var brfs = require('brfs')

var bundle = watchify()

bundle.add('./client/index.js')
bundle.transform(brfs)

server.route({
    method: 'GET'
  , path: '/'
  , handler: {
        file: './static/index.html'
    }
})

server.route({
    method: 'GET'
  , path: '/index.css'
  , handler: {
        file: './static/index.css'
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
      arrivals(req.query, function(err, data) {
        reply(err || data)
      })
    }
})

server.route({
    method: 'GET'
  , path: '/arrivals/{id}'
  , handler: function(req, reply) {
      arrivals.stop(req.params.id, function(err, data) {
        reply(err || data)
      })
    }
})

server.start(function() {
  console.log('Server running at:', server.info.uri)
})
