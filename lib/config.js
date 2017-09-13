////////////////////////////////////////////////////////////////////////////////
// Topics to track and domains to ignore
////////////////////////////////////////////////////////////////////////////////

// exports.topics = ['nfl', 'nba', 'mlb', 'nhl']
exports.topics = ['ico']

// smarticoinvestor.com
exports.ignoredDomains = ['twitter.com', 'itunes', 'apple', 'vine.co', 'youtube', 'instagram']
exports.ingornedLanguages = ['es', 'fr', 'ru', 'fi', 'tr']

////////////////////////////////////////////////////////////////////////////////
// Twitter Config
////////////////////////////////////////////////////////////////////////////////

const Twit = require('twit') 

const T = new Twit({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET
})

exports.T = T
exports.stream = T.stream('statuses/filter', { track: this.topics, language: 'en' })

////////////////////////////////////////////////////////////////////////////////
// Firebase Config
////////////////////////////////////////////////////////////////////////////////

const firebase = require("firebase-admin");

const serviceAccount = require("../twitter-streams-firebase.json");

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: "https://twitter-streams-40b23.firebaseio.com"
})

exports.firebase = firebase.database()

////////////////////////////////////////////////////////////////////////////////
// Firebase Sentiment Config
////////////////////////////////////////////////////////////////////////////////

const serviceAccountSentiment = require("../twitter-streams-firebase-sentiment.json");

firebaseSentiment = firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccountSentiment),
  databaseURL: "https://streams-sentiment.firebaseio.com"
}, 'firebaseSentiment')

exports.firebaseSentiment = firebaseSentiment.database()
