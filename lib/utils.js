exports.makeId = url => url.match(/[^_\W]+/g).join('').replace(/w/g, '').substring(5, 40)

exports.linkCheck = tweet => tweet.retweeted_status && tweet.entities.urls[0] && tweet.entities.urls[0].expanded_url

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
