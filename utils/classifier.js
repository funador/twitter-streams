'use strict'

var Firebase    = require('firebase')
var ref         = new Firebase('https://nodeclassifier.firebaseio.com/')

module.exports = {
  category: (title, tag, article, tweet) => {
    ref.child(`${tag}/${title}`).set({ article: article, title: title, timestamp: Date.now() })
  }
}
