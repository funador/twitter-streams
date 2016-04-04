'use strict'

// there is a problem here....
module.exports = {
  remove_child: (ref) => {
    ref.child('all/unfluff').orderByChild("timestamp").endAt(Date.now() - 60 * 60 * 1000).on('child_added', (snap) => {
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
