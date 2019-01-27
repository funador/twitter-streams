const { firebase } = require('../config')
const stringSimilarity = require('string-similarity')
 
let stories

const getNewTitles = () => {
  firebase
  .ref('/')
  .once('value')
  .then(snap => {
    const data = snap.val()
    delete data.tracking

    stories = Object.keys(data).reduce((obj, sport) => {
      obj[sport] = Object.keys(data[sport]).map(id => {
        return {
          title: data[sport][id].title
          count: data[sport][id].count
        }
      })
      return obj
    }, {})
    console.log(stories)
  })

}

getNewTitles()
setTimeout(getNewTitles, 60 * 1000)



module.exports = (title, topic) => {
  
  // const groups = await firebase.ref(`groupings/${topic}`)
  // console.log(stories)
  if(stories[topic]) {
    const bestMatch = stringSimilarity.findBestMatch(title, stories[topic])
    console.log('--------------------')
    console.log(title)
    console.log(bestMatch.bestMatch)
    console.log(`Good match: ${bestMatch.bestMatch.rating > 0.3}`) 
    console.log('--------------------')  
  }

  // if match is 100% then delete the story
  
}