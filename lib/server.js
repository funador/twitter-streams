import express from 'express'
import twitter from './twitter'

// Heroku needs to connect to a port to stay up
// thats the only reason this file exists
const app = express()

const server = app.listen(process.env.PORT || 3000, () => {
  const { address, port } = server.address()
  console.log(`listening on http://${address}:${port}`)
})
