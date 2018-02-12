const { topicsBuilder } = require('../utils')
const { firebase } = require('../config')


////////////////////////////////////////////////////////////////////////////////
// Update tracked stories with the new retweeter
////////////////////////////////////////////////////////////////////////////////

exports.updateStory = async (topic, id, retweeter) => {
  
  firebase
    .ref(`${topic}/${id}`)
    .transaction(story => {
      if(story) {
        
        // Grabing what's needed from the story
        let { retweeters, count } = story

        // Check to make sure new retweeter isn't already in retweeters
        // object. If it is not in the object update the retweeters object
        // with the new retweeter.
        if(!retweeters[retweeter.name]) {
          story.retweeters[retweeter.name] = retweeter
          story.count += 1
        }
      }

      return story

  })
}