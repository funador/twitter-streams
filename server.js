require('dotenv').config()

const app = require('express')()
require('./lib/start-stream')()
require('./lib/cleanup/delete-stale-stories')()

app.listen(process.env.PORT || 8080, () => console.log('listening'))