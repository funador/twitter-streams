'use strict'

var utils       = require('../utils/utils')
var c           = require('../utils/constants')
var firebase    = require('./firebase.push')
var topicsArr   = ['nfl', 'nba', 'nhl', 'mlb', 'dfs']

module.exports = {

  stream: (ref, countRef) => {

    var stream = c.T.stream('statuses/filter', { track: topicsArr })

    stream.on('tweet', (tweet) => {

      // keep track of how many tweets are coming in
      countRef.child('sported').transaction(function(snap){
        if(!snap) return 1
        else return snap + 1
      })

      if(tweet.user){
        var age = tweet.user.created_at.split(' ')[5]
        console.log(tweet.user.screen_name)
      }

      if(tweet.text){
        var topic = utils.topic(tweet.text, topicsArr)
      }

      if(tweet.retweeted_status && tweet.entities.urls[0] && age < 2015 && tweet.text) {

        if(tweet.entities.urls[0].expanded_url){
          var url = tweet.entities.urls[0].expanded_url
        }

        var id  = tweet.retweeted_status.id
        var profile_image_url = utils.https(tweet.retweeted_status.user.profile_image_url)
        var retweeter_image_url = utils.https(tweet.user.profile_image_url)

        var tweetObj = {
          profile_image_url: profile_image_url,
          screen_name: tweet.retweeted_status.user.screen_name,
          retweeters: [
            {
              profile_image_url: retweeter_image_url,
              screen_name: tweet.user.screen_name
            }
          ],
          timestamp: Date.now(),
          unfluff_checked: false,
          pagerank_checked: false,
          image_size_checked: false,
          shorten_checked: false,
          topic: topic,
          count: 1,
          url: url
        }

        if(topic) {
          // get expanded url for unique id
          utils.expander(ref, tweetObj, id)
        }
      }
    })
    stream.on('error', (err) => {
      console.error("Twitter Stream Err------", err)
    })

    function alive() {

      countRef.child('sported').transaction(function(snap){
          console.log("Tweets in last minute: ", snap)
          if(snap > 0) return 0
          else {
            console.log("restarting stream")
            stream.stop()
            stream.start()
          }
      })

      setTimeout(alive, 60 * 1000)
    }
    alive()

  }
}
