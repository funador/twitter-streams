const { kloutExtract } = require('./klout-extract')
const { topicsBuilder } = require('../utils')
const { firebase } = require('../config')


////////////////////////////////////////////////////////////////////////////////
// Update tracked stories with the new retweeter
////////////////////////////////////////////////////////////////////////////////

exports.updateStory = async (topic, id, retweeter) => {
  
  const kloutRetweeter = await kloutExtract(retweeter.name, id)
  
  firebase
    .ref(`${topic}/${id}`)
    .transaction(story => {
      if(story) {
        
        // Grabing what's needed from the story
        let { retweeters, count } = story

        // Check to make sure new retweeter isn't already in retweeters
        // array. If it is not in the array update the retweeters array
        // with the new retweeter.
        if(!retweeters[retweeter.name]) {

          if(!story.topics) story.topics = []
          retweeter.created = Date.now()
          retweeter.klout = kloutRetweeter.score     
          story.kloutScore += kloutRetweeter.score
          story.topics = topicsBuilder(story.topics, kloutRetweeter.topics)
          story.retweeters[retweeter.name] = retweeter
          story.count = Object.keys(retweeters).length
        }
      }

      return story

  })
}