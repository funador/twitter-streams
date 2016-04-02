'use strict'

var utils       = require('../utils/utils')

module.exports = {
   pagerank: (ref) => {
    ref.child('all/pagerank').on('child_added', (snap) => {
      var tweet = snap.val()
      var id    = snap.key()

      if(!tweet.pagerank_checked) {

        tweet.pagerank_checked = true
        ref.child(`all/pagerank/${id}`).set(tweet)

        utils.pageRank(ref, tweet, id)
      }
    })
  }
}
