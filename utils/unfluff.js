'use strict'

var unfluff     = require('unfluff')
var request     = require('request')
var utils       = require('./utils')

// add catch alls
module.exports = {
  unfluff: (ref, countRef, tweet, id) => {
    var url = tweet.url

    request(url, (err, res, body) => {
      if(!err) {
        var data = unfluff(body)

        if(data.title && data.description && data.text && data.image
           && data.title !== data.description) {

          var description        = utils.cleanText(data.description)
          var title              = utils.cleanText(data.title)
          var read_mins          = Math.ceil(data.text.split(' ').length / 250)
          var desc_words         = description.split(' ').length


          if(data.image.indexOf("http://") > -1 || data.image.indexOf("https://") > -1) {
            var image = data.image
          }

          if(data.videos[0]) {
            if(data.videos[0].src) {
              if(data.videos[0].src.length) {
                tweet.video = true
              }
            }
          }

          tweet.description = data.description
          tweet.image = image || false
          tweet.read_mins = read_mins
          tweet.article = data.text
          tweet.title = data.title
          tweet.lang = data.lang

          if(tweet.image && tweet.read_mins > 3 && desc_words > 7
                         && desc_words < 100 && data.lang !== 'es' && data.lang !== 'fr' && data.lang !== 'ru'
                         && data.lang !== 'fi' && data.lang !== 'tr') {

            ref.child(`all/imagesize/${id}`).set(tweet)

            countRef.child(`sport/${tweet.topic}`).transaction(function(snap) {
              return snap + 1
            })
          }
        }
      }
    })
  }
}
