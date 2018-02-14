const { topicsBuilder } = require('../utils')
const { firebase } = require('../config')


////////////////////////////////////////////////////////////////////////////////
// Update tracked stories with new retweeters
////////////////////////////////////////////////////////////////////////////////

module.exports = async (topic, id, retweeter) => {
  
  firebase
    .ref(`${topic}/${id}`)
    .transaction(story => {
      
      // make sure there is a story
      if(story) {
        
        // Grabing what's needed from the story
        let { retweeters, count } = story

        // count the number of current retweeters
        const len = Object.keys(retweeters).length

        // Check to make sure new retweeter isn't already in retweeters
        // object. If it is not in the object update the retweeters object
        // with the new retweeter.
        if(!retweeters[retweeter.name] && len < 200) {
          story.retweeters[retweeter.name] = retweeter
        }

        // increment the count regardless
        story.count += 1
      }

      // put the story back where it came from
      return story

  })
}