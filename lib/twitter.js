require('dotenv').config()
require('now-logs')('snacks')
const express =  require('express')

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

  // How old stories allowed to get
  let cutoff = Date.now() - 8 * 60 * 60 * 1000

  // Make a listener for each topic and look at the oldest story for that topic
  firebase
    .ref(`${topic}`)
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
      firebase
        .ref(`tracking/${topic}/${id}`).remove()

      // Reset the cutoff
      cutoff = Date.now() - 8 * 60 * 60 * 1000

    })
})
