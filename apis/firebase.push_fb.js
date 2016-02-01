'use strict'

var async   = require('async')
var klout   = require('../apis/klout')

module.exports = {
  push_fb: (ref, tweetObj, id) => {

    ref.child(`all/${id}`).transaction((snap) => {
      // triggers child_added
      if(!snap) return tweetObj

      // otherwise builds
      var length = Object.keys(tweetObj.retweeters).length

      // we are not getting more than 2 retweeters through, should this be done to snap?
      tweetObj.retweeters[length] = {
        screen_name: tweetObj.retweeters['0'].screen_name,
        profile_image_url: tweetObj.retweeters['0'].profile_image_url
      }

      klout.cue(tweetObj.retweeters[length].screen_name)
      ref.child(`${tweetObj.topic}/${tweetObj.image_size}/${id}`).update(tweetObj)
    })
  }
}
