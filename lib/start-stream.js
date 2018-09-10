const { stream } = require('./config')
const { linkCheck } = require('./utils') 
const initExtract = require('./stories/init-extract')

module.exports = flag => {

////////////////////////////////////////////////////////////////////////////////
// Find retweeted tweets with links on tracked topics
////////////////////////////////////////////////////////////////////////////////
  
  stream

    // Listen for tweets in the stream
    .on('tweet', async tweet => {
    
      // Grab the needed info from the tweeter
      const { screen_name, profile_image_url_https } = tweet.user

      // Make sure they don't have a default image (spammy! + poor design)
      const defaultImg = profile_image_url_https.includes('default_profile')

      // Check to make sure there is a link in the tweet
      // and they do not have a default image
      if (linkCheck(tweet) && !defaultImg) {

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