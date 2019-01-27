const request = require('request')
const { topics } = require('./config')

exports.makeId = url => url.match(/[^_\W]+/g).join('').replace(/w/g, '').substring(5, 40).toLowerCase()

exports.linkCheck = tweet => tweet.retweeted_status 
                              && tweet.entities.urls
                              && tweet.entities.urls[0]
                              && tweet.entities.urls[0].expanded_url

exports.topicCheck = (tweet, expandedUrl) => {
  let textToCheck = `${tweet.text} ${expandedUrl}`

  if(tweet.retweeted_status.text) {
    textToCheck += ` ${tweet.retweeted_status.text}`
  }

  if(tweet.quoted_status) {

    textToCheck += ` ${tweet.quoted_status.text}`

    if(tweet.quoted_status.extended_tweet) {
      textToCheck += ` ${tweet.quoted_status.extended_tweet.full_text}`
    }

  }

  return textToCheck.toLowerCase()
}

let total = 0
let statusCodes = 0

exports.expander = url => {
  return new Promise((resolve, reject) => {
    request(url, (err, res) => {
      if (res && res.statusCode === 200) {
        
        const arr = res.request._redirect.redirects
        if (arr.length) {
          return resolve(arr[arr.length -1].redirectUri)
        }
      }
      else {
        resolve(null)
      } 
    })  
  })
}