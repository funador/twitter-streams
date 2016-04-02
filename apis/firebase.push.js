'use strict'

module.exports = {
  push: (ref, id, tweetObj) => {
    ref.child(`all/unfluff/${id}`).transaction((snap) => {

      // triggers unfluff.js
      if(!snap) return tweetObj

      ref.child(`${snap.topic}/${id}`).once('value', (snapshot) => {
        if(snapshot.val()){
          var tweet = snapshot.val()
          tweet.count = tweet.count + 1

          var length = Object.keys(tweet.retweeters).length

          tweet.retweeters[length] = {
            screen_name: tweetObj.retweeters['0'].screen_name,
            profile_image_url: tweetObj.retweeters['0'].profile_image_url
          }

          ref.child(`${snap.topic}/${id}`).update(tweet)
        }
      })
    })
  }
}
