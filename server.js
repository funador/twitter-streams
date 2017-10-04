require('dotenv').config()

const { startStream } = require('./lib/start-stream')
const { deleteStaleStories } = require('./lib/cleanup/delete-stale-stories')
const { deleteStaleSocial } = require('./lib/cleanup/delete-stale-social')
const { clearKloutCue } = require('./lib/cleanup/clear-klout-cue')
const { mailer } = require('./lib/mailer')
// require('./lib/test3')

startStream()
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