const request = require('request-promise')
const unfluff = require('unfluff')
const size = require('request-image-size')
const he = require('he')

const { firebase, ingornedLanguages, ignoredDomains, resizeHero, resizeThumb, 
        cloudinary } = require('../config')


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
  catch(e) {}

  // Check if there is an article to work with
  if (fluffed) {
   
    // Check to see if there is an image in the story
    const image = fluffed.image || 'no-image'

    // Instantiate variables for the images
    let heroImg = 'no-image', thumbnailImg, displaySize

    // If there is an image to play with
    if(image != 'no-image') {

      try {

        // Get the dimensions of the image
        const dimensions = await size(image)

        // Check if the dimensions are big enough for a hero image
        const heroCheck = dimensions.width >= 900 && dimensions.height >= 500
        
        // Make a thumbnail image regardless
        thumbnailImg = await cloudinary(image, resizeThumb)  

        // Is it big enough to be a hero?
        if (heroCheck) {

          // Make the hero image and set the flag to 'hero'
          heroImg = await cloudinary(image, resizeHero)
          displaySize = 'hero'
        }

        // Set the flag to 'thumbnail'
        else {
          displaySize = 'thumbnail'
        } 
      }

      catch(e) {}
    }

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

    // Exclude stories from domains that are in the ignoredDomains array
    const ignoredCheck = ignoredDomains.every(domain => !url.includes(domain))

    // Clean up the url so it can be used for the front end design
    let displayUrl = url.split('/')[2].replace(/www./i, '')
    
    // Chop off the subdomain if it exists, this is not perfect. 
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