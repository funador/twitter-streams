require('dotenv').config()

const memwatch = require('memwatch-next')
memwatch.on('leak', info => {
  console.error('Memory leak detected:\n', info)
});

const app = require('express')()
require('./lib/start-stream')()
require('./lib/cleanup/delete-stale-stories')()

app.listen(process.env.PORT || 8080, () => console.log('listening'))