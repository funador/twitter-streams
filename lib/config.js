////////////////////////////////////////////////////////////////////////////////
// Topics to track and domains to ignore
////////////////////////////////////////////////////////////////////////////////

exports.topics = ['ico']
exports.shorteners = ['spok.al', 'youtu.be', 'buff.ly', 'ift.tt', 'zd.net',
                      'for.tn']

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
const serviceAccount2 = require("../twitter-streams-firebase-2.json");

const config = {
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: "https://twitter-streams-40b23.firebaseio.com"
}

const config2 = {
  credential: firebase.credential.cert(serviceAccount2),
  databaseURL: "https://twitter-streams-1b221.firebaseio.com"
}

firebase.initializeApp(config2)

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
