require('dotenv').config()

const { startStream } = require('./lib/start-stream')
const { deleteOldStories } = require('./lib/delete-old-stories')
const { deleteStaleSocial } = require('./lib/delete-stale-social')
const { trackSentiment } = require('./lib/track-sentiment')
const { clearKloutCue } = require('./lib/clear-klout-cue')
const { mailer } = require('./lib/mailer')
// require('./lib/test')
// const { trackSothbeys } = require('./lib/track-sothbeys')


startStream()
// deleteOldStories()
deleteStaleSocial('klouters')
deleteStaleSocial('twitters')
trackSentiment()
// clearKloutCue()
// trackSothbeys()
process.on('unhandledRejection', r => console.log(r));

if(process.env.NODE_ENV === 'production') {
  process.on('unhandledRejection', r => {
    mailer(r)
  });
}