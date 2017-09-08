const { firebase } = require('./config')

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

        const sentiment = Object.keys(obj).reduce((total, id) => {
          return total += (obj[id].kloutScore * obj[id].sentiFluff.comparative)
        }, 0)

        firebase
          .ref('sentiment')
          .push([
            Date.now(),
            sentiment
          ])
      })
    }, 10000)  
}