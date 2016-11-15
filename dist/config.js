'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.stream = exports.db = exports.ignoredDomains = exports.topics = undefined;

var _firebase = require('firebase');

var firebase = _interopRequireWildcard(_firebase);

var _twit = require('twit');

var _twit2 = _interopRequireDefault(_twit);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

//////////////////////////////////////////////////////////////////////////
// Topics to track and domains to ingore
//////////////////////////////////////////////////////////////////////////
var topics = exports.topics = ['nfl', 'nba', 'mlb', 'nhl'];
var ignoredDomains = exports.ignoredDomains = ['twitter', 'itunes', 'apple', 'vine', 'youtube'];

//////////////////////////////////////////////////////////////////////////
// Firebase Config
//////////////////////////////////////////////////////////////////////////


var config = {
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  databaseURL: process.env.DATABASE_URL,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MESSAGING_SENDER_ID
};

firebase.initializeApp(config);

var db = exports.db = firebase.database();

//////////////////////////////////////////////////////////////////////////
// Twitter Config
//////////////////////////////////////////////////////////////////////////


var T = new _twit2.default({

  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET

});

var stream = exports.stream = T.stream('statuses/filter', { track: topics, language: 'en' });