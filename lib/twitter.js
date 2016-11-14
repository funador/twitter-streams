import unfluff from 'unfluff'
import size from 'request-image-size'
import expandUrl from 'expand-url'
import request from 'request'

import { stream, db, topics, ignoredDomains } from './config'
import { cleanText } from './utils'

// Generators
let initTweet, fullTweet

let undefinedTopics = 0
let topicedTweets = 0

//////////////////////////////////////////////////////////////////////////
// Find tweets in the steam that have been retweeted and contain links
//////////////////////////////////////////////////////////////////////////
stream

  .on('tweet', tweet => {

    if(tweet.retweeted_status && tweet.entities.urls[0]) {

      const expandedUrl = tweet.entities.urls[0].expanded_url
      // Tweet is a retweet and has a link! Kick off initExtractGen...
      initTweet = initExtractGen(tweet, expandedUrl)
      initTweet.next()
    }
  })

  .on('error', err => console.error(err))

//////////////////////////////////////////////////////////////////////////
// This generator checks if a story is being tracked. If the story is
// already being tracked, the story is updated. Otherwise, fullExtractGen
// is kicked off to determine whether or not to track the story.
//////////////////////////////////////////////////////////////////////////
function* initExtractGen(tweet, expandedUrl) {

  // Run expandedUrl through expand-url to unshorten expandedUrl. Pause the generator until expand-url returns
  const url = yield expandUrl.expand(expandedUrl, (err, exUrl) => !err ? initTweet.next(exUrl) : false)

  // Using a substring of the expanded url as an id, a story can be tracked even if it is retweeted from
  // multiple twitter accounts. Although not perfect, this significantly reduces tracking of duplicate stories
  const id = url ? url.match(/[^_\W]+/g).join('').substring(5, 40) : false

  // Apply a topic tag to the story, as Twitter doesn't return what topic was being tracked in the stream
  // create extended tweet text const
  // const extendedTweet = ${extendedTweet}
  const textToCheck = `${tweet.text} ${expandedUrl}`.toLowerCase()
  const tag = topics.filter((topic) => textToCheck.includes(topic))[0]

  topicedTweets++

  if(!tag) {
    undefinedTopics ++
    console.log(Math.floor((undefinedTopics / topicedTweets) * 100) + "% of tweets are not tagged" )
  }
  // if(!tag) {
  //   console.log(tweet)
  // }

  // The retweeter to be added to the story
  const retweeter = { name: tweet.user.screen_name, img: tweet.user.profile_image_url_https }

  // Make a transaction at the tracking reference to determine if this story has been checked
  // and if it is already being tracked
  db.ref(`tracking/${tag}/${id}`).transaction(story => {

      // The story has been checked and is being tracked, must be a good one!
      if(story && story.tracking) {

        // Reference to retweeters array for the tracked story
        const retweetersRef = `${tag}/${id}/retweeters`

        // Get the retweeters array of the story to be updated
        db.ref(retweetersRef).once('value').then(snap => {
          let retweeters = snap.val()

          // Check to make sure new retweeter isn't already in retweeters array
          // and update the retweeters array with new retweeter
          if(retweeters.every(tweeter => tweeter.name != retweeter.name)) retweeters.push(retweeter)

          // Push the retweeters array back up with the new retweeter included
          db.ref(retweetersRef).set(retweeters)
        })

        return story
      }

      // This story was already checked and didn't pass the quality tests :(
      else if(story && !story.tracking) {
        return story
      }

      // Haven't looked at this story yet, determine if it should be tracked
      // by running it through fullExtractGen
      else {
        fullTweet = fullExtractGen(tweet, id, tag, url, retweeter)
        fullTweet.next()
        return story
      }
  })
}

//////////////////////////////////////////////////////////////////////////
// This generator determines whether or not a story should be tracked
// First, the data set is expanded and then it is scrubed against
// quality controls. The aim result is good reads for end users!!
/////////////////////////////////////////////////////////////////////
function* fullExtractGen(tweet, id, tag, url, retweeter) {

  // Using unfluff to unpack the page content including its description, body, title, image etc.
  const unfluffed = yield request(url, (err, res, body) => !err ? fullTweet.next(unfluff(body)) : false)
  const img = unfluffed.image

  // Make sure there is an image to work with and it has a url reference
  if(img && img.indexOf("http") > -1) {

    // Get the dimensions of the img using express-image-size and pausing
    // the generator till we have a result
    const sized = yield size(img, (err, dimensions) => !err ? fullTweet.next(dimensions) : fullTweet.next(false))

    // Make sure our images are big enough to fill out our design
    const sized_check = sized && sized.width > 400 && sized.height > 400 ? true : false

    // Remove any <hmtl> tags from the description to make it human readable
    const description = unfluffed.description ? cleanText(unfluffed.description) : false

    // Remove any <hmtl> tags from the title to make it human readable
    const title = unfluffed.title ? cleanText(unfluffed.title) : false

    // Make sure title and description don't match
    const matching_check = unfluffed.title !== unfluffed.description

    // How long will it take the average reader to read this story?
    const read_mins = unfluffed.text ? Math.ceil(unfluffed.text.split(' ').length / 250) : false

    // Make sure the story is long enough to be worth reading
    const mins_check = read_mins > 2 ? read_mins : false

    // Get a word count of the unfluffed description
    const desc_words = unfluffed.description ? unfluffed.description.split(' ').length : false

    // Make sure the discription is long enough to fill out the front end design
    const desc_check = desc_words > 7 ? desc_words : false

    // Get the orginal tweeter's Twitter handle to use on front end design
    const screen_name = tweet.retweeted_status.user.screen_name

    // Profile image for the person that originally tweeted the story
    const profile_img_url = tweet.retweeted_status.user.profile_image_url.replace('http', 'https')

    // Make sure the retweeter's Twitter account is a couple years old to avoid spammy accounts
    const age = tweet.user.created_at.split(' ')[5] < 2015 ? true : false

    // Exclude stories that are in languages that are not English
    const lang_check = ['es', 'fr', 'ru', 'fi', 'tr'].every(lang => unfluffed.lang != lang)

    // Exclude stories that come from ignored domains
    const ignored_check = url ? ignoredDomains.every(domain => !url.includes(domain)) : false

    // Clean up the url so it can be used as part of the front end design
    const display_url = url ? url.split('/')[2].replace(/www./i, '') : false

    // Kick off the retweeters array with the first retweeter!
    const retweeters = [retweeter]

    // Set the timestamp so story can be deleted when its stale
    const timestamp = Date.now()

    // Our completed story object!
    const story = {
      lang_check, description, profile_img_url, screen_name, sized_check, display_url, age, title, matching_check,
      mins_check, ignored_check, desc_check, description, img, retweeters, timestamp, url, tag, id
    }

    // If there are truthy values for all of the data checks, track this story!
    if(Object.keys(story).every(key => story[key])) {
      db.ref(`${tag}/${id}`).set(story)
      db.ref(`tracking/${tag}/${id}`).set({tracking: true})
    }

    // If there are falsey values for any data check, don't track the story :(
    else {
      db.ref(`tracking/${tag}/${id}`).set({tracking: false})
    }
  }
}

//////////////////////////////////////////////////////////////////////////
// Delete stories after 8 hours to keep the content fresh
//////////////////////////////////////////////////////////////////////////
topics.forEach(topic => {
  let cutoff = Date.now() - 8 * 60 * 60 * 1000

  // set up a listener for each topic to check the oldest story for each topic
  db.ref(`${topic}`).orderByChild('timestamp').endAt(cutoff).limitToLast(1).on('child_added', snap => {
      const id = snap.val().id

      // delete the story and the tracking reference
      db.ref(`${topic}/${id}`).remove()
      db.ref(`tracking/${topic}/${id}`).remove()

      // reset the cutoff time
      cutoff = Date.now() - 8 * 60 * 60 * 1000
  })
})
