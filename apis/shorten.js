'use strict'

var classifier = require('../utils/classifier')
var utils       = require('../utils/utils')

module.exports = {
   shorten: (ref) => {
    ref.child('all/shorten').on('child_added', (snap) => {
      var tweet = snap.val()
      var id    = snap.key()

      if(!tweet.shorten_checked) {

        // prevent looping of lookups
        tweet.shorten_checked = true
        ref.child(`all/shorten/${id}`).set(tweet)

        // send to classifier
        classifier.category(id, tweet.topic, tweet.article)

        utils.shorten(ref, tweet, id)
      }
    })
  }
}
