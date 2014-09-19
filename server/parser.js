var TransfromStream = require('stream').Transform

module.exports = Parser

function Parser(row, col) {
  TransfromStream.call(this)

  this._writableState.objectMode = false
  this._readableState.objectMode = true
  this.row_delim = row || '\r\n'
  this.col_delim = col || ','
  this.headers = null
  this.buf = ''

  this.Item = function(args) {
    this.args = args
  }
}

Parser.prototype = Object.create(TransfromStream.prototype)
Parser.prototype._transform = transfrom
Parser.prototype._flush = flush

Parser.prototype.setHeaders = setHeaders
Parser.prototype.parse = parse

function transfrom(chunk, encoding, cb) {
  var end

  this.buf += chunk

  if(!this.headers) {
    if(!~(end = this.buf.indexOf(this.row_delim))) {
      return cb()
    }

    this.setHeaders(this.buf.slice(0, end))
    this.buf = this.buf.slice(end + this.row_delim.length)
  }

  if(this.buf) {
    this.parse()
  }

  cb()
}

function parse() {
  var lines = this.buf.split(this.row_delim)

  this.buf = lines.pop()

  for(var i = 0, l = lines.length; i < l; ++i) {
    this.push(new this.Item(lines[i].split(this.col_delim)))
  }
}

function flush(cb) {
  if(!this.buf.length) {
    this.push(new this.Item(this.buf.split(this.col_delim)))
  }

  cb()
}

function setHeaders(headers) {
  var props = {}

  this.headers = headers.split(this.col_delim)

  for(var i = 0, l = this.headers.length; i < l; ++i) {
    props[this.headers[i]] = {get: get(i), enumerable: true}
  }

  Object.defineProperties(this.Item.prototype = {}, props)

  function get(i) {
    return function() {
      return this.args[i]
    }
  }
}
