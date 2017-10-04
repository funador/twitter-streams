const request = require('request-promise')
const moment = require('moment')

const { T, firebase } = require('../config')
const { yearCheck, dateFomatter } = require('../utils')
const { twitterAlgo } = require('./twitter-algo')
const { checkOriginalContent } = require('./check-original-content')
const { freq, makeFreqObj } = require('./algo/utils')

exports.twitterCheck = screen_name => {
  
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

            const singleTweet = data[0]
            const created = Date.now()
            const userObj = {
              screen_name: singleTweet.user.screen_name,
              name: singleTweet.user.name,
              img: singleTweet.user.profile_image_url_https.replace('normal', '400x400'),
              created
            }

            firebase
              .ref(`stream/all/${singleTweet.user.screen_name}`)
              .transaction(user => {
                if(!user) {
                  return userObj
                }
              })

            if (err) {
              console.log("err or no data in twitter check", screen_name, err.message)
              return resolve(false)
            }

            if (data.length < 100) {
              return resolve(false)
            }

            
            
            

            const checker = {
              retweets: 0,
              likes: 0,
              withoutLinks: 0,
              quotedStatus: 0
            }

            const orgObj = freq.original.reduce((obj, tweet) => {
              obj.retweets += tweet.retweet_count
              obj.likes += tweet.favorite_count
              obj.withoutLinks += tweet.entities.urls.length ? 0 : 1
              obj.quotedStatus += tweet.is_quote_status ? 1 : 0
              return obj
            }, checker)

            

            const totalFreqObj = obj => {
              return Object.keys(obj).reduce((total, twitter) => {
                return total += obj[twitter]
              }, 0)
            }

            const freqRetweeted = makeFreqObj(freq.retweeted, 4)
            const freqLink = makeFreqObj(freq.links, 2)
            const totalRetFreq = totalFreqObj(freqRetweeted)
            const totalLinkFreq = totalFreqObj(freqLink)
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

            // console.log('freqReweetedLen', freqReweetedLen)
            // console.log('freqLinksLen', freqLinksLen)

            const { retweets, likes, withoutLinks, quotedStatus } = orgObj

            // console.log('starting')
            console.log(singleTweet)


            // 
            const ranker = {
              convos, likes, mins, quotedStatus, retweets, withoutLinks,
              freqReweetedLen, freqLinksLen, totalRetFreq, totalLinkFreq
            }

            const sorted = {}

            Object.keys(ranker)
              .sort()
              .forEach(key => {
                  sorted[key] = ranker[key]
               });

            const spamOrHam = twitterAlgo(sorted)

            console.log(screen_name, spamOrHam)

            userObj.spamOrHam = spamOrHam

            // purely for visual effects updating the DOM
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