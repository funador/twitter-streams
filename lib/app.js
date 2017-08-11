require('dotenv').config()

const { initExtract } = require('./init-extract')
const { stream, firebase, topics } = require('./config')
const { linkCheck } = require('./utils') 

////////////////////////////////////////////////////////////////////////////////
// Find retweeted tweets with links on tracked topics
////////////////////////////////////////////////////////////////////////////////


stream

  .on('tweet', tweet => {

    if(linkCheck(tweet)) {

      console.log(tweet.user.screen_name)
      initExtract(tweet)
    }
  })

  .on('error', err => console.error(err))


////////////////////////////////////////////////////////////////////////////////
// Delete stale stories
////////////////////////////////////////////////////////////////////////////////

topics.forEach(topic => {

  // let cutoff = Date.now() - 8 * 60 * 60 * 1000
  
  setInterval(() => { 

    // How old stories allowed to get
    const cutoff = Date.now() - 8 * 60 * 60 * 1000

    // Remove any previous listeners at that node
    firebase.ref(`tracking/${topic}`).off()

    // Grab the oldest story that meets the cutoff
    // child_added gets called everytime a child is removed as well
    firebase
      .ref(`tracking/${topic}`)
      .orderByChild('timestamp')
      .endAt(cutoff)
      .limitToLast(1)
      .on('child_added', snap => {

        // Grab the id for the story to be deleted
        const id = snap.val().id

        // Delete the story
        firebase
          .ref(`${topic}/${id}`).remove()

        // Delete the tracking reference
        snap.ref.remove()

      })
  }, 30000)
  
})
