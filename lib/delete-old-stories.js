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
            const cutoff = Date.now() - 3.6 * 60 * 60 * 1000
            
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
                const retweeter = snap.val()

                // Delete the retweeter
                firebase
                  .ref(`ico/${key}/retweeters/${id}`)
                  .remove()
                  .then(() => {

                    firebase
                      .ref(`ico/${key}`)
                      .transaction(story => {
                        
                        if(story) {
                          
                          if(!story.retweeters) {
                            firebase
                              .ref(`ico/${key}`)
                              .remove()
                          }

                          else {
                            story.count--
                            console.log("updating kloutscore", retweeter.klout)
                            story.kloutScore -= retweeter.klout
                            return story
                          }
                        }

                        return story
                      })
                })
            })
          })
        }
    })

  // run every 30 mins
  }, 20 * 60 * 1000)
}