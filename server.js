'use strict'

require('events').EventEmitter.prototype._maxListeners = 100;

var express       = require('express')
var app           = express()
var Firebase      = require('firebase')
var ref           = new Firebase('https://twitter-streams.firebaseio.com/')
var countRef      = new Firebase('https://total-counts.firebaseio.com/')

var unfluff       = require('./apis/unfluff')
var pagerank      = require('./apis/pagerank')
var imagesize     = require('./apis/imagesize')
var shorten       = require('./apis/shorten')
var remove        = require('./apis/firebase.remove_child')
var twitter       = require('./apis/twitter.stream')

// put the stream in a set timeout to reset it every 5 mins?
twitter.stream(ref)
unfluff.unfluff(ref, countRef)
pagerank.pagerank(ref)
imagesize.imagesize(ref)
shorten.shorten(ref)

app.use(express.static('public'))

app.all("/*", (req, res) => {
  res.sendfile('./public/index.html')
})

app.listen(process.env.PORT || 3007)
console.log('Listening on 3007')
