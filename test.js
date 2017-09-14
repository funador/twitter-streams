const { firebase } = require('./config')

firebase
  .ref('klouters')
  .once('value')
  .then(snap => {
    const klouters = snap.val()
    klouters.forEach(klouter => {
      console.log(klouter.score)
    })
  })