'use strict'

require('dotenv').load('.env')
var Twit      = require('twit')

module.exports = {
  T: new Twit({
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    access_token: process.env.TOKEN_KEY,
    access_token_secret: process.env.TOKEN_SECRET
  })
}
