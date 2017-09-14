require('dotenv').config()

const { startStream } = require('./lib/start-stream')
const { deleteOldStories } = require('./lib/delete-old-stories')
const { deleteStaleSocial } = require('./lib/delete-stale-social')
const { trackSentiment } = require('./lib/track-sentiment')
// require('./lib/test')
// const { trackSothbeys } = require('./lib/track-sothbeys')

startStream()
deleteOldStories()
deleteStaleSocial('klouters')
deleteStaleSocial('twitters')
trackSentiment()
// trackSothbeys()
process.on('unhandledRejection', r => console.log(r));