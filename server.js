require('dotenv').config()

const { startStream } = require('./lib/start-stream')
const { deleteStaleStories } = require('./lib/cleanup/delete-stale-stories')
const { deleteStaleSocial } = require('./lib/cleanup/delete-stale-social')
const { mailer } = require('./lib/mailer')

startStream()

if(process.env.NODE_ENV == 'production') {
  process.on('unhandledRejection', r => {
    mailer(r)
  });
}
else {
  process.on('unhandledRejection', r => console.log(r));  
}