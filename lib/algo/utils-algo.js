const tweetTypes = {
  original: [],
  links: [],
  retweeted: []
}

// check the frequency of who is being retweeted    
exports.freq = data => {

  return data.reduce((obj, tweet) => {
    if (tweet.retweeted_status) {
      obj.retweeted.push(tweet.retweeted_status.user.screen_name)
    }

    else {
      obj.original.push(tweet)            
      if (tweet.entities && tweet.entities.urls[0]) {
        const url = tweet.entities.urls[0].expanded_url.split('/')[2].replace(/www./i, '')
        obj.links.push(url)
      }
    }

    return obj
  }, tweetTypes)
}


exports.makeFreqObj = (data, num) => {
  const reducedObj = data.reduce((obj, key) => {
    obj[key] = obj[key] ? ++obj[key] : obj[key] = 1
    return obj
  }, {})

  for (key in reducedObj) {
    if (reducedObj[key] < num) {
      delete reducedObj[key]
    }
  }

  return reducedObj
}

exports.totalFreqObj = obj => {
  return Object.keys(obj).reduce((total, item) => {
    return total += obj[item]
  }, 0)
}