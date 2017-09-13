const moment = require('moment')

exports.makeId = url => url.match(/[^_\W]+/g).join('').replace(/w/g, '').substring(5, 40)

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

/// argh... twitter timestamps :/
const twitterDateFomatter = user => {
  const busted = user.created_at.split(' ')
  const month = moment().month(busted[1]).format("MM")
  return moment([busted[5], month, busted[2]].join(''), "YYYYMMDD").fromNow()
}

/// argh... twitter timestamps :/
exports.ageCheck = user => {
  return twitterDateFomatter(user).includes('year') ? true : false
}

exports.yearCheck = user => {
  const momentTime = twitterDateFomatter(user)
  if(momentTime.includes('years')) {
    return Number(momentTime[0])
  }
  if(momentTime.includes('year')) {
    return 1
  }
}

