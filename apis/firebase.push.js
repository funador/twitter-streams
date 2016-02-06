'use strict'

module.exports = {
  push: (ref, id, tweetObj) => {
    ref.child(`all/${id}`).transaction((snap) => {

      // triggers firebase.child_added
      if(!snap) return tweetObj

      // can I do the logic in here?  Try another transaction? 
      if(snap.image_size) {

        // counts number of retweeters
        var length = Object.keys(snap.retweeters).length

        // adds a new retweeter
        snap.retweeters[length] = {
          screen_name: tweetObj.retweeters['0'].screen_name,
          profile_image_url: tweetObj.retweeters['0'].profile_image_url
        }

        snap.count += 1

        ref.child(`${snap.topic}/${snap.image_size}/${id}`).update(snap)

        return snap
      }
    })
  }
}
