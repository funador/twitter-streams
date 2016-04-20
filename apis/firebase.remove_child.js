'use strict'

var async = require('async')

module.exports = {
  remove_child: (ref) => {

    setInterval(function () {
      var cutoff = Date.now() - 1 * 60 * 60 * 1000

      // do a transacton?
      ref.child('all/unfluff').orderByChild("timestamp").endAt(cutoff).limitToLast(1).once('value', (snap) => {
        if(snap.val()){
          var tweet = snap.val()
          var id = Object.keys(snap.val())[0]

          ref.child(`all/imagesize/${id}`).remove()
          ref.child(`all/shorten/${id}`).remove()
          ref.child(`${tweet.topic}/${id}`).remove()
          ref.child(`all/unfluff/${id}`).remove()
          console.log("deleting--------:", tweet[id].topic)
        }

      })
    }, 100)

  }
}
