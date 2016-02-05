'use strict'

var async       = require('async')
var klout       = require('../apis/klout.cue')
var utils       = require('../utils/utils')
var unfluff     = require('../utils/unfluff')
var classifier  = require('../utils/classifier')

module.exports = {
   child_added: (ref) => {
    ref.child('all').on('child_added', (snap) => {
      var tweet = snap.val()
      var id    = snap.key()

      // should I have an else on this?
      if(!tweet.checked) {
        async.parallel([
          (cb) => {
            unfluff.unfluff(tweet.url, cb)
          },
          (cb) => {
            utils.pageRank(tweet.url, cb)
          },
          (cb) => {
            utils.shorten(tweet.url, cb)
          }
        ],
        // unfluffed = cb of previous functions
        (err, unfluffed) => {
          async.parallel([
            (cb) => {
              utils.imageSize(unfluffed[0].image, cb)
            }
          ],
          // sized = cb of previous function
          function(err, sized) {
            tweet.image_size      = sized[0].image_size
            tweet.title           = unfluffed[0].title
            tweet.image           = unfluffed[0].image
            tweet.description     = unfluffed[0].description
            tweet.read_mins       = unfluffed[0].read_mins
            tweet.page_rank       = unfluffed[1].page_rank
            tweet.display_url     = unfluffed[2].display_url
            tweet.checked         = true

            // send both retweeter and tweeter to klout cue for scoring
            klout.cue(ref, `${tweet.topic}/${tweet.image_size}/${id}`, tweet.retweeters[0].screen_name)
            klout.cue(ref, `${tweet.topic}/${tweet.image_size}/${id}`, tweet.screen_name)

            // send to classifier
            classifier.category(id, tweet.topic, unfluffed[0].article)

            // set the new ref
            ref.child(`${tweet.topic}/${tweet.image_size}/${id}`).set(tweet)
            ref.child(`all/${id}`).update({
              image_size: sized[0].image_size
            })
          })
        })
      }
    })
  }
}
