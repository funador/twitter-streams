'use strict'

var Firebase      = require('firebase')
var kloutRef      = new Firebase('https://klout-scores.firebaseio.com/')
var kloutCueRef   = kloutRef.child('cue')
var kloutScoreRef = kloutRef.child('scored')

module.exports = {
  cue: (ref, path, screen_name) => {

    // something is getting messed up here where it is not looking at the right ref
    kloutScoreRef.child(screen_name).transaction((snap) => {
      if(!snap){
        var kloutObj = {
          path: path,
          screen_name: screen_name
        }
        console.log("screenNAMMMMME", screen_name);

        kloutCueRef.child(screen_name).set(kloutObj)
      }
      else {
        console.log("SNAPPPPP", snap)
        // there is a snap here, we just need to get the score and set it
        // to the right ref
        console.log("it should exist!")
        // var score = snap.score
        // ref.child(path).transaction((snap2) => {
        //   snap2.score += score
        //   return snap2
        // })
      }
    })
  }
}
