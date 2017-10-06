// check the frequency of different data points
exports.freq = data => {

  const tweetTypes = {
    original: [],
    links: [],
    retweeted: []
  }

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

// Build an objject based on the frequencies above
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

exports.chainedRetweets = arr => {
  const result = arr.reduce((obj, name, i, arr) => {
    
    if(i < arr.length -1 ) {
      if(name == arr[i - 1]) {
        obj[name] ? obj[name] ++ : obj[name] = 1
        return obj
      }
    }

    return obj
  }, {})

  return Object.keys(result).filter(retweeted => result[retweeted] > 1).length
}