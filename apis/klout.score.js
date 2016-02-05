'use strict'

var key         = "6crs5vgdsnhp5vsg8wvnug99"
var request     = require('request')
var baseUrl     = 'http://api.klout.com/v2/'
var idUrl       = `${baseUrl}identity.json/twitter?screenName=`
var Firebase    = require('firebase')
var kloutRef      = new Firebase('https://klout-scores.firebaseio.com/')
var kloutCueRef   = kloutRef.child('cue')
var kloutScoreRef = kloutRef.child('scored')

// insert try/catch?

module.exports = {
  score: (ref) => {
    function getScore() {

      kloutCueRef.limitToFirst(1).once("value", function(snap) {
        if(snap.val()){
          var obj = snap.val()
          var handle = Object.keys(obj)[0]
          var path = obj[handle].path

          kloutCueRef.child(handle).remove()

          request(`${idUrl}${handle}&key=${key}`, (err, res, body) => {
            if(err) console.error(err)
            if(body) {
              var kloutId = JSON.parse(body)

              // klout score
              request(`${baseUrl}user.json/${kloutId.id}/score?key=${key}`, (err, res, body) => {
                if(err) console.error(err)
                  if(body) {
                    var score = JSON.parse(body)

                    var kloutObj = {
                      score: Math.floor(score.score),
                      checked: true
                    }

                    kloutScoreRef.child(handle).set(kloutObj)
                    console.log("score + handle", Math.floor(score.score), handle)

                    ref.child(path).once('value', (snap) => {
                      var obj = snap.val()
                      var updatedScore = obj.score + Math.floor(score.score)

                      ref.child(path).update({
                        score: updatedScore
                      })
                    })
                  }
                })
              }
            })
          }
      })
      setTimeout(getScore, 2000)
    }

    getScore();

  }
}
