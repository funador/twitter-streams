'use strict'

var app           = require('express')()
var Firebase      = require('firebase')
var firebase      = require('./apis/firebase.child_added')
var klout         = require('./apis/klout.score')
var twitter       = require('./apis/twitter.stream')
var ref           = new Firebase('https://twitter-streams.firebaseio.com/')

twitter.stream(ref)
firebase.child_added(ref)
klout.score(ref)
// remove old stories

require('events').EventEmitter.prototype._maxListeners = 100
app.listen(process.env.PORT || 3007)
console.log('3007')
