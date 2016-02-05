'use strict'

var shorten     = require('expand-url')
var pagerank    = require('pagerank')
var size        = require('request-image-size')

// need something in there to block out certain domains
// like ny-times... how else can you do this?

module.exports = {

  // have a problem here with redirects... maybe look at other packages?

  // Gets root domain for page display
  shorten: (url, cb) => {
    shorten.expand(url, (err, expanded) => {
      if(err) console.error("SHOOOORTEN", err)
      if(!err){
        var display_url = expanded.split('/')[2].replace(/www./i, '')
        cb(null, {display_url: display_url})
      }
    })
  },

  // determines google packrank of root page
  pageRank: (url, cb) => {
    shorten.expand(url, (err, expanded) => {
      if(err) console.error("SHORTNBTN", err)
      if(expanded) {
        var url = expanded.split("/").slice(0, 3).join("/")
        pagerank(url, function(err, rank) {
          if(err) console.error("PAGERANK....", err)
          if(err) {
            cb(null, { page_rank: null })
          }
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
        cb(null, {image_size: 'tweet'})
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
