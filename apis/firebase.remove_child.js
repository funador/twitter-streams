'use strict'

var async = require('async')

module.exports = {
  remove_child: (ref) => {

    setInterval(function () {
      var cutoff = Date.now() - 4 * 60 * 60 * 1000

      // do a transacton?
      ref.child('all/unfluff').orderByChild("timestamp").endAt(cutoff).limitToLast(1).once('value', (snap) => {
        if(snap.val()){
          var tweet = snap.val()
          var id = Object.keys(snap.val())[0]

          var onComplete = function(err) {
            if (err) {
              console.log("DELETE FAILED--------:", tweet[id].id)
            } else {
              console.log("deleting--------:", tweet[id].topic)
            }
          };

          ref.child(`all/unfluff/${id}`).remove()
          ref.child(`all/imagesize/${id}`).remove()
          ref.child(`all/shorten/${id}`).remove()
          ref.child(`${tweet.topic}/${id}`).remove(onComplete)

        }
      })
    }, 100)

  }
}
