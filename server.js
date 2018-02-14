require('dotenv').config()

const startStream = require('./lib/start-stream')
const deleteStaleStories = require('./lib/cleanup/delete-stale-stories')
const mailer = require('./lib/mailer')

startStream()
deleteStaleStories()