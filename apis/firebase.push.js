'use strict'

var klout   = require('../apis/klout.cue')

module.exports = {
  push: (ref, id, tweetObj) => {
    ref.child(`all/${id}`).transaction((snap) => {

      // triggers firebase.child_added
      if(!snap) return tweetObj

      if(snap.image_size) {

        // counts number of retweeters
        var length = Object.keys(snap.retweeters).length

        // adds a new retweeter
        snap.retweeters[length] = {
          screen_name: tweetObj.retweeters['0'].screen_name,
          profile_image_url: tweetObj.retweeters['0'].profile_image_url
        }

        // klout screen_name and id sends to the cue
        klout.cue(ref, `${snap.topic}/${snap.image_size}/${id}`, snap.retweeters[length].screen_name)

        ref.child(`${snap.topic}/${snap.image_size}/${id}`).update(snap)

        return snap
      }
    })
  }
}
