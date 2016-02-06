'use strict'

var async       = require('async')
var utils       = require('../utils/utils')
var unfluff     = require('../utils/unfluff')
var classifier  = require('../utils/classifier')

module.exports = {
   child_added: (ref) => {
    ref.child('all').on('child_added', (snap) => {
      var tweet = snap.val()
      var id    = snap.key()

      if(!tweet.checked) {

        // transaction to prevent looping of lookups
        ref.child(`all/${id}`).transaction((snap) => {
          snap.checked = true
          return snap
        })

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
          if(unfluffed[0] && unfluffed[1] && unfluffed[2]) {

            async.parallel([
              (cb) => {
                utils.imageSize(unfluffed[0].image, cb)
              }
            ],
            // sized = cb of previous function
            function(err, sized) {
              if(sized[0]) {
                tweet.image_size      = sized[0].image_size
                tweet.title           = unfluffed[0].title
                tweet.image           = unfluffed[0].image
                tweet.description     = unfluffed[0].description
                tweet.read_mins       = unfluffed[0].read_mins
                tweet.page_rank       = unfluffed[1].page_rank
                tweet.display_url     = unfluffed[2].display_url

                // send to classifier
                classifier.category(id, tweet.topic, unfluffed[0].article)

                // set the new ref
                ref.child(`${tweet.topic}/${tweet.image_size}/${id}`).set(tweet)

                ref.child(`all/${id}`).update({
                  image_size: sized[0].image_size
                })
              }
            })
          }
        })
      }
    })
  }
}
