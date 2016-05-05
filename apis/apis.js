'use strict'

var twitter       = require('./twitter.stream')
var unfluff       = require('./unfluff')
var imagesize     = require('./imagesize')
var shorten       = require('./shorten')
var sport         = require('./sport-classifier')
var remove        = require('./firebase.remove_child')
var c             = require('../utils/constants')

module.exports = {

   apis: (ref, countRef) => {
     twitter.stream(ref, countRef)
     unfluff.unfluff(ref, countRef)
     imagesize.imagesize(ref)
     shorten.shorten(ref)
     sport.classify(ref)
     remove.remove_child(ref)
   }
 }
