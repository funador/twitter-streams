'use strict'

var shorten     = require('expand-url')
var pagerank    = require('pagerank')
var size        = require('request-image-size')

module.exports = {

  // Gets root domain for page display
  shorten: (url, cb) => {
    shorten.expand(url, (err, expanded) => {
      if(err) cb(new Error("failed in Shorten TOP:" + err.message))
      if(!err){
        var display_url = expanded.split('/')[2].replace(/www./i, '')
        cb(null, {display_url: display_url})
        return
      }
    })
  },

  // determines google packrank of root page
  pageRank: (url, cb) => {
    shorten.expand(url, (err, expanded) => {
      if(err) cb(new Error("failed in Shorten BTN:" + err.message))
      if(expanded) {
        var url = expanded.split("/").slice(0, 3).join("/")
        pagerank(url, function(err, rank) {
          if(err) cb(new Error("failed in Page Rank:" + err.message))

          else {
            cb(null, { page_rank: rank })
            return
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
          return
        }
        else if(size.width > 600) {
          cb(null, {image_size: 'story'})
          return
        }
        else {
          cb(null, {image_size: 'tweet'})
          return
        }
      }
      else {
        cb(null, {image_size: 'tweet'})
        return
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
