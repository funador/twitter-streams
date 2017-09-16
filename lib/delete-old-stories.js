const { firebase, topics } = require('./config')

////////////////////////////////////////////////////////////////////////////////
// Delete stale stories
////////////////////////////////////////////////////////////////////////////////

exports.deleteOldStories = () => {
  
  setInterval(() => { 
    
    firebase
      .ref('ico')
      .once('value')
      .then(snap => {
        const obj = snap.val()

        if(obj) {
          Object.keys(obj).forEach(key => {

            // How old retweeters are allowed to get
            const cutoff = Date.now() - 16 * 60 * 60 * 1000
            
            // Remove any previous listeners at that node
            firebase
              .ref(`ico/${key}/retweeters`)
              .off()

            // Grab the oldest story that meets the cutoff
            // child_added gets called everytime a child is removed as well
            // unitl all stale stories are removed
            firebase
              .ref(`ico/${key}/retweeters`)
              .orderByChild('created')
              .endAt(cutoff)
              .limitToLast(1)
              .on('child_added', snap => {

                // Grab the id for the retweeter to be deleted
                const id = snap.key
                
                // Delete the retweeter
                firebase
                  .ref(`ico/${key}/retweeters/${id}`)
                  .remove()


                // reset the count
                // reset the klout score
                // check if that is the last retweeter, then delete the story

                console.log("retweeter deleted", key, id)
                
            })
          })
        }
    })
  // run every 30 mins
  }, 30 * 60 * 1000)
}