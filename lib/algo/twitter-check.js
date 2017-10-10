const request = require('request-promise')
const moment = require('moment')

const { T, firebase } = require('../config')
const { yearCheck, dateFomatter } = require('../utils')
const { twitterAlgo } = require('./twitter-algo')
const { freq, makeFreqObj, totalFreqObj, chainedRetweets } = require('./utils-algo')

exports.twitterCheck = (screen_name, flag) => {
  
  const count = 100

  return new Promise( async (resolve, reject) => {

    try {

      // check if twitter user is being tracked in firebase
      const snap = await firebase
                          .ref(`twitters/${screen_name}`)
                          .once('value')

      const twitter = snap.val()

        if (false) { 
          resolve(twitter.tracking)
        }

        else {
           
          const query = {
            screen_name,
            count
          }

          T.get('statuses/user_timeline', query, async (err, data) => {

            if (err) {
              console.log("err or no data in twitter check", screen_name, err.message)
              return resolve(false)
            }

            if (data.length < 100 || !data) {
              return resolve(false)
            }

            const singleTweet = data[0]
            const created = Date.now()
            const userObj = {
              screen_name: singleTweet.user.screen_name,
              name: singleTweet.user.name,
              img: singleTweet.user.profile_image_url_https.replace('normal', '400x400'),
              created
            }

            if(flag == 'stream') {
              firebase
                .ref(`stream/all/${screen_name}`)
                .transaction(user => {
                  if(!user) {
                    return userObj
                  }
                })              
            }

            const checker = {
              retweets: 0,
              likes: 0,
              withoutLinks: 0,
              quotedStatus: 0
            }

            const { original, links, retweeted } = freq(data)

            const orgObj = original.reduce((obj, tweet) => {
              obj.retweets += tweet.retweet_count
              obj.likes += tweet.favorite_count
              obj.withoutLinks += tweet.entities.urls.length ? 0 : 1
              obj.quotedStatus += tweet.is_quote_status ? 1 : 0
              return obj
            }, checker)

            const originalText = original.map(tweet => tweet.text)         
            const freqRetweeted = makeFreqObj(retweeted, 4)
            const freqLink = makeFreqObj(links, 2)
            const freqText = makeFreqObj(originalText, 2)
            
            const totalRetFreq = totalFreqObj(freqRetweeted)
            const totalLinkFreq = totalFreqObj(freqLink)
            const totalTextFreq = totalFreqObj(freqText)
            const chainedRetweetsLen = chainedRetweets(retweeted)

            const freqReweetedLen = Object.keys(freqRetweeted).length
            const freqLinksLen = Object.keys(freqLink).length

            // number of tweets that are a reply to another twitter account
            const convos = data
                            .filter(tweet => tweet.in_reply_to_screen_name)
                            .length

            // check the difference between tweets 
            // too fast and furious = spammy
            const first = dateFomatter(data[0].created_at)
            const last = dateFomatter(data[data.length -1].created_at)
            const mins = Math.round(moment.duration(first.diff(last)).asMinutes())

            const { retweets, likes, withoutLinks, quotedStatus } = orgObj

            const originalLen = original.length
            const likeRatio = likes / originalLen || 0
            const retweetsRatio = retweets / originalLen || 0
            const convoRatio = convos / originalLen || 0
            
            // mins, quotedStatus, withoutLinks, freqReweetedLen, freqLinksLen, 
            // totalRetFreq, totalLinkFreq, totalTextFreq, chainedRetweetsLen, 
            // likeRatio, retweetsRatio, convoRatio

            const ranker = {
              mins, quotedStatus, withoutLinks, freqReweetedLen, freqLinksLen, 
              totalRetFreq, totalLinkFreq, totalTextFreq, chainedRetweetsLen, 
              likeRatio, retweetsRatio, convoRatio, originalLen
            }

            const sorted = {}

            Object.keys(ranker)
                  .sort()
                  .forEach(key => {
                    sorted[key] = ranker[key]
                  })

            // only run for the stream, not test data
            if(flag == 'stream') {
              const spamOrHam = twitterAlgo(sorted)               
              userObj.spamOrHam = spamOrHam
              console.log(spamOrHam, screen_name)

              // // purely for visual effects updating the DOM
              const delay = () => {
                return new Promise(resolve => { 
                  setTimeout(resolve, 1000)
                })
              }

              await delay()

              firebase
                .ref(`stream/${spamOrHam}/${screen_name}`)
                .transaction(user => {
                  if (!user) {
                    return userObj
                  }
                })
            }
             
            resolve(sorted)
          })
        }
    }
    
    catch(e) {
      console.log("caught err in twitter check ", screen_name, e)
      resolve(false)
    }
  })
}