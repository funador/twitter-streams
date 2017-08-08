const { firebase } = require('./config')

exports.updateStory = (topic, id, retweeter) => {
      
  firebase
    .ref(`${topic}/${id}`)
    .transaction(story => {
      
      if(story) {
        
        // Grabing what's needed from the story
        let { retweeters, count } = story

        // Check to make sure new retweeter isn't already in retweeters
        // array. If it is not in the array update the retweeters array
        // with the new retweeter.
        if(retweeters.every(tweeter => tweeter.name != retweeter.name)) {
          story.retweeters = [...retweeters, retweeter]
          story.count++
        }

      }

      return story

  })
}