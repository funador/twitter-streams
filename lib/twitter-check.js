const { T, firebase } = require('./config')
const { yearCheck } = require('./utils')

exports.twitterCheck = user => {
  const { screen_name } = user

  return new Promise( async (resolve, reject) => {

    try {
      const snap = await firebase.ref(`twitter/${screen_name}`).once('value')
      const twitter = snap.val()

      // check if twitter user is being tracked in firebase
      if(twitter) {
         resolve(twitter.tracking)
      }

      else {
         
        const query = {
          screen_name,
          count: 20
        }

        T.get('statuses/user_timeline', query, (err, data) => {
          if(err) {
            console.log("err in twitter check", err)
            reject(err)
          }

          const originalTweets = data.reduce((arr, tweet) => {
            if(tweet.retweeted_status) {
              return arr  
            }
            else {
              arr.push('+')
              return arr
            }
          }, []).length

          const years = yearCheck(user)
          
          const tracking = years && originalTweets ? true : false
          
          const twitterer = {
            tracking,
            timestamp: Date.now()
          }

          firebase
            .ref(`twitter/${screen_name}`)
            .set(twitterer)
        
          resolve(tracking)
        })
      }
    }
    catch(e) {
      console.log("caught err in twitter check ", e)
    }
  })
}