require('dotenv').config()

const { startStream } = require('./lib/start-stream')
const { deleteStaleStories } = require('./lib/delete-stale-stories')
const { deleteStaleSocial } = require('./lib/delete-stale-social')
const { trackSentiment } = require('./lib/track-sentiment')
const { clearKloutCue } = require('./lib/clear-klout-cue')
const { mailer } = require('./lib/mailer')
// require('./lib/test')
// const { trackSothbeys } = require('./lib/track-sothbeys')


startStream()
// deleteStaleStories()
deleteStaleSocial('klouters', 5)
deleteStaleSocial('twitters', 1)
trackSentiment()
// clearKloutCue()
// trackSothbeys()
process.on('unhandledRejection', r => console.log(r));

if(process.env.NODE_ENV == 'production') {
  process.on('unhandledRejection', r => {
    mailer(r)
  });
}