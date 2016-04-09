'use strict'

module.exports = {
  remove_child: (ref) => {
    var cutoff = Date.now() - 1 * 60 * 60 * 1000

    ref.child('all/unfluff').orderByChild("timestamp").endAt(cutoff).limitToLast(1).on('child_added', (snap) => {

      var tweet = snap.val()
      var id = snap.key()

      console.log("--------------------------------", tweet)

      ref.child(`all/unfluff/${id}`).remove()
      ref.child(`all/imagesize/${id}`).remove()
      ref.child(`all/pagerank/${id}`).remove()
      ref.child(`all/shorten/${id}`).remove()
      ref.child(`${tweet.topic}/${id}`).remove()
    })
  }
}
