require('dotenv').config()

const { startStream } = require('./lib/start-stream')
const { deleteStaleStories } = require('./lib/cleanup/delete-stale-stories')
const { deleteStaleSocial } = require('./lib/cleanup/delete-stale-social')
const { clearKloutCue } = require('./lib/cleanup/clear-klout-cue')
const { mailer } = require('./lib/mailer')

// Tools to build data
// require('./lib/algo/algo-seed-data')
// require('./lib/algo/ham-maker')

startStream('stream')
// deleteStaleStories()
deleteStaleSocial('klouters', 5)
deleteStaleSocial('twitters', 1)
// clearKloutCue()

if(process.env.NODE_ENV == 'production') {
  process.on('unhandledRejection', r => {
    mailer(r)
  });
}
else {
  process.on('unhandledRejection', r => console.log(r));  
}