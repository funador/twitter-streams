const fullExtract = require('./full-extract')
const updateStory = require('./update-story')
const { firebase, topics, ignoredDomains, shorteners } = require('../config')
const { makeId, topicCheck, topicFinder, expander } = require('../utils') 

module.exports = async (tweet, retweeter) => {

  //////////////////////////////////////////////////////////////////////////////
  // initExtract detemies whether a story is being tracked. If a story
  // is being tracked, update the story. Otherwise, kick off fullExtract
  //////////////////////////////////////////////////////////////////////////////
  
  // Expander follows redirects to find the original link
  const url = await expander(tweet.entities.urls[0].expanded_url)
  console.log('has it been expanded?', url !== tweet.entities.urls[0].expanded_url)

  // By using a substring of 'url' as an id, a story can be tracked even if
  // it is retweeted from multiple Twitter accounts. 
  const id = url ? makeId(url) : null

  // Build up a string that can be filtered to find which topic matched
  // from the topics array (break this into helpers)
  const textToCheck = topicCheck(tweet, url)

  // Filter textToCheck to find the topic that was tracked in the stream
  const topic = topics.filter(topic => textToCheck.match(topic))[0]

  // Make a transaction at the tracking reference for the story to determine
  // if the story is being tracked and if not kick off the process to check
  // the quality of the story
  if (topic && id) {

    firebase
      .ref(`tracking/${topic}/${id}`)
      .once('value')
      .then(snap => {
        
        const story = snap.val()

        // The story has been checked and is being tracked, must be a good one :)
        // Update the story with the latest retweeter
        if (story && story.tracking) {
          updateStory(topic, id, retweeter)
        }

        // The story was already checked and didn't pass the quality tests :(
        else if (story && !story.tracking) {
          return
        }

        // The story hasn't been checked yet
        // See if it is worth tracking
        else {
          fullExtract(tweet, topic, id, url, retweeter)
        }
    })
  }
}