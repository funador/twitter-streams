require('dotenv').config()

const { startStream } = require('./lib/start-stream')
const { deleteOldStories } = require('./lib/delete-old-stories')
const { deleteStaleSocial } = require('./lib/delete-stale-social')
const { trackSentiment } = require('./lib/track-sentiment')
// const { trackSothbeys } = require('./lib/track-sothbeys')

startStream()
deleteOldStories()
deleteStaleSocial('klouter')
deleteStaleSocial('twitter')
trackSentiment()
// trackSothbeys()