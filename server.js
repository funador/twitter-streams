'use strict'

var express       = require('express')
var app           = express()
var Firebase      = require('firebase')
var firebase      = require('./apis/firebase.child_added')
var remove        = require('./apis/firebase.remove_child')
var twitter       = require('./apis/twitter.stream')
var ref           = new Firebase('https://twitter-streams.firebaseio.com/')

// put the stream in a set timeout to reset it every 5 mins?
twitter.stream(ref)
firebase.child_added(ref)
// remove.remove_child(ref)

app.use(express.static('public'))

app.all("/*", (req, res) => {
  res.sendfile('./public/index.html')
})

require('events').EventEmitter.prototype._maxListeners = 100
app.listen(process.env.PORT || 3007)
console.log('Listening on 3007')
