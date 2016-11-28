///////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Topics to track and domains to ignore
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const topics = ['nfl', 'nba', 'mlb', 'nhl', 'js', 'javascript']
export const ignoredDomains = ['twitter.com', 'itunes', 'apple', 'vine.co', 'youtube', 'instagram']
export const ingornedLanguages = ['es', 'fr', 'ru', 'fi', 'tr']

///////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Twitter Config
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

import Twit from 'twit'

const T = new Twit({

  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET

})

export const stream = T.stream('statuses/filter', { track: topics, language: 'en' })


///////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Firebase Config
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

import * as firebaseConfig from "firebase"

const config = {
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  databaseURL: process.env.DATABASE_URL,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MESSAGING_SENDER_ID
}

firebaseConfig.initializeApp(config)

export const firebase = firebaseConfig.database()
