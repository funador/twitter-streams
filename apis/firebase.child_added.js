'use strict'

var async       = require('async')
var klout       = require('../apis/klout')
var utils       = require('../utils/utils')
var unfluff     = require('../utils/unfluff')
var classifier  = require('../utils/classifier')

module.exports = {
   child_added: (ref) => {
    ref.child('all').on('child_added', (snap) => {
      var tweet = snap.val()
      var id    = snap.key()

      // should I have an else on this?
      if(!tweet.deleteRef) {
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
            },
            // todo: add influencees to score
            // todo: make klout cue
            (cb) => {
              if(!tweet.checked) {
                // klout.cue(ref, id, tweet.retweeters[0].screen_name)
                // no need to check anymore, will store Klout scores
                klout.score(tweet.retweeters[0].screen_name, cb)
              }
            },
            (cb) => {
              if(!tweet.checked) {
                // klout.cue(ref, id, tweet.retweeters[0].screen_name)
                klout.score(tweet.screen_name, cb)
              }
            }
          ],
          // klouted = cb of previous functions
          function(err, klouted) {
            tweet.image_size      = klouted[0].image_size
            tweet.score           = klouted[2] + klouted[3]
            tweet.title           = unfluffed[0].title
            tweet.image           = unfluffed[0].image
            tweet.description     = unfluffed[0].description
            tweet.read_mins       = unfluffed[0].read_mins
            tweet.page_rank       = unfluffed[1].page_rank
            tweet.display_url     = unfluffed[2].display_url
            tweet.checked         = true

            ref.child(`${tweet.topic}/${tweet.image_size}/${id}`).set(tweet)

            ref.child(`all/${id}`).set({
              deleteRef: `${tweet.topic}/${tweet.image_size}/${id}`,
              timestamp: Date.now()
            })
          })
        })
      }
    })
  }
}
