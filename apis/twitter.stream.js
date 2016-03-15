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
        if(tweet.user){
          var age = tweet.user.created_at.split(' ')[5]
          console.log(tweet.user.screen_name);
        }

        if(tweet.text){
          var topic = utils.topic(tweet.text, topicsArr)
        }

        if(tweet.retweeted_status && tweet.entities.urls[0] && age < 2015 && tweet.text) {
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
            count: 1,
            url: url
          }
          if(topic){
            firebase.push(ref, id, tweetObj)
          }
        }
      })
      stream.on('error', (err) => {
        console.error("Twitter Stream", err)
      })
    })
  }
}
