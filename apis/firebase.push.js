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

          // you could do the check here to make sure that the retweeter does not already exist. 
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
