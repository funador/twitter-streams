'use strict'

var utils       = require('../utils/utils')
var c           = require('../utils/constants')
var firebase    = require('./firebase.push')
var topicsArr   = ['nfl', 'nba', 'nhl', 'mlb']
var topics      = topicsArr.join(', ')

module.exports = {

  stream: (ref) => {
    c.client.stream('statuses/filter', {track: topics}, (stream) => {

      stream.on('data', (tweet) => {
        var age = utils.accountAge(tweet.user.created_at)
        var topic = utils.topic(tweet.text, topicsArr)


        if(tweet.retweeted_status && tweet.entities.urls[0] && age) {

          if(tweet.entities.urls[0].expanded_url){
            var url = tweet.entities.urls[0].expanded_url
          }

          var id  = tweet.retweeted_status.id

          var tweetObj = {
            profile_image_url: tweet.retweeted_status.user.profile_image_url,
            screen_name: tweet.retweeted_status.user.screen_name,
            retweeters: {
              0: {
                profile_image_url: tweet.user.profile_image_url,
                screen_name: tweet.user.screen_name
              },
            },
            timestamp: Date.now(),
            checked: false,
            topic: topic,
            score: 0,
            url: url
          }
          if(topic){
            firebase.push(ref, id, tweetObj)
          }
        }
      })
      stream.on('error', (err) => {
        console.error("ERRRRRR", err)
      })
    })
  }
}
