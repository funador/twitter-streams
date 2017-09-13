const { firebase } = require('./config')

////////////////////////////////////////////////////////////////////////////////
// Delete stale social
////////////////////////////////////////////////////////////////////////////////

exports.deleteStaleSocial = social => {
  
  setInterval(() => { 
        
        // How old klouters allowed to get
        const cutoff = Date.now() - 24 * 60 * 60 * 1000
        
        // Remove any previous listeners at that node
        firebase
          .ref(social)
          .off()

        // Grab the oldest social account that meets the cutoff
        // child_added gets called everytime a child is removed 
        // unitl all stale social accounts are removed
        firebase
          .ref(social)
          .orderByChild('timestamp')
          .endAt(cutoff)
          .limitToLast(1)
          .on('child_added', snap => {
            
            // finally, remove th ref
            snap
              .ref
              .remove()

            console.log(`deleting ${social}:`, snap.key)
          })

      // run every 10 minutes
      }, 10 * 60 * 1000)
}