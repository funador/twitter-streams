const { firebase } = require('./config')

exports.deleteStaleKlouters = () => {
  
  setInterval(() => { 
        
        // How old klouters allowed to get
        const cutoff = Date.now() - 24 * 60 * 60 * 1000
        
        // Remove any previous listeners at that node
        firebase
          .ref('klouters')
          .off()

        // Grab the oldest klouter that meets the cutoff
        // child_added gets called everytime a child is removed 
        // unitl all stale klouters are removed
        firebase
          .ref('klouters')
          .orderByChild('timestamp')
          .endAt(cutoff)
          .limitToLast(1)
          .on('child_added', snap => {
            
            // finally, remove th ref
            snap
              .ref
              .remove()

            console.log('deleting klouter:', snap.key)
          })

      // run every 10 minutes
      }, 10 * 60 * 1000)
}