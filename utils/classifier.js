'use strict'

var Firebase    = require('firebase')
var ref         = new Firebase('https://nodeclassifier.firebaseio.com/')

module.exports = {
  category: (id, tag, article, tweet) => {
    if(tweet.title) {
      ref.child(`${tag}/${id}`).set({ article: article, title: tweet.title, description: tweet.description, timestamp: Date.now() })
    }
  }
}
