require('dotenv').config({path: __dirname + '/.env', silent: true})

const app = require('express')()
const startStream = require('./lib/start-stream')
const deleteStaleStories = require('./lib/cleanup/delete-stale-stories')

startStream()
deleteStaleStories()

app.listen(process.env.PORT || 3000, () => console.log('listening'))