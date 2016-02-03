'use strict'

var unfluff     = require('unfluff')
var request     = require('request')
var utils       = require('./utils')

// add catch alls
module.exports = {
  unfluff: (url, cb) => {

    request(url, (err, res, body) => {
      if(err) console.error(err)
      if(!err) {
        var data = unfluff(body)

        if(data.title && data.description && data.text && data.image
           && data.title !== data.description) {

          var description_length = data.description.split(' ').length
          var description        = utils.cleanText(data.description)
          var title              = utils.cleanText(data.title)

          var title_length       = data.title.split(' ').length
          var read_mins          = Math.ceil(data.text.split(' ').length / 200)

          if(data.image.indexOf("http://") > -1) {
            var image = data.image
          }

          var obj = {
            description: data.description,
            image: image || false,
            read_mins: read_mins,
            article: data.text,
            title: data.title
          }

          if(image && description_length < 100 && title_length < 13 && read_mins) {
            // send to classifier
            cb(null, obj)
          }
          else {
            // 
            cb(null, null)
          }
        }
      }
    })
  }
}
