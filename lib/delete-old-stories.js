const { firebase, topics } = require('./config')

////////////////////////////////////////////////////////////////////////////////
// Delete stale stories
////////////////////////////////////////////////////////////////////////////////

exports.deleteOldStories = () => {

  topics.forEach(topic => {

    setInterval(() => { 
      
      // How old stories allowed to get
      const cutoff = Date.now() - 8 * 60 * 60 * 1000
      
      // Remove any previous listeners at that node
      firebase.ref(`tracking/${topic}`).off()

      // Grab the oldest story that meets the cutoff
      // child_added gets called everytime a child is removed as well
      // unitl all stale stories are removed
      firebase
        .ref(`tracking/${topic}`)
        .orderByChild('timestamp')
        .endAt(cutoff)
        .limitToLast(1)
        .on('child_added', snap => {

          // Grab the id for the story to be deleted
          const id = snap.val().id
          console.log('deleting story')
          // Delete the story
          firebase
            .ref(`${topic}/${id}`).remove()

          // Delete the tracking reference
          snap.ref.remove()

        })
    }, 10000)

  })
}