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




        // tweets.forEach(function(tweet){
        //   console.log("TWEET  IDDDD", tweet.id);
        //   var time = moment(tweet.timestamp).fromNow()
        //   var splitTime = time.split(' ')
        //   var hours = parseInt(splitTime[0])
        //
        //   if(hours > 4 && splitTime[1] === 'hours' || splitTime[1] === 'days' || splitTime[1] === 'day') {
        //
        //     var onComplete = function(err) {
        //       if (err) {
        //         console.log("DELETE FAILED--------:", id)
        //       } else {
        //         console.log("deleting--------:", tweet.topic)
        //       }
        //     }
        //
        //     ref.child(`all/unfluff/${tweet.id}`).remove()
        //     ref.child(`all/imagesize/${tweet.id}`).remove()
        //     ref.child(`all/shorten/${tweet.id}`).remove()
        //     ref.child(`${tweet.topic}/${tweet.id}`).remove(onComplete)
        //   }
        // })

  }
}
