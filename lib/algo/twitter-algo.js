const bayes = require('node-bayes')
const { firebase } = require('../config')
const { shuffle } = require('underscore')

let cls

firebase.ref('cuedKlouters').remove()

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
    .ref('supertest')
    .once('value')
    .then(snap => test = snap.val())

  const len = Object.keys(ham).length

  const fbToArray = obj => shuffle(Object.keys(obj))
                            .slice(0, len)
                            .map(key => obj[key])


  const hamArr = fbToArray(ham)
  const spamArr = fbToArray(spam)
  const testArr = fbToArray(test)

  const reducer = arr => arr.reduce((total, twitter) => {
    return total += twitter.originalLen
  }, 0) / arr.length
  
  // mins, quotedStatus, withoutLinks, freqReweetedLen, freqLinksLen, 
  // totalRetFreq, totalLinkFreq, totalTextFreq, chainedRetweetsLen, 
  // likeRatio, retweetsRatio, convoRatio, originalLen

  console.log('-----------------------')
  console.log(reducer(hamArr))
  console.log(reducer(spamArr))
  console.log(reducer(testArr))
  console.log('-----------------------')

  const buildArray = (arr, tag) => 
    arr.map(obj => [...Object.values(obj), tag])

  const data = [...buildArray(hamArr, 'ham'), ...buildArray(spamArr, 'spam')]
  const columns = [...Object.keys(spamArr[0]), 'tag']

  cls = new bayes.NaiveBayes({
    columns, data, verbose: true
  })

  cls.train()
}

setup()

exports.twitterAlgo = (ranker, screen_name) => 
  cls.predict(Object.values(ranker)).answer
