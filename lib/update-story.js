const { firebase } = require('./config')
const { kloutExtract } = require('./klout')

////////////////////////////////////////////////////////////////////////////////
// Update tracked stories with the new retweeter
////////////////////////////////////////////////////////////////////////////////

exports.updateStory = async (topic, id, retweeter) => {
  
  const kloutRetweeter = await kloutExtract(retweeter.name)
  
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
          // console.log("RETWEETER", retweeter)
          // console.log("STORY", story)
          retweeter.created = Date.now()
          story.kloutScore += kloutRetweeter.score
          story.topics = [...story.topics, ...kloutRetweeter.topics]
          story.retweeters = [...retweeters, retweeter]
          story.count++
        }

      }

      return story

  })
}