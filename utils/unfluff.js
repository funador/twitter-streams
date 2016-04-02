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
          var read_mins          = Math.ceil(data.text.split(' ').length / 200)

          if(data.image.indexOf("http://") > -1) {
            var image = data.image
          }

          tweet.description = data.description
          tweet.image = image || false
          tweet.read_mins = read_mins
          tweet.article = data.text
          tweet.title = data.title

          if(tweet.image && tweet.read_mins > 2 && tweet.description.length > 10
                         && data.lang === 'en') {

            ref.child(`all/pagerank/${id}`).set(tweet)

            countRef.child(`sport/${tweet.topic}`).transaction(function(snap) {
              return snap + 1
            })
          }
        }
      }
    })
  }
}
