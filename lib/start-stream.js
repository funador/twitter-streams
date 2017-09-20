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

      const buffer = await checkBuffer(user)
      // console.log("BUFFER", buffer)

      if(linkCheck(tweet) && ageCheck(user) && await twitterCheck(user)) {
        console.log(tweet.user.screen_name)  
        initExtract(tweet)  
      }
    })

    .on('error', err => console.error("err in stream", err))
  }