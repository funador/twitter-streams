const request = require('request-promise')
const unfluff = require('unfluff')
const size = require('request-image-size')

const { firebase, ingornedLanguages, ignoredDomains, resizeHero, resizeThumb, 
        cloudinary } = require('../config')
const { cleanText } = require('../utils')


////////////////////////////////////////////////////////////////////////////////
// fullExtract determines whether or not a story should be tracked.
// First, the data set is expanded and then it is scrubed against
// quality checks. Aiming at *quality* reads all the time...
////////////////////////////////////////////////////////////////////////////////

module.exports = async (tweet, topic, id, url, retweeter) => {
  
  // Unfluff the story to unpack the page content including its description,
  // body, title and image
  let fluffed

  try {
    const preFluffed = await request(url)
    fluffed = unfluff(preFluffed)
  }
  catch(e) {console.log('Error in preFluffed', e.statusCode)}

  if (fluffed) {
   
    // comment out this section
    const image = fluffed.image || 'no-image'
    let heroImg = 'no-image', thumbnailImg, displaySize

    if(image != 'no-image') {
      try {
        const dimensions = await size(image)
        const sizeCheck = dimensions.width >= 900 && dimensions.height >= 500
        
        thumbnailImg = await cloudinary(image, resizeThumb)  

        if(sizeCheck) {
          heroImg = await cloudinary(image, resizeHero)
          displaySize = 'hero'
        }
        else {
          displaySize = 'thumbnail'
        } 
      }
      catch(e) {console.log('error in image')}
    }

    // Remove any <hmtl> tags from the description to make it human readable
    const desc = fluffed.description ? cleanText(fluffed.description) : null

    // Remove any <hmtl> tags from the title to make it human readable
    const title = fluffed.title ? cleanText(fluffed.title) : null

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

    // Exclude stories from domains that are in the ignoredDomains array
    const ignoredCheck = ignoredDomains.every(domain => !url.includes(domain))

    // Clean up the url so it can be used for the front end design
    let displayUrl = url.split('/')[2].replace(/www./i, '')
    
    // Chop off the subdomain if it exists
    if (displayUrl.indexOf('.') !== displayUrl.lastIndexOf('.')) {
      displayUrl = displayUrl.split('.').slice(1).join('.')
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
      displayUrl, title, matchingCheck, minsCheck, ignoredCheck,
      descCheck, retweeters, timestamp, url, topic, id, count,
      heroImg, thumbnailImg, displaySize
    }

    // Set up a ref for tracking the story
    const trackingRef = `tracking/${topic}/${id}`

    // If there are truthy values for all of the data checks, track the story :)
    if (Object.keys(story).every(key => story[key])) {
      
      // ditch keys not being used on the client
      delete story.matchingCheck
      delete story.langCheck
      delete story.ignoredCheck
      delete story.descCheck

      // Save the story in Firebase
      firebase
        .ref(`${topic}/${id}`)
        .set(story)

      // Save a reference so we can update the story
      firebase
        .ref(trackingRef)
        .set({tracking: true, timestamp, id})

    }

    // If there are falsey values for any data check, don't track the story :(
    else {

      // Save a reference so we don't update the story
      firebase
        .ref(trackingRef)
        .set({tracking: false, timestamp, id, url})

    }
  }
}