'use strict'

var Firebase    = require('firebase')
var ref         = new Firebase('https://nodeclassifier.firebaseio.com/')

module.exports = {
  category: (id, tag, article, cb) => {
    ref.child(tag + "/" + id).set({ article: article })
    cb(null, 'classified')
  }
}
