'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

require('dotenv/config');

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _unfluff = require('unfluff');

var _unfluff2 = _interopRequireDefault(_unfluff);

var _requestImageSize = require('request-image-size');

var _requestImageSize2 = _interopRequireDefault(_requestImageSize);

var _expandUrl = require('expand-url');

var _expandUrl2 = _interopRequireDefault(_expandUrl);

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _config = require('./config');

var _utils = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _marked = [initExtractGen, fullExtractGen].map(regeneratorRuntime.mark);

// Heroku needs to connect to a port to stay up
// thats the only we set up this server
var app = (0, _express2.default)();

var server = app.listen(process.env.PORT || 3000, function () {
  var _server$address = server.address(),
      address = _server$address.address,
      port = _server$address.port;

  console.log('listening on http://' + address + ':' + port);
});

// Generators
var initTweet = void 0,
    fullTweet = void 0;

//////////////////////////////////////////////////////////////////////////
// Get retweeted tweets in the steam on tracked topics that have links
//////////////////////////////////////////////////////////////////////////
_config.stream.on('tweet', function (tweet) {

  if (tweet.retweeted_status && tweet.entities.urls[0] && tweet.entities.urls[0].expanded_url) {
    console.log(tweet.user.screen_name);
    // Tweet is a retweet and has a link! Kick off initExtractGen...
    initTweet = initExtractGen(tweet);
    initTweet.next();
  }
}).on('error', function (err) {
  return console.error(err);
});

//////////////////////////////////////////////////////////////////////////
// Is a story is being tracked? If the story is being tracked,
// update that story. Otherwise, determine whether to track that story.
//////////////////////////////////////////////////////////////////////////
function initExtractGen(tweet) {
  var expandedUrl, url, id, textToCheck, tag, retweeter;
  return regeneratorRuntime.wrap(function initExtractGen$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:

          // Ground zero
          expandedUrl = tweet.entities.urls[0].expanded_url;

          // Unshorten expandedUrl by running it through expand-url

          _context.next = 3;
          return _expandUrl2.default.expand(expandedUrl, function (err, exUrl) {
            return !err ? initTweet.next(exUrl) : false;
          });

        case 3:
          url = _context.sent;


          // Using a substring of the expanded url as an id, a story can be tracked even if it is retweeted from
          // multiple Twitter accounts. Although not perfect, this significantly reduces duplicate stories
          id = url ? url.match(/[^_\W]+/g).join('').replace(/w/g, '').replace(/com/g, '').substring(5, 40) : false;

          // Build up a string that can be filtered to find which topic matched in the Twitter stream

          textToCheck = tweet.text + ' ' + expandedUrl;


          if (tweet.quoted_status) {
            textToCheck += ' ' + tweet.quoted_status.text;
          }

          if (tweet.retweeted_status.text) {
            textToCheck += ' ' + tweet.retweeted_status.text;
          }

          if (tweet.quoted_status && tweet.quoted_status.extended_tweet) {
            textToCheck += ' ' + tweet.quoted_status.extended_tweet.full_text;
          }

          // Filter out textToCheck to find the tracked topic
          tag = _config.topics.filter(function (topic) {
            return textToCheck.toLowerCase().includes(topic);
          })[0];

          // The tweeter to be added to the story

          retweeter = { name: tweet.user.screen_name, img: tweet.user.profile_image_url_https };

          // Make a transaction at the tracking reference for the story to determine if the story is
          // being tracked and if not kick off the process to check the quality of the story

          _config.db.ref('tracking/' + tag + '/' + id).transaction(function (story) {

            // The story has been checked and is being tracked, must be a good one!
            // Update the story with the latest retweeter
            if (story && story.tracking) {
              var _ret = function () {

                // Reference to retweeters array for the tracked story
                var retweetersRef = tag + '/' + id + '/retweeters';

                // Get the retweeters array of the story to be updated
                _config.db.ref(retweetersRef).once('value').then(function (snap) {

                  // the story's retweeter array
                  var retweeters = snap.val();

                  // Check to make sure new retweeter isn't already in retweeters array.
                  // If it is not in the array update the retweeters array with the new retweeter
                  if (retweeters.every(function (tweeter) {
                    return tweeter.name != retweeter.name;
                  })) retweeters.push(retweeter);

                  // Set the retweeters array with the new retweeter
                  _config.db.ref(retweetersRef).set(retweeters);
                });

                return {
                  v: story
                };
              }();

              if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
            }

            // The story was already checked and didn't pass the quality tests :(
            else if (story && !story.tracking) {
                return story;
              }

              // The story hasn't been looked at yet, determine if it should be tracked
              // by running the story through fullExtractGen
              else {
                  fullTweet = fullExtractGen(tweet, id, tag, url, retweeter);
                  fullTweet.next();
                  return story;
                }
          });

        case 12:
        case 'end':
          return _context.stop();
      }
    }
  }, _marked[0], this);
}

