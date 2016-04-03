'use strict'

module.exports = {
  remove_child: (ref) => {
    ref.child('all/unfluff').orderByChild("timestamp").limitToFirst(1).on('child_added', (snap) => {
      var tweet = snap.val()
      var id = snap.key()
      var cutoff = Date.now() - 1 * 60 * 60 * 1000;
      var timestamp = tweet.timestamp

      if(timestamp < cutoff) {
        ref.child(`all/unfluff/${id}`).remove()
        ref.child(`all/imagesize/${id}`).remove()
        ref.child(`all/pagerank/${id}`).remove()
        ref.child(`all/shorten/${id}`).remove()
        ref.child(`${tweet.topic}/${id}`).remove()
      }
    })
  }
}
