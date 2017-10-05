const bayes = require('node-bayes')
const { firebase } = require('../config')
const shuffle = require('underscore').shuffle

let cls

const setup = async () => {
  let ham, spam, test
  
  await firebase
    .ref('superham')
    .once('value')
    .then(snap => ham = snap.val())

  await firebase
    .ref('superspam')
    .once('value')
    .then(snap => spam = snap.val())

  await firebase
    .ref('superspammer')
    .once('value')
    .then(snap => test = snap.val())

  const hamArr = Object.keys(ham).map(key => ham[key])

  const spamArr = shuffle(Object.keys(spam))
                    .slice(0, hamArr.length)
                    .map(key => spam[key]) 

  const testArr = shuffle(Object.keys(test))
                    .slice(0, hamArr.length)
                    .map(key => test[key]) 

  const reducer = arr => {
    return arr.reduce((total, twitter) => {
      return total += twitter.convos
    }, 0) / arr.length
  }

  // convos, likes, mins, quotedStatus, retweets, withoutLinks,
  // freqReweetedLen, freqLinksLen, totalRetFreq, totalLinkFreq,
  // totalTextFreq, chainedRetweetsLen

  // console.log('-----------------------')
  // console.log(reducer(hamArr))
  // console.log(reducer(spamArr))
  // console.log(reducer(testArr))
  // console.log('-----------------------')

  const buildArray = (arr, tag) => {
    return arr.map(obj => {
      return [...Object.values(obj), tag]
    })
  }

  const data = [...buildArray(hamArr, 'ham'), ...buildArray(spamArr, 'spam')]
  const columns = [...Object.keys(spamArr[0]), 'tag']

  cls = new bayes.NaiveBayes({
    columns, data, verbose: true
  })

  cls.train()
}

setup()

exports.twitterAlgo = (ranker, screen_name) => {
  const answer = cls.predict(Object.values(ranker))
  return answer.answer
}

// get freq + count of accounts and links
// ratio of likes/retweets per original tweet and followers
// convos ratio of original
// run credibility on retweeters/likers (Ham/Spam ratio?)
// basic filter to remove accounts before running ham/spam
// number of tweets where lang is different to user lang
// check for interactions per tweet
// redo the sample arrays