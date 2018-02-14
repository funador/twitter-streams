const { stream } = require('./config')
const { linkCheck } = require('./utils') 
const initExtract = require('./stories/init-extract')

module.exports = flag => {

////////////////////////////////////////////////////////////////////////////////
// Find retweeted tweets with links on tracked topics
////////////////////////////////////////////////////////////////////////////////
  
  // comment this file
  stream
    .on('tweet', async tweet => {

      const { screen_name, profile_image_url_https } = tweet.user
      const defaultImg = profile_image_url_https.includes('default_profile')

      if (linkCheck(tweet) && !defaultImg) {

        const retweeter = {
          name: screen_name,
          image: profile_image_url_https
        }

        initExtract(tweet, retweeter)
        // console.log(tweet.user.screen_name)  
      }
    })

    .on('error', err => console.error('err in stream', err))
  }