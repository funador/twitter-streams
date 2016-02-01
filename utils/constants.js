'use strict'

require('dotenv').load('.env')
var Twitter   = require('twitter')

module.exports = {
  client: new Twitter({
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    access_token_key: process.env.TOKEN_KEY,
    access_token_secret: process.env.TOKEN_SECRET
  }),
  
  klout: process.env.KLOUT
}
