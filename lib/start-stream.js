const { stream } = require('./config')
const { twitterCheck } = require('./twitter-check')
const { linkCheck, ageCheck } = require('./utils') 
const { initExtract } = require('./init-extract')

exports.startStream = () => {

////////////////////////////////////////////////////////////////////////////////
// Find retweeted tweets with links on tracked topics
////////////////////////////////////////////////////////////////////////////////

  stream

    .on('tweet', async tweet => {
      if(linkCheck(tweet) && ageCheck(tweet.user) && await twitterCheck(tweet.user)) {
        // console.log(tweet.user.screen_name)
        initExtract(tweet)  
      }
    })

    .on('error', err => console.error("err in stream", err))
  }