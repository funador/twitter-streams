'use strict'

var app           = require('express')()
var Firebase      = require('firebase')
var firebase      = require('./apis/firebase.child_added')
var twitter       = require('./apis/twitter')
var ref           = new Firebase('https://twitter-streams.firebaseio.com/')

twitter.stream(ref)
firebase.child_added(ref)
// remove old stories
// when passing in references.  Must always be in order of ref, id, work.

app.listen(process.env.PORT || 3007)
console.log('3007')
