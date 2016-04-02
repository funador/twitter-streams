'use strict'

var utils       = require('../utils/utils')
var unfluff     = require('../utils/unfluff')

module.exports = {
   unfluff: (ref, countRef) => {
    ref.child('all/unfluff').on('child_added', (snap) => {
      var tweet = snap.val()
      var id    = snap.key()

      if(!tweet.unfluff_checked) {

        // prevent looping of lookups
        tweet.unfluff_checked = true
        ref.child(`all/unfluff/${id}`).set(tweet)
        unfluff.unfluff(ref, countRef, tweet, id)
      }
    })
  }
}
