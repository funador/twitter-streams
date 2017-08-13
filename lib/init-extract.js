const uu = require('url-unshort')()

const { fullExtract } = require('./full-extract')
const { updateStory } = require('./update-story')
const { firebase, topics, ignoredDomains } = require('./config')
const { makeId, topicCheck } = require('./utils') 

////////////////////////////////////////////////////////////////////////////////
// initExtract detemies whether a story is being tracked. If a story
// is being tracked, update the story. Otherwise, kick off fullExtract
////////////////////////////////////////////////////////////////////////////////

exports.initExtract = async tweet => {

  const expandedUrl = tweet.entities.urls[0].expanded_url
  
  // Unshorten expandedUrl by running it through uu.expand
  let uuexpand
  try {
    uuexpand = await uu.expand(expandedUrl)
  }
  catch(e) {}

  // use the expanded url or the original to make the id for the story
  const url = uuexpand ? uuexpand : expandedUrl

  // By using a substring of 'url' as an id, a story can be tracked even if
  // it is retweeted from multiple Twitter accounts. Its not perfect, but it
  // significantly reduces duplicate stories that are tweeted using different 
  // url shorteners
  const id = url ? makeId(url) : null

  // Build up a string that can be filtered to find which topic matched
  // from the topics array (break this into helpers)
  const textToCheck = topicCheck(tweet, expandedUrl)

  // Filter textToCheck to find the topic that was tracked in the stream
  const topic = topics.filter(topic => textToCheck.includes(topic))[0]

  // The retweeter to be added to the story
  const retweeter = {
    name: tweet.user.screen_name,
    img: tweet.user.profile_image_url_https
  }

  // Make a transaction at the tracking reference for the story to determine
  // if the story is being tracked and if not kick off the process to check
  // the quality of the story
  if(topic && id) {

    firebase
      .ref(`tracking/${topic}/${id}`)
      .once('value')
      .then(snap => {
        
        const story = snap.val()

        // The story has been checked and is being tracked, must be a good one :)
        // Update the story with the latest retweeter
        if(story && story.tracking) {
          updateStory(topic, id, retweeter)
        }

        // The story was already checked and didn't pass the quality tests :(
        else if(story && !story.tracking) {
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