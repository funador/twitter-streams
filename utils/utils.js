'use strict'

var shorten     = require('expand-url')
var pagerank    = require('pagerank')
var size        = require('request-image-size')

module.exports = {

  // Gets root domain for page display
  shorten: (ref, tweet, id) => {
    var url = tweet.url

    shorten.expand(url, (err, expanded) => {
      if(err) console.error("failed in Shorten TOP:" + err.message)
      if(!err) {
        tweet.display_url = expanded.split('/')[2].replace(/www./i, '')
        ref.child(`${tweet.topic}/${id}`).set(tweet)
      }
    })
  },

  // determines google pagerank of root page
  pageRank: (ref, tweet, id) => {
    var url = tweet.url

    shorten.expand(url, (err, expanded) => {
      if(err) cb(new Error("failed in Shorten BTN:" + err.message))
      if(expanded) {
        var url = expanded.split("/").slice(0, 3).join("/")
        pagerank(url, function(err, rank) {
          if(err) cb(new Error("failed in Page Rank:" + err.message))

          else {
            tweet.page_rank = rank
            ref.child(`all/imagesize/${id}`).set(tweet)
          }
        })
      }
    })
  },

  // finds size of image
  imageSize: (ref, tweet, id) => {
    var url = tweet.image

    size(url, function(err, size) {
      if(err) console.error("failed in imageSize:" + err.message)

      if(!err && size) {
        if(size.width > 600 && size.height > 400) {
          ref.child(`all/shorten/${id}`).set(tweet)
        }
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
      if (tweet.indexOf(topics[i]) > -1) {
          filtered = topics[i]
      }
    }
    return filtered
  },

  https: (url) => {
    return url.replace('http', 'https')
  }
}
