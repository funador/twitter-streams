'use strict'

var key       = require('../utils/constants').key
var request   = require('request')
var baseUrl   = 'http://api.klout.com/v2/'
var idUrl     = `${baseUrl}identity.json/twitter?screenName=`

module.exports = {

  score: (ref, id, handle) => {
    // klout handshake
    request(`${idUrl}${handle}&key=${key}`, (err, res, body) => {
      if(err) console.error(err)
      if(body) {
        var kloutId = JSON.parse(body)
        // klout score
        request(`${baseUrl}user.json/${kloutId.id}/score?key=${key}`,
          (err, res, body) => {
            if(err) console.error(err)
            if(body) {
              var score = JSON.parse(body)
              // send the score to the apt article
              // you can remove the callback now
              cb(null, Math.floor(score.score))
            }
        })
      }
    })
  }
}
