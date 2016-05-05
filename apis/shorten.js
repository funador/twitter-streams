'use strict'

var classifier = require('../utils/classifier')
var utils       = require('../utils/utils')

module.exports = {
   shorten: (ref) => {
    ref.child('all/shorten').on('child_added', (snap) => {
      var tweet = snap.val()
      var id    = snap.key()

      if(!tweet.shorten_checked) {

        tweet.shorten_checked = true
        ref.child(`all/shorten/${id}`).set(tweet)

        // send to classifier
        if(tweet.read_mins > 3 && tweet.lang === 'en') {
          classifier.category(id, tweet.topic, tweet.article, tweet)
        }

        // this needs to get sent to sport classifier instead
        utils.trimmed(ref, tweet, id)
      }
    })
  }
}
