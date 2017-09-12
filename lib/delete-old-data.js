const { firebase, topics } = require('./config')

////////////////////////////////////////////////////////////////////////////////
// Delete stale stories
////////////////////////////////////////////////////////////////////////////////

exports.deleteOldData = () => {

  topics.forEach(topic => {

    setInterval(() => { 
      
      // How old stories allowed to get
      const cutoff = Date.now() - 24 * 60 * 60 * 1000
      
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
          
          // Delete the story
          firebase
            .ref(`${topic}/${id}`).remove()

          // Delete the tracking reference
          snap.ref.remove()
          console.log('deleting story')

        })
    }, 10000)

  })
}