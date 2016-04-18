'use strict'

var shorten     = require('expand-url')
var size        = require('request-image-size')
var push        = require('../apis/firebase.push')
var request     = require('request')

module.exports = {

  // Gets root domain for page display
  trimmed: (ref, tweet, id) => {
    var url = tweet.url

    shorten.expand(url, (err, expanded) => {
      if(err) console.error("failed in Shorten TOP:" + err.message)
      if(!err) {
        tweet.display_url = expanded.split('/')[2].replace(/www./i, '')
        ref.child(`${tweet.topic}/${id}`).set(tweet)
      }
    })
  },

  // expands the url to use as unique identifier
  expander: (ref, tweet, id) => {
    var url = tweet.url

    shorten.expand(url, (err, expanded) => {
      if(err) console.error("failed in expanded TOP:" + err.message)
      if(!err) {

        // strip all punctuation to use as firebase id
        var id = expanded.replace(/[^\w\s]|_/g, "")
                         .replace(/\s+/g, " ")
                         .replace('http', '')
                         .replace('www', '')
                         .replace('com', '')
                         .substring(0, 70)

        tweet.id = id
        // send to firebase to start unfluff
        push.push(ref, id, tweet)
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
