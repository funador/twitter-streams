'use strict'

var utils       = require('../utils/utils')

module.exports = {
   imagesize: (ref) => {
    ref.child('all/imagesize').on('child_added', (snap) => {
      var tweet = snap.val()
      var id    = snap.key()

      if(!tweet.image_size_checked) {
        tweet.image_size_checked = true
        ref.child(`all/imagesize/${id}`).set(tweet)

        utils.imageSize(ref, tweet, id)
      }
    })
  }
}