//////////////////////////////////////////////////////////////////////////
// fullExtractGen determines whether or not a story should be tracked
// First, the data set is expanded and then it is scrubed against
// quality controls. Aiming at *quality* reads all the time...
//////////////////////////////////////////////////////////////////////////
function fullExtractGen(tweet, id, tag, url, retweeter) {
  var _this = this;

  var unfluffed, img;
  return regeneratorRuntime.wrap(function fullExtractGen$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.next = 2;
          return (0, _request2.default)(url, function (err, res, body) {
            return !err ? fullTweet.next((0, _unfluff2.default)(body)) : false;
          });

        case 2:
          unfluffed = _context3.sent;
          img = unfluffed.image;

          // Make sure there is an image to work with and it has a url reference

          if (!(img && img.includes("http") && tag)) {
            _context3.next = 6;
            break;
          }

          return _context3.delegateYield(regeneratorRuntime.mark(function _callee() {
            var _story;

            var sized, sized_check, description, title, matching_check, read_mins, mins_check, desc_words, desc_check, screen_name, profile_img_url, age, lang_check, ignored_check, display_url, retweeters, timestamp, story;
            return regeneratorRuntime.wrap(function _callee$(_context2) {
              while (1) {
                switch (_context2.prev = _context2.next) {
                  case 0:
                    _context2.next = 2;
                    return (0, _requestImageSize2.default)(img, function (err, dimensions) {
                      return !err ? fullTweet.next(dimensions) : fullTweet.next(false);
                    });

                  case 2:
                    sized = _context2.sent;


                    // Make sure img is big enough to fill out the front end design
                    sized_check = sized && sized.width > 400 && sized.height > 400 ? true : false;

                    // Remove any <hmtl> tags from the description to make it human readable

                    description = unfluffed.description ? (0, _utils.cleanText)(unfluffed.description) : false;

                    // Remove any <hmtl> tags from the title to make it human readable

                    title = unfluffed.title ? (0, _utils.cleanText)(unfluffed.title) : false;

                    // Make sure title and description are not the same

                    matching_check = unfluffed.title !== unfluffed.description;

                    // How long will it take the average reader to read this story?

                    read_mins = unfluffed.text ? Math.ceil(unfluffed.text.split(' ').length / 250) : false;

                    // Make sure the story is long enough to be worth reading

                    mins_check = read_mins > 2 ? read_mins : false;

                    // Get a word count of the story's description

                    desc_words = unfluffed.description ? unfluffed.description.split(' ').length : false;

                    // Make sure that word count is long enough to fill out the front end design

                    desc_check = desc_words > 7 ? desc_words : false;

                    // Get the orginal tweeter's Twitter handle for the front end design

                    screen_name = tweet.retweeted_status.user.screen_name;

                    // Get the profile image for the person that originally tweeted the story for the front end design

                    profile_img_url = tweet.retweeted_status.user.profile_image_url.replace('http', 'https');

                    // Make sure the retweeter's Twitter account is at least a couple years old to avoid spammy accounts

                    age = tweet.user.created_at.split(' ')[5] < 2015 ? true : false;

                    // Exclude stories in languages that have popped up before

                    lang_check = ['es', 'fr', 'ru', 'fi', 'tr'].every(function (lang) {
                      return unfluffed.lang != lang;
                    });

                    // Exclude stories that come from domains that are ignored

                    ignored_check = url ? _config.ignoredDomains.every(function (domain) {
                      return !url.includes(domain);
                    }) : false;

                    // Clean up the url so it can be used as part of the front end design

                    display_url = url ? url.split('/')[2].replace(/www./i, '') : false;

                    // Fire up the retweeters array with the first retweeter!

                    retweeters = [retweeter];

                    // Set the timestamp so the story can be deleted after x hours

                    timestamp = Date.now();

                    // The resulting (and oh so beautful) story object...

                    story = (_story = {
                      lang_check: lang_check, description: description, profile_img_url: profile_img_url, screen_name: screen_name, sized_check: sized_check, display_url: display_url, age: age, title: title, matching_check: matching_check,
                      mins_check: mins_check, ignored_check: ignored_check, desc_check: desc_check }, _defineProperty(_story, 'description', description), _defineProperty(_story, 'img', img), _defineProperty(_story, 'retweeters', retweeters), _defineProperty(_story, 'timestamp', timestamp), _defineProperty(_story, 'url', url), _defineProperty(_story, 'tag', tag), _defineProperty(_story, 'id', id), _story);

                    // If there are truthy values for all of the data checks, track this story :)

                    if (Object.keys(story).every(function (key) {
                      return story[key];
                    })) {
                      _config.db.ref(tag + '/' + id).set(story);
                      _config.db.ref('tracking/' + tag + '/' + id).set({ tracking: true });
                    }

                    // If there are falsey values for any data check, don't track the story :(
                    else {
                        _config.db.ref('tracking/' + tag + '/' + id).set({ tracking: false });
                      }

                  case 21:
                  case 'end':
                    return _context2.stop();
                }
              }
            }, _callee, _this);
          })(), 't0', 6);

        case 6:
        case 'end':
          return _context3.stop();
      }
    }
  }, _marked[1], this);
}

//////////////////////////////////////////////////////////////////////////
// Delete a story after x hours to keep the content fresh
//////////////////////////////////////////////////////////////////////////
_config.topics.forEach(function (topic) {
  var cutoff = Date.now() - 8 * 60 * 60 * 1000;

  // set up a listener for each topic and look at the oldest story for each topic
  _config.db.ref('' + topic).orderByChild('timestamp').endAt(cutoff).limitToLast(1).on('child_added', function (snap) {
    var id = snap.val().id;

    // It is too old! Delete the story and the tracking reference as well
    _config.db.ref(topic + '/' + id).remove();
    _config.db.ref('tracking/' + topic + '/' + id).remove();

    // reset the cutoff time
    cutoff = Date.now() - 8 * 60 * 60 * 1000;
  });
});