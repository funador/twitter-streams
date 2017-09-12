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

        // check the retweeters age
        if(retweeters.every(tweeter => tweeter.name != retweeter.name)) {

          retweeter.created = Date.now()
          retweeter.klout = kloutRetweeter.score
          story.kloutScore += kloutRetweeter.score
          if(!story.topics) story.topics = []
          story.topics = [...story.topics, ...kloutRetweeter.topics]
          story.retweeters = [...retweeters, retweeter]
          story.count++
        }
      }

      return story

  })
}