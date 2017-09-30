const bayes = require('node-bayes')
const { firebase } = require('./config')
const shuffle = require('underscore').shuffle

let cls

const setup = async () => {
  let ham, spam
  
  await firebase
    .ref('superham')
    .once('value')
    .then(snap => ham = snap.val())

  await firebase
    .ref('superspam')
    .once('value')
    .then(snap => spam = snap.val())

  const hamArr = Object.keys(ham).map(key => ham[key])

  const spamArr = shuffle(Object.keys(spam))
                    .slice(0, hamArr.length)
                    .map(key => spam[key])

  const buildArray = (arr, tag) => {
    return arr.map(obj => {
      if(!obj.gender) obj.gender = 'null'
      return [...Object.values(obj), tag]
    })
  }

  const data = [...buildArray(hamArr, 'ham'), ...buildArray(spamArr, 'spam')]
  const columns = data[0]
  console.log(columns)

  cls = new bayes.NaiveBayes({
    columns, data, verbose: true
  })

  cls.train()
}

setup()

exports.twitterAlgo = (ranker, screen_name) => {
  console.log("SORTED", ranker)
  const answer = cls.predict(Object.values(ranker))
  console.log(answer, screen_name)
}

// remove retweets from link check