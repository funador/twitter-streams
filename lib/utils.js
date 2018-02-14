const moment = require('moment')
const request = require('request')
const { topics } = require('./config')

exports.makeId = url => url.match(/[^_\W]+/g).join('').replace(/w/g, '').substring(5, 40).toLowerCase()

exports.linkCheck = tweet => tweet.retweeted_status 
                              && tweet.entities.urls
                              && tweet.entities.urls[0]
                              && tweet.entities.urls[0].expanded_url

exports.cleanText = text => text.replace(/&nbsp;/g, " ").replace(/&#39;/g, "'").replace(/&amp;/g, '&')
                                .replace(/&quot;/g, "'").replace(new RegExp('&#39;', 'g'), "'")
                                .replace(new RegExp('&nbsp;', 'g'), " ").replace(new RegExp('&amp;', 'g'), "&")
                                .replace(new RegExp('&quot', 'g'), "'")

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

// argh... twitter timestamps :/
exports.dateFomatter = date => {
  const busted = date.split(' ')
  const month = moment().month(busted[1]).format("MM")
  const time = [busted[5], month, busted[2], busted[3]].join('')
  return moment(time, "YYYYMMDD HH:mm:ss")
}

exports.topicFinder = str => {
  return topics.filter(topic => str.match(topic))[0]
}

exports.expander = url => {
  return new Promise((resolve, reject) => {
    request(url, (err, res) => {
      if (res) {
        const arr = res.request._redirect.redirects
        if (arr.length) {
          return resolve(arr[arr.length -1].redirectUri)
        }
      }
      resolve(url)
    })  
  })
}