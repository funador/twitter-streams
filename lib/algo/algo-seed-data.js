const { firebase } = require('../config')
const { twitterCheck } = require('./twitter-check')
const shuffle = require('underscore').shuffle
  
const updateData = type => {
  firebase
    .ref(type)
    .once('value')
    .then(async snap => {

      const obj = snap.val()
      const fbArr = shuffle([...Object.keys(obj)]).slice(0, 200)
      
      await firebase.ref(`super${type}`).remove()

      const checkUser = async arr => {
        let user = arr.pop()
        
        userObj = await twitterCheck(user)

        if(userObj) {
          await firebase
                .ref(`super${type}/${user}`)
                .set(userObj)  
        }
        
        if(arr.length) {
          console.log(`remaining for ${type}: ${arr.length}`)
          checkUser(arr)
        }
        else {
          console.log(`${type} all done`)
        }
      }
      
      checkUser(fbArr)
    })
}

['ham', 'spam', 'spammer'].forEach(type => {
  updateData(type)
})


