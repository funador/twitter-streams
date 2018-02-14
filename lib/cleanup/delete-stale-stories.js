const { firebase, topics } = require('../config')

////////////////////////////////////////////////////////////////////////////////
// Delete stale stories
////////////////////////////////////////////////////////////////////////////////

module.exports = () => {

  const deleteStories = topics => {
    
    console.log('checking for stories to remove')
    
    const cutoff = Date.now() - 10 * 60 * 60 * 1000

    topics.forEach(topic => {
      firebase
        .ref(`tracking/${topic}`)
        .orderByChild('timestamp')
        .endAt(cutoff)
        .limitToLast(1)
        .on('child_added', async snap => {
          
          // grab the id of the story to remove
          const id = snap.key

          // remove the tracking reference
          await firebase
            .ref(`tracking/${topic}/${id}`)
            .remove()

          // finally remove the story
          await firebase
            .ref(`${topic}/${id}`)
            .remove()

        })
    })
  }

  // run on server start
  deleteStories(topics)

  // and again every 30 mins
  setInterval(() => deleteStories(topics), 30 * 60 * 1000)
}