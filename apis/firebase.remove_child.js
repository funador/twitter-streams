'use strict'

module.exports = {
  remove_child: (ref) => {

    setInterval(function () {
      var cutoff = Date.now() - 4 * 60 * 60 * 1000

      ref.child('all/unfluff').orderByChild("timestamp").endAt(cutoff).limitToLast(10).on('child_added', (snap) => {

        var tweet = snap.val()
        var id = snap.key()

        console.log("-----------deleting tweet: ", `${tweet.topic}`)

        ref.child(`all/unfluff/${id}`).remove()
        ref.child(`all/imagesize/${id}`).remove()
        ref.child(`all/shorten/${id}`).remove()
        ref.child(`${tweet.topic}/${id}`).remove()
      })
    }, 5000)

  }
}
