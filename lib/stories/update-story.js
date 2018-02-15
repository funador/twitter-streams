const makeImages = require('./make-images')
const { firebase } = require('../config')

module.exports = async (topic, id, retweeter) => {
  
////////////////////////////////////////////////////////////////////////////////
// Update tracked stories with new retweeters
////////////////////////////////////////////////////////////////////////////////

  firebase
    .ref(`${topic}/${id}`)
    .transaction(story => {
      
      // make sure there is a story
      if(story) {
        
        // Grabing what's needed from the story
        let { retweeters, count, image } = story

        // count the number of current retweeters
        const len = Object.keys(retweeters).length

        // Is this retweeter a new retweeter?
        const newRetweeter = !retweeters[retweeter.name]
        
        // Check to make sure new retweeter isn't already in retweeters
        // object. If it is not in the object update the retweeters object
        // with the new retweeter.
        if (newRetweeter && len < 200) {
          story.retweeters[retweeter.name] = retweeter
        }

        // Increment the count if a new retweeter
        if (newRetweeter) {
          story.count += 1
        }

        if (len > 2 && image) {
          makeImages(image, topic, id)
          delete story.image
        }
      
      }
      
      // put the story back where it came from
      return story

  })
}