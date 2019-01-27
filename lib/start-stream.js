const { stream } = require('./config')
const { linkCheck } = require('./utils') 
const initExtract = require('./stories/init-extract')

module.exports = flag => {

////////////////////////////////////////////////////////////////////////////////
// Find retweeted tweets with links on tracked topics
////////////////////////////////////////////////////////////////////////////////
  
  stream

    // Listen for tweets in the stream
    .on('tweet', tweet => {
    
      // Grab the needed info from the tweeter
      const { screen_name, profile_image_url_https } = tweet.user

      // Check to make sure there is a link in the tweet
      if (linkCheck(tweet)) {

        console.log(screen_name)
        // Build up a retweeter object
        const retweeter = {
          name: screen_name,
          image: profile_image_url_https
        }

        // Start the extracting of the infos from the tweet!
        initExtract(tweet, retweeter)
        // console.log(tweet.user.screen_name)  
      }
    })

    .on('error', err => console.error('err in stream', err))
  }