'use strict'

var twitter       = require('./twitter.stream')
var unfluff       = require('./unfluff')
var pagerank      = require('./pagerank')
var imagesize     = require('./imagesize')
var shorten       = require('./shorten')
var remove        = require('./firebase.remove_child')
var c             = require('../utils/constants')

module.exports = {

   apis: (ref, countRef) => {

     twitter.stream(ref, countRef)
     unfluff.unfluff(ref, countRef)
    //  pagerank.pagerank(ref)
     imagesize.imagesize(ref)
     shorten.shorten(ref)
    //  remove.remove_child(ref)

   }
 }
