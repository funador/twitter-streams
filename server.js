'use strict'

require('events').EventEmitter.prototype._maxListeners = 200;

var express       = require('express')
var app           = express()
var request       = require('request')
var apis          = require('./apis/apis')

var Firebase      = require('firebase')
var ref           = new Firebase('https://twitter-streams.firebaseio.com/')
var countRef      = new Firebase('https://total-counts.firebaseio.com/')

app.listen(process.env.PORT || 3007)
console.log('Listening on 3007')

app.use(express.static('public'))

app.all("/*", (req, res) => {
  res.sendfile('./public/index.html')
})

apis.apis(ref, countRef)

ref.remove()

// jankiness to restart the server every hour
setTimeout(function() {
  throw error
}, 20 * 60 * 1000)
