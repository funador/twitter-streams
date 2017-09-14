const { T, firebase } = require('./config')
const { yearCheck, dateFomatter } = require('./utils')
const moment = require('moment')

exports.twitterCheck = user => {
  const { screen_name } = user
  const count = 100

  return new Promise( async (resolve, reject) => {

    try {
      const snap = await firebase.ref(`twitters/${screen_name}`).once('value')
      const twitter = snap.val()

        // check if twitter user is being tracked in firebase
        // if(twitter) {
        if(false) { 
          resolve(twitter.tracking)
        }

        else {
           
          const query = {
            screen_name,
            count
          }

          T.get('statuses/user_timeline', query, (err, data) => {

            if(err) {
              console.log("err in twitter check", err)
              reject(err)
            }

            const sources = data.reduce((obj, tweet) => {
              const source = tweet.source
              !obj[source] ? obj[source] = 1 : obj[source] ++
              return obj
            }, {})
              
            // check the frequency of who is being retweeted
            const freq = data.reduce((obj, tweet) => {
               
              if(tweet.retweeted_status) {
                const tweeter = tweet.retweeted_status.user.screen_name
                
                if(!obj[tweeter]) {
                  obj[tweeter] = 1
                }
                else {
                  obj[tweeter] ++
                }
              }

              else {
                obj.original++ 
              }

              return obj
            }, {original: 0})

            const numOriginalTweets = freq.original
            delete freq.original

            const tooFrequent = Object.keys(freq).reduce((obj, key) => {
              if(freq[key] > 4) obj[key] = freq[key]
              return obj
            }, {})

            const totalFreq = Object.keys(tooFrequent).reduce((total, twitter) => {
              return total += tooFrequent[twitter]
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
                               && !unit.includes('year')

            const accountAge = yearCheck(user)
            const listed_count = data[0].user.listed_count

            const ranker = {
              screen_name,
              accountAge,
              tweetTime,
              tooFrequent,
              totalFreq,
              convos,
              listed_count,
              numOriginalTweets
            }

            console.log('---------------------')
            console.log(sources)
            console.log(ranker)
            console.log('---------------------')

            const tracking = true
            
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