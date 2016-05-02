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
          var toAdd = true
          var length = Object.keys(tweet.retweeters).length

          // check to make sure retweeter is not already recorded
          for (var i = 0; i < length; i++) {
            if(tweetObj.retweeters[0].screen_name === tweet.retweeters[i].screen_name) {
              console.log("tweeter already exists");
              toAdd = false
            }
          }

          if(toAdd) {
            tweet.retweeters[length] = {
              screen_name: tweetObj.retweeters['0'].screen_name,
              profile_image_url: tweetObj.retweeters['0'].profile_image_url
            }
            console.log("adding retweeter-------------------");
            ref.child(`${snap.topic}/${id}`).update(tweet)
          }
        }
      })
    })
  }
}
