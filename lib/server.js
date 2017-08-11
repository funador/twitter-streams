require('dotenv').config()

const { initExtract } = require('./init-extract')
const { deleteOldStories } = require('./delete-old-stories')
const { stream, firebase } = require('./config')
const { linkCheck } = require('./utils') 

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

  .on('error', err => console.error(err))

deleteOldStories()