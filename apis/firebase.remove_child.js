'use strict'

var moment = require('moment')

module.exports = {
  remove_child: (ref) => {

    setInterval(function(){
      ref.child('all/unfluff').orderByChild("timestamp").limitToFirst(1).once('value', (snap) => {
        if(snap.val()){
          var tweet = snap.val()
          var id = Object.keys(snap.val())[0]

          var time = moment(tweet[id].timestamp).fromNow()
          var splitTime = time.split(' ')
          var hours = parseInt(splitTime[0])

          if(hours > 8 && splitTime[1] === 'hours' || splitTime[1] === 'days' || splitTime[1] === 'day') {

            var onComplete = function(err) {
              if (err) {
                console.log("DELETE FAILED--------:", tweet[id].id)
              } else {
                console.log("deleting--------:", tweet[id].topic)
              }
            }

            ref.child(`all/unfluff/${id}`).remove()
            ref.child(`all/imagesize/${id}`).remove()
            ref.child(`all/shorten/${id}`).remove()
            ref.child(`${tweet[id].topic}/${id}`).remove(onComplete)
          }

        }
      })
    }, 500)
  }
}
