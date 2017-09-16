const { firebaseSentiment } = require('./config')
const { firebase } = require('./config')

// console.log("EQUAL", firebase.toString() === firebaseSentiment.toString())

////////////////////////////////////////////////////////////////////////////////
// Track sentiment
////////////////////////////////////////////////////////////////////////////////
const topic = 'ico'

exports.trackSentiment = () => {

  setInterval(() => {

    firebase
      .ref(`${topic}`)
      .orderByChild('count')
      .limitToLast(25)
      .once('value')
      .then(snap => {
        const obj = snap.val()

        if(obj) {
          const sentiment = Object.keys(obj).reduce((total, id) => {
            return total += (obj[id].kloutScore * obj[id].sentiFluff.comparative)
          }, 0)

          firebaseSentiment
            .ref('/')
            .push([
              Date.now(),
              sentiment
            ])
          }
      })
    }, 10000)  
}