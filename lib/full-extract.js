const request = require('request-promise')
const unfluff = require('unfluff')
const sentiment = require('sentiment')

const { cleanText, ageCheck, topicsBuilder } = require('./utils')
const { firebase, ingornedLanguages, ignoredDomains } = require('./config')
const { kloutExtract } = require('./klout-extract')
const { readingLevel } = require('reading-level')
const { mozrank } = require('./mozrank')

////////////////////////////////////////////////////////////////////////////////
// fullExtract determines whether or not a story should be tracked.
// First, the data set is expanded and then it is scrubed against
// quality checks. Aiming at *quality* reads all the time...
////////////////////////////////////////////////////////////////////////////////

exports.fullExtract = async (tweet, topic, id, url, retweeter) => {

  // Unfluff the story to unpack the page content including its description,
  // body, title and image
  let fluffed
  try {
    const preFluffed = await request(url)
    fluffed = unfluff(preFluffed)
    
  }
  catch(e) {}

  if (fluffed) {
    
    // Extract the sentiment pos/neg of the article
    let sentiFluff = sentiment(fluffed.text)
    
    if (sentiFluff) {
      const score = {
        score: sentiFluff.score
      }

      const comparative = {
        comparative: (sentiFluff.comparative * 100).toFixed(2)
      }

      sentiFluff = Object.assign({}, score, comparative)
    }
   
    const image = fluffed.image || 'no-image'

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

    // get the reading level of the article
    let level = readingLevel(fluffed.text)
    
    if(isNaN(level)) {
      level = null
    }

    // Get the orginal tweeter's Twitter handle for the front end design
    const { screen_name, profile_image_url_https } = tweet.retweeted_status.user
    
    // get the klout score and topics of the tweeter and retweeter
    const kloutOriginal = await kloutExtract(screen_name, profile_image_url_https, id)
    const kloutRetweeter = await kloutExtract(retweeter.name, retweeter.img, id)
   
    retweeter.klout = kloutRetweeter.score
    retweeter.created = Date.now()

    // cumulative tracking of topics and scores for all retweeters
    const preTopics = [...kloutOriginal.topics, ...kloutRetweeter.topics]
    const topics = topicsBuilder({}, preTopics)

    const kloutScore = kloutOriginal.score + kloutRetweeter.score


    // Make sure the retweeter's Twitter account is at least a year old to
    // avoid spammy accounts
    const age = ageCheck(tweet.retweeted_status.user)

    // Exclude stories in languages that have squeaked through before
    const langCheck = ingornedLanguages.every(lang => fluffed.lang != lang)

    // Exclude stories from domains that are in the ignoredDomains array
    const ignoredCheck = ignoredDomains.every(domain => !url.includes(domain))

    // Clean up the url so it can be used for the front end design
    const displayUrl = url.split('/')[2].replace(/www./i, '')
    const mozRanked = await mozrank(url)

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
      displayUrl, age, title, matchingCheck, minsCheck, ignoredCheck,
      descCheck, retweeters, timestamp, url, topic, id, count, sentiFluff,
      topics, kloutScore, level, mozRanked, image
    }

    // Set up a ref for tracking the story
    const trackingRef = `tracking/${topic}/${id}`
    
    // If there are truthy values for all of the data checks, track the story :)
    if (Object.keys(story).every(key => story[key])) {
     
      firebase
        .ref(`${topic}/${id}`)
        .set(story)

      firebase
        .ref(trackingRef)
        .set({tracking: true, timestamp, id})

    }

    // If there are falsey values for any data check, don't track the story :(
    else {
      
      firebase
        .ref(trackingRef)
        .set({tracking: false, timestamp, id, url})

    }
  }
}