const { stream } = require('./config')
const { twitterCheck } = require('./algo/twitter-check')
const { checkBuffer } = require('./stories/check-buffer')
const { linkCheck } = require('./utils') 
const { initExtract } = require('./stories/init-extract')

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
          // && await checkBuffer(user)
          && await twitterCheck(user.screen_name, 'stream')) {

        // console.log(tweet.user.screen_name)  
        initExtract(tweet)  
      }
    })

    .on('error', err => console.error("err in stream", err))
  }