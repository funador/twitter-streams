const Twit = require('twit') 
const firebase = require('firebase-admin')
const cloudinary = require('cloudinary')
const serviceAccount = require('../firebase.json')

////////////////////////////////////////////////////////////////////////////////
// Topics to track and domains to ignore
////////////////////////////////////////////////////////////////////////////////

exports.topics = ['nfl', 'nba', 'mlb', 'nhl']

exports.ignoredDomains = ['twitter.com', 'itunes', 'apple', 'vine.co', 'youtube', 'instagram']
exports.ingornedLanguages = ['es', 'fr', 'ru', 'fi', 'tr']

////////////////////////////////////////////////////////////////////////////////
// Twitter Config
////////////////////////////////////////////////////////////////////////////////

const T = new Twit({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET
})

exports.stream = T.stream('statuses/filter', { track: this.topics, language: 'en' })

////////////////////////////////////////////////////////////////////////////////
// Firebase Config
////////////////////////////////////////////////////////////////////////////////

const config = {
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: 'https://sport-stream-b6ff0.firebaseio.com'
}

firebase.initializeApp(config)

exports.firebase = firebase.database()

////////////////////////////////////////////////////////////////////////////////
// Cloudinary Config
////////////////////////////////////////////////////////////////////////////////

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_NAME, 
  api_key: process.env.CLOUDINARY_KEY, 
  api_secret: process.env.CLOUDINARY_SECRET 
});

exports.resizeHero = [
  { width: 900, height: 500, crop: 'fill', gravity: 'faces'}
]

exports.resizeThumb = [
  { width: 150, height: 150, crop: 'fill', gravity: 'faces'}
]

exports.cloudinary = (image, resize) => {
  return new Promise((resolve, reject) => {
    cloudinary.v2.uploader.upload(image, { eager: [resize] }, (err, res) => {
      if(res) return resolve(res.eager[0].secure_url)
      resolve()
    }) 
  })
}