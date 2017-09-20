const { T, firebase } = require('./config')
const { yearCheck, dateFomatter } = require('./utils')
const { twitterAlgo } = require('./twitter-algo')
const moment = require('moment')

exports.twitterCheck = user => {
  const { screen_name } = user
  const count = 100

  return new Promise( async (resolve, reject) => {

    try {

      // check if twitter user is being tracked in firebase
      const snap = await firebase.ref(`twitters/${screen_name}`).once('value')
      const twitter = snap.val()

        if (twitter) { 
          resolve(twitter.tracking)
        }

        else {
           
          const query = {
            screen_name,
            count
          }

          T.get('statuses/user_timeline', query, (err, data) => {

            if(err || !data.length) {
              console.log("err or no data in twitter check", err)
              resolve(false)
            }

            const sources = data.reduce((obj, tweet) => {
              const source = tweet.source
              !obj[source] ? obj[source] = 1 : obj[source] ++
              return obj
            }, {})
              
            // check the frequency of who is being retweeted
            const freq = data.reduce((obj, tweet) => {
               
              if (tweet.retweeted_status) {

                const tweeter = tweet.retweeted_status.user.screen_name
                !obj[tweeter] ? obj[tweeter] = 1 : obj[tweeter] ++
              }

              else {
                obj.numOriginalTweets++ 
              }

              return obj
            }, {numOriginalTweets: 0})

            const numOriginalTweets = freq.numOriginalTweets
            delete freq.numOriginalTweets

            const frequent = Object.keys(freq).reduce((obj, key) => {
              if (freq[key] > 4) obj[key] = freq[key]
              return obj
            }, {})

            const totalFreq = Object.keys(frequent).reduce((total, twitter) => {
              return total += frequent[twitter]
            }, 0)

            const convos = data
                            .filter(tweet => tweet.in_reply_to_screen_name)
                            .map(tweet => tweet.in_reply_to_screen_name)
                            .length

            // check the difference between tweets 
            // too fast and furious = spammy
            const first = dateFomatter(data[0].created_at)
            const last = dateFomatter(data[data.length -1].created_at)
            

            const tweetTime = moment.duration(first.diff(last)).humanize()
            const unit = tweetTime.split(' ')[1]


            const spacedTime = !unit.includes('minute') 
                               && !unit.includes('hour')

            const accountAge = yearCheck(user)
            const listed_count = data[0].user.listed_count

            const ranker = {
              screen_name, accountAge, tweetTime, frequent, totalFreq,
              convos, listed_count, numOriginalTweets, sources, spacedTime
            }

            const tracking = twitterAlgo(ranker, count)
            
            const twitterer = {
              tracking,
              timestamp: Date.now()
            }

            firebase
              .ref(`twitters/${screen_name}`)
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