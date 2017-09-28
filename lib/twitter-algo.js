exports.twitterAlgo = (obj, count) => {
  
  console.log("obj", obj)

  if(!obj.numOriginalTweets || obj.totalFreq > 70 || !obj.spacedTime) {
    return false
  }

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