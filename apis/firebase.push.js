'use strict'

var klout   = require('../apis/klout')

module.exports = {
  push: (ref, tweetObj, id) => {

    ref.child(`all/${id}`).transaction((snap) => {

      // triggers firebase.child_added
      if(!snap) return tweetObj

      // counts number of retweeters
      var length = Object.keys(snap.retweeters).length

      // adss a retweeter, only want to pick up the new retweeter here
      snap.retweeters[length] = {
        screen_name: tweetObj.retweeters['0'].screen_name,
        profile_image_url: tweetObj.retweeters['0'].profile_image_url
      }

      // klout screen_name and id sends to the cue
      klout.cue(ref, `${snap.topic}/${snap.image_size}/${id}`, snap.retweeters[length].screen_name)

      // updates the object with new retweeter
      ref.child(`${snap.topic}/${snap.image_size}/${id}`).update(snap)
    })
  }
}
