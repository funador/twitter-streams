const { stream } = require('./config')
const { twitterCheck } = require('./twitter-check')
const { checkBuffer } = require('./check-buffer')
const { linkCheck, ageCheck } = require('./utils') 
const { initExtract } = require('./init-extract')

exports.startStream = () => {

////////////////////////////////////////////////////////////////////////////////
// Find retweeted tweets with links on tracked topics
////////////////////////////////////////////////////////////////////////////////

  stream

    .on('tweet', async tweet => {
      const user = tweet.user

      // check to see if a retweeter has recently retweeted into this stream
      // attempt to eliminate spammy accounts which often retweet in bursts
      if (linkCheck(tweet) 
          && ageCheck(user)
          // && await checkBuffer(user)
          && await twitterCheck(user.screen_name)) {

        // console.log(tweet.user.screen_name)  
        initExtract(tweet)  
      }
    })

    .on('error', err => console.error("err in stream", err))
  }