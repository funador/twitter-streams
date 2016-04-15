'use strict'

require('events').EventEmitter.prototype._maxListeners = 100;

var express       = require('express')
var app           = express()
var request       = require('request')
var apis          = require('./apis/apis')

var Firebase      = require('firebase')
var ref           = new Firebase('https://twitter-streams.firebaseio.com/')
var countRef      = new Firebase('https://total-counts.firebaseio.com/')

app.listen(process.env.PORT || 3007)
console.log('Listening on 3007')

apis.apis(ref, countRef)
