const { firebase } = require('./config')

const arr = []

exports.checkBuffer = user => {
  
  const { screen_name } = user
  arr.push(screen_name)

  if (arr.length > 5) {
    arr.shift()
  }
  // console.log("name", screen_name)
  // console.log("ARR", arr)

  if (arr.includes(screen_name)) {
    firebase
      .ref(`twitters/${screen_name}`)
      .transaction(twitter => {
        // console.log("twitter", twitter)
        const obj = {
          tracking: false,
          timestamp: Date.now()
        }

        return twitter ? twitter : obj
      })
      
     return false 
  }

  else {
    console.log('Not in da array', true)
    return true
  }
}