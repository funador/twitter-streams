'use strict'

// there is a problem here....
module.exports = {
  remove_child: (ref) => {
    var cutoff = Date.now() - 4 * 60 * 60 * 1000

    ref.child('all/unfluff').orderByChild("timestamp").endAt(cutoff).on('child_added', (snap) => {
      // I think here you need to loop through and delete
      // check what comes back in the snap?

      var tweet = snap.val()
      var id = snap.key()

      ref.child(`all/unfluff/${id}`).remove()
      ref.child(`all/imagesize/${id}`).remove()
      ref.child(`all/pagerank/${id}`).remove()
      ref.child(`all/shorten/${id}`).remove()
      ref.child(`${tweet.topic}/${id}`).remove()
    })
  }
}
