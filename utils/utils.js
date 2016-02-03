'use strict'

var shorten     = require('expand-url')
var pagerank    = require('pagerank')
var size        = require('request-image-size')
var moment      = require('moment')

module.exports = {

  // Gets root domain for page display
  shorten: (url, cb) => {
    shorten.expand(url, (err, expanded) => {
      if(!err){
        var display_url = expanded.split('/')[2].replace(/www./i, '')
        cb(null, {display_url: display_url})
      }
    })
  },

  // determines google packrank of root page
  pageRank: (url, cb) => {
    shorten.expand(url, (err, expanded) => {
      if(expanded) {
        var url = expanded.split("/").slice(0, 3).join("/")
        pagerank(url, function(err, rank) {
          if(err) cb(null, { page_rank: null })
          else {
            cb(null, { page_rank: rank })
          }
        })
      }
    })
  },

  // takes the size of image and returns a ref
  imageSize: (url, cb) => {
    size(url, function(err, size) {
      if(!err && size){
        if(size.width > 1000 && size.height > 400) {
          cb(null, {image_size: 'hero'})
        }
        else if(size.width > 600) {
          cb(null, {image_size: 'story'})
        }
        else {
          cb(null, {image_size: 'tweet'})
        }
      } 
      else {
        cb(null, {image_size: 'none'})
      }
    })
  },

  // replace tags with text
  cleanText: (text) => {
    text.replace(/&nbsp;/g, " ")
        .replace(/&#39;/g, "'")
        .replace(/&amp;/g, '&')
    return text
  },

  // true if account age is one year or older
  accountAge: (age_user) => {
    if(moment(age_user).fromNow().slice(2, 6) === 'year') return true
    return false
  },

  // filter the tweet for tracked topic
  // this should be a proper filter
  topic: (text, topics) => {
    var tweet = text.toLowerCase()
    var filtered = ''

    for (var i = 0; i < topics.length; i++) {
      if (tweet.indexOf(topics[i]) > -1){
          filtered = topics[i]
      }
    }
    return filtered
  }

}
