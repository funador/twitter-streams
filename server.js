require('dotenv').config()

const { initExtract } = require('./lib/init-extract')
const { deleteOldData } = require('./lib/delete-old-stories')
const { deleteStaleKlouters } = require('./lib/delete-stale-klouters')
const { trackSentiment } = require('./lib/track-sentiment')
const { trackSothbeys } = require('./lib/track-sothbeys')
const { stream } = require('./lib/config')
const { linkCheck } = require('./lib/utils') 

////////////////////////////////////////////////////////////////////////////////
// Find retweeted tweets with links on tracked topics
////////////////////////////////////////////////////////////////////////////////

stream

  .on('tweet', tweet => {

    if(linkCheck(tweet)) {
      console.log(tweet.user.screen_name)
      initExtract(tweet)
    }
  })

  .on('error', err => console.error("ERR in stream", err))

deleteOldStories()
trackSentiment()
deleteStaleKlouters()
// trackSothbeys()