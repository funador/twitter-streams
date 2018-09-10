const { firebase, topics } = require('../config')

////////////////////////////////////////////////////////////////////////////////
// Delete stale stories
////////////////////////////////////////////////////////////////////////////////

module.exports = () => {

  const deleteStories = topics => {

    // set how long stories are allowed to get
    const cutoff = Date.now() - 8 * 60 * 60 * 1000

    // run for each topic in the topics array
    topics.forEach(async topic => {

      // remove any event listeners still open on that node
      await firebase
        .ref(`tracking/${topic}`)
        .off()

      // Find a story that is older than the cutoff
      // child_added gets triggered every time a story is deleted
      // so this will run until there are no old stories left
      firebase
        .ref(`tracking/${topic}`)
        .orderByChild('timestamp')
        .endAt(cutoff)
        .limitToLast(1)
        .on('child_added', async snap => {
          

          // grab the id of the story to remove
          const id = snap.key

          // console.log('deleting:', topic, id) 
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

  // and again every 15 mins
  setInterval(() => deleteStories(topics), 15 * 60 * 1000)
}