'use strict'

var express       = require('express')
var app           = express()
var Firebase      = require('firebase')
var firebase      = require('./apis/firebase.child_added')
var twitter       = require('./apis/twitter.stream')
var ref           = new Firebase('https://twitter-streams.firebaseio.com/')

twitter.stream(ref)
firebase.child_added(ref)
// remove old stories
app.use(express.static('public'))

app.all("/*", (req, res) => {
  res.sendfile('./public/index.html')
})

require('events').EventEmitter.prototype._maxListeners = 100
app.listen(process.env.PORT || 3007)
console.log('3007')
