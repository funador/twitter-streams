import {} from 'dotenv/config'
import express from 'express'
import unfluff from 'unfluff'
import size from 'request-image-size'
import expandUrl from 'expand-url'
import request from 'request'

import { stream, firebase, topics, ignoredDomains, ingornedLanguages } from './config'
import { makeId, cleanText } from './utils'

// Generators
let initTweet, fullTweet


////////////////////////////////////////////////////////////////////////////////
// Find retweeted tweets with links on tracked topics
////////////////////////////////////////////////////////////////////////////////

stream
  .on('tweet', tweet => {

    const linkCheck = tweet.retweeted_status && tweet.entities.urls[0] &&
                      tweet.entities.urls[0].expanded_url

    // Tweet is a retweet and has a link! Kick off initExtractGen...
    if(linkCheck) {

      initTweet = initExtractGen(tweet)
      initTweet.next()

    }
  })

  .on('error', err => console.error(err))


////////////////////////////////////////////////////////////////////////////////
// initExtractGen detemies whether a story is being tracked. If a story
// is being tracked, update the story. Otherwise, kick off fullExtractGen
////////////////////////////////////////////////////////////////////////////////

function* initExtractGen(tweet) {

  // Ground zero
  const expandedUrl = tweet.entities.urls[0].expanded_url

  // Unshorten expandedUrl by running it through expand-url
  const url = yield expandUrl.expand(expandedUrl, (err, exUrl) =>
                                      !err ? initTweet.next(exUrl) : false)

  // By using a substring of 'url' as an id, a story can be tracked even if
  // it is retweeted from multiple Twitter accounts. Its not perfect, but it
  // significantly reduces duplicate stories
  const id = url ? makeId(url) : false

  // Build up a string that can be filtered to find which topic matched
  // from the topics array
  let textToCheck = `${tweet.text} ${expandedUrl}`

  if(tweet.retweeted_status.text) {
    textToCheck += ` ${tweet.retweeted_status.text}`
  }

  if(tweet.quoted_status) {

    textToCheck += ` ${tweet.quoted_status.text}`

    if(tweet.quoted_status.extended_tweet) {
      textToCheck += ` ${tweet.quoted_status.extended_tweet.full_text}`
    }

  }

  textToCheck = textToCheck.toLowerCase()

  // Filter textToCheck to find the topic that was tracked in the stream
  const topic = topics.filter((topic) => textToCheck.includes(topic))[0]

  // The retweeter to be added to the story
  const retweeter = {
    name: tweet.user.screen_name,
    img: tweet.user.profile_image_url_https
  }

  // Make a transaction at the tracking reference for the story to determine
  // if the story is being tracked and if not kick off the process to check
  // the quality of the story
  firebase
    .ref(`tracking/${topic}/${id}`)
    .transaction(story => {

      // The story has been checked and is being tracked, must be a good one :)
      // Update the story with the latest retweeter
      if(story && story.tracking) {

        // Reference to retweeters array for the tracked story
        const retweetersRef = `${topic}/${id}/retweeters`

        // Get the retweeters array of the story to be updated
        firebase
          .ref(retweetersRef)
          .once('value')
          .then(snap => {

            // the story's retweeter array
            let retweeters = snap.val()

            // Check to make sure new retweeter isn't already in retweeters
            // array. If it is not in the array update the retweeters array
            // with the new retweeter.
            if(retweeters.every(tweeter => tweeter.name != retweeter.name)) {
              retweeters.push(retweeter)
            }

            // Reset the retweeters array
            firebase
              .ref(retweetersRef)
              .set(retweeters)

        })

        return story

      }

      // The story was already checked and didn't pass the quality tests :(
      else if(story && !story.tracking) {
        return story
      }

      // The story hasn't been checked yet
      else {

        // Make sure there is something to check
        if(topic && id) {

          // Determine if the story should be tracked by running the story
          // through fullExtractGen
          fullTweet = fullExtractGen(tweet, topic, id, url, retweeter)
          fullTweet.next()

        }
        
        return story

      }

  })
}


////////////////////////////////////////////////////////////////////////////////
// fullExtractGen determines whether or not a story should be tracked.
// First, the data set is expanded and then it is scrubed against
// quality checks. Aiming at *quality* reads all the time...
////////////////////////////////////////////////////////////////////////////////

function* fullExtractGen(tweet, topic, id, url, retweeter) {

  // Unfluff the story to unpack the page content including its description,
  // body, title and image
  const unfluffed = yield request(url, (err, res, body) =>
                            !err ? fullTweet.next(unfluff(body)) : false)

  // Grab the image
  const img = unfluffed.image

  // Make sure there is an image to work with and it has a url reference
  if(img && img.includes("http")) {

    // Get width and height of the img using request-image-size
    const sized = yield size(img, (err, dimensions) =>
                          !err ? fullTweet.next(dimensions) : false)

    const sizer = sized && sized.width > 400 && sized.height > 400

    // Make sure img is big enough to fill out the front end design
    const sized_check = sizer ? true : false

    // Remove any <hmtl> tags from the description to make it human readable
    if(unfluffed.description) {
      let description = cleanText(unfluffed.description)
    }

    // Remove any <hmtl> tags from the title to make it human readable
    if(unfluffed.title) {
      const title = cleanText(unfluffed.title)
    }

    // Make sure title and description are not the same
    const matching_check = unfluffed.title !== unfluffed.description

    // How long will it take a user to read this story?
    const mins = Math.ceil(unfluffed.text.split(' ').length / 250)

    // Make sure the story is long enough to be worth reading
    const mins_check = mins > 2 ? mins : false

    // Get a word count of the story's description
    const desc_words = description ? description.split(' ').length : false

    // Make sure the description is long enough to fill out the front end design
    const desc_check = desc_words > 7 ? desc_words : false

    // Get the orginal tweeter's Twitter handle for the front end design
    const screen_name = tweet.retweeted_status.user.screen_name

    // Get the orginal tweeter's profile image for the front end design
    const prof_img = tweet.retweeted_status.user.profile_image_url
    const profile_img_url = prof_img.replace('http', 'https')

    // Make sure the retweeter's Twitter account is at least a year old to
    // avoid spammy accounts
    const age = tweet.user.created_at.split(' ')[5] < 2016 ? true : false

    // Exclude stories in languages that have squeaked through before
    const lang_check = ingornedLanguages.every(lang => unfluffed.lang != lang)

    // Exclude stories from domains that are in the ignoredDomains array
    const ignored_check = ignoredDomains.every(domain => !url.includes(domain))

    // Clean up the url so it can be used for the front end design
    const display_url = url.split('/')[2].replace(/www./i, '')

    // Fire up the retweeters array with the first retweeter!
    const retweeters = [retweeter]

    // Set the timestamp so the story can be deleted when it is stale
    const timestamp = Date.now()

    // The resulting story object...
    const story = {
      lang_check, description, profile_img_url, screen_name, sized_check,
      display_url, age, title, matching_check, mins_check, ignored_check,
      desc_check, description, img, retweeters, timestamp, url, topic, id
    }

    // If there are truthy values for all of the data checks, track the story :)
    if(Object.keys(story).every(key => story[key])) {

      firebase
        .ref(`${topic}/${id}`)
        .set(story)

      firebase
        .ref(`tracking/${topic}/${id}`)
        .set({tracking: true})

    }

    // If there are falsey values for any data check, don't track the story :(
    else {

      firebase
        .ref(`tracking/${topic}/${id}`)
        .set({tracking: false})

    }
  }
}


////////////////////////////////////////////////////////////////////////////////
// Delete stale stories
////////////////////////////////////////////////////////////////////////////////

topics.forEach(topic => {

  // How old stories allowed to get
  let cutoff = Date.now() - 8 * 60 * 60 * 1000

  // Make a listener for each topic and look at the oldest story for that topic
  firebase
    .ref(`${topic}`)
    .orderByChild('timestamp')
    .endAt(cutoff)
    .limitToLast(1)
    .on('child_added', snap => {
      const id = snap.val().id

      // Delete the story
      firebase
        .ref(`${topic}/${id}`).remove()

      // Delete the tracking reference
      firebase
        .ref(`tracking/${topic}/${id}`).remove()

      // Reset the cutoff
      cutoff = Date.now() - 8 * 60 * 60 * 1000

    })
})


////////////////////////////////////////////////////////////////////////////////
// Keep Heroku happy++ by connecting to a port
////////////////////////////////////////////////////////////////////////////////
if(process.env.NODE_ENV === 'production') {
  express().listen(process.env.PORT)s
}
