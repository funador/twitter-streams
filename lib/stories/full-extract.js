const request = require('request-promise')
const unfluff = require('unfluff')
const he = require('he')
const groupStory = require('./group-story')

const { firebase, ingornedLanguages, ignoredDomains } = require('../config')

module.exports = async (tweet, topic, id, url, retweeter) => {

  //////////////////////////////////////////////////////////////////////////////
  // fullExtract determines whether or not a story should be tracked.
  // Aiming at *quality* reads all the time...
  //////////////////////////////////////////////////////////////////////////////
  
  // Declare fluffed
  let fluffed

  try {
    const preFluffed = await request(url)
    fluffed = unfluff(preFluffed)
  }
  catch(err) {
    console.log(err)
  }

  // Check if there is an article and image to work with
  if (fluffed && fluffed.image) {

    const image = fluffed.image

    // Remove any <hmtl> tags from the description to make it human readable
    const desc = fluffed.description ? he.decode(fluffed.description) : null

    // Remove any <hmtl> tags from the title to make it human readable
    const title = fluffed.title ? he.decode(fluffed.title) : null

    // Make sure title and description are not the same
    const matchingCheck = fluffed.title !== fluffed.description

    // How long will it take a user to read this story?
    const mins = Math.ceil(fluffed.text.split(' ').length / 250) 

    // Make sure the story is long enough to be worth reading
    const minsCheck = mins > 1 ? mins : null

    // Get a word count of the story's description
    const descWords = desc ? desc.split(' ').length : null

    // Make sure the description is long enough to fill out the front end design
    const descCheck = descWords > 7 ? descWords : null

    // Get the orginal tweeter's Twitter handle for the front end design
    const { screen_name, profile_image_url_https } = tweet.retweeted_status.user

    // Exclude stories in languages that have squeaked through before
    const langCheck = ingornedLanguages.every(lang => fluffed.lang != lang)

    // Clean up the url so it can be used for the front end design
    let displayUrl = url.split('/')[2].replace(/www./i, '')
    
    // Chop off the subdomain if it exists, This is not perfect. 
    // But works for now.
    if (displayUrl.indexOf('.') !== displayUrl.lastIndexOf('.')) {
      const splitArr = displayUrl.split('.')
      if (splitArr[1] !== 'com' && splitArr[1] !== 'co') {
        displayUrl = splitArr.slice(1).join('.')  
      }
    }

    // Fire up the retweeters object with the first retweeter!
    const retweeters = {}
    retweeters[retweeter.name] = retweeter

    // Set the timestamp so the story can be deleted when it is stale
    const timestamp = Date.now()

    // Keep track of the numnber of retweeters to show the most popular stories
    const count = 1

    // The resulting story object...
    const story = {
      langCheck, desc, profile_image_url_https, screen_name,
      displayUrl, title, matchingCheck, minsCheck, descCheck, 
      retweeters, timestamp, url, topic, id, count, image
    }

    // Set up a ref for tracking the story outside the if/else block
    const trackingRef = `tracking/${topic}/${id}`

    // If there are truthy values for all of the data checks, track the story :)
    if (Object.keys(story).every(key => story[key])) {
      groupStory(story.title, topic)
      
      // ditch keys not being used on the client to save on all the things
      const remove = ['matchingCheck', 'langCheck', 'descCheck']
      remove.forEach(key => delete story[key])

      // Save the updated story
      firebase
        .ref(`${topic}/${id}`)
        .set(story)

      // Save a reference so we can update the story if comes in again
      firebase
        .ref(trackingRef)
        .set({tracking: true, timestamp, id})
    }

    // If there are falsey values for any data check, don't track the story :(
    else {
      
      // Save a reference so we don't update the story
      firebase
        .ref(trackingRef)
        .set({tracking: false, timestamp, id})
    }
  }
}