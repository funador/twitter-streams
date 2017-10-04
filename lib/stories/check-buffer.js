const { firebase } = require('../config')

const arr = []

////////////////////////////////////////////////////////////////////////////////
// Check to see if retweeter, has recently retweeted into this stream
// Avoid spammy accounts which frequently tweet in bursts
////////////////////////////////////////////////////////////////////////////////

exports.checkBuffer = user => {
  
  return new Promise((resolve, reject) => {

    const { screen_name } = user

    if (arr.length > 20) {
      arr.shift()
    }

    if (arr.includes(screen_name)) {
      
      firebase
        .ref(`twitters/${screen_name}`)
        .transaction(twitter => {
          
          const obj = {
            tracking: false,
            created: Date.now()
          }

          resolve(false)
          return twitter ? twitter : obj
        })
    }

    else {
      resolve(true)
    }

    arr.push(screen_name)

  })
}