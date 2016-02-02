'use strict'

var klout   = require('../apis/klout')

module.exports = {
  push_fb: (ref, tweetObj, id) => {

    ref.child(`all/${id}`).transaction((snap) => {

      // triggers firebase.child_added
      if(!snap) return tweetObj

      // otherwise builds object
      var length = Object.keys(snap.retweeters).length

      // we are not getting more than 2 retweeters through, should this be done
      // to snap not tweetObj?
      snap.retweeters[length] = {
        screen_name: tweetObj.retweeters['0'].screen_name,
        profile_image_url: tweetObj.retweeters['0'].profile_image_url
      }

      klout.cue(snap.retweeters[length].screen_name, `${snap.topic}/${snap.image_size}/${id}`)
      
      ref.child(`${snap.topic}/${snap.image_size}/${id}`).update(snap)
    })
  }
}
