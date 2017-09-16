exports.twitterAlgo = (obj, count) => {
  

  let points = 0
  points += obj.accountAge / 2

  if(obj.totalFreq > 60) {
    points -= 2
  }

  else if(obj.totalFreq > 50) {
    points--
  }

  if(Object.keys(obj.sources) > 1 || obj.listed_count) {
    points++
  }

  const convoPercentage = obj.convos / count
  const originalPercentage = obj.numOriginalTweets / count

  return true
}