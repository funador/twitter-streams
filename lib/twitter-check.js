const request = require('request-promise')
const moment = require('moment')

const { T, firebase } = require('./config')
const { yearCheck, dateFomatter } = require('./utils')
const { twitterAlgo } = require('./twitter-algo')


exports.twitterCheck = screen_name => {
  
  // const { screen_name } = user
  const count = 100

  return new Promise( async (resolve, reject) => {

    try {

      // check if twitter user is being tracked in firebase
      const snap = await firebase.ref(`twitters/${screen_name}`).once('value')
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

            if(err) {
              console.log("err or no data in twitter check", err)
              return resolve(false)
            }

            const singleTweet = data[0]
            
            let {
              followers_count, friends_count, statuses_count, lang, verified,
              favourites_count, url, description, has_extended_profile, 
              default_profile_image, listed_count
            } 
            = singleTweet.user

            // count up the total numbers in the screen name
            // more nums = more spammy
            const numsInName = screen_name
                                .split('')
                                .reduce((total, char) => {
                                  return !isNaN(char) ? ++total : total
                                }, 0)

            // basic analytics on the profile description 
            const numAtsDesc = description.split("@").length - 1
            const numHashDesc = description.split("#").length - 1
            description = description ? 1 : 0
            url = url ? 1 : 0

            // number of platforms the tweeter has used to tweet from
            const sources = Object.keys(data.reduce((obj, tweet) => {
              const source = tweet.source
              !obj[source] ? obj[source] = 1 : obj[source]++
              return obj
            }, {})).length
              
            // check the frequency of who is being retweeted
            const freq = data.reduce((obj, tweet) => {
               
              if (tweet.retweeted_status) {

                const tweeter = tweet.retweeted_status.user.screen_name
                !obj[tweeter] ? obj[tweeter] = 1 : obj[tweeter]++
              }

              else {
                obj.originalTweets.push(tweet)
              }

              return obj
            }, {originalTweets: []})

            const originalTweets = freq.originalTweets
            const numOriginalTweets = originalTweets.length
            delete freq.originalTweets

            const checker = {
              retweets: 0,
              likes: 0,
              withoutLinks: 0,
              numHash: 0,
              numAts: 0,
              quotedStatus: 0,
              langMatch: 0
            }

            const orgObj = originalTweets.reduce((obj, tweet) => {
              obj.retweets += tweet.retweet_count
              obj.likes += tweet.favorite_count
              obj.numHash += tweet.text.split("#").length - 1
              obj.numAts += tweet.text.split("@").length - 1
              obj.withoutLinks += tweet.entities.urls.length ? 0 : 1
              obj.quotedStatus += tweet.is_quote_status ? 1 : 0
              obj.langMatch += tweet.lang == tweet.user.lang ? 1 : 0
              return obj
            }, checker)

            const frequent = Object.keys(freq).reduce((obj, key) => {
              if (freq[key] > 4) obj[key] = freq[key]
              return obj
            }, {})

            const totalFreq = Object.keys(frequent).reduce((total, twitter) => {
              return total += frequent[twitter]
            }, 0)

            // number of tweets that are a reply to another twitter account
            const convos = data
                            .filter(tweet => tweet.in_reply_to_screen_name)
                            .map(tweet => tweet.in_reply_to_screen_name)
                            .length

            // check the difference between tweets 
            // too fast and furious = spammy
            const first = dateFomatter(data[0].created_at)
            const last = dateFomatter(data[data.length -1].created_at)
            const mins = Math.round(moment.duration(first.diff(last)).asMinutes())

            

            const frequentLen = frequent 
                                  ? Object.keys(frequent).length
                                  : 0

            const imgUrl = singleTweet.user.profile_image_url_https.replace('normal', '400x400')
            const base = 'https://api.kairos.com/v2/media?timeout=60?source='

            const options = {
                uri: base + imgUrl,
                headers: {
                    'app_id': process.env.KAIROS_ID,
                    'app_key': process.env.KAIROS_KEY
                },
                method: 'POST',
                json: true 
            }

            let res = await request(options)

            res = res.frames  

            let gender = 'null'

            if (res && res[0] && res[0].people[0]) {
              gender = res[0].people[0].demographics.gender
            }

            const accountAge = yearCheck(singleTweet.user)
            
            const created = Date.now()
            
            const {
              retweets, likes, withoutLinks, numHash, numAts, quotedStatus,
              langMatch
            }
            = orgObj

            // add all the other thngs here
            const ranker = {
              accountAge, mins, frequentLen, totalFreq, gender,
              convos, listed_count, numOriginalTweets, sources, retweets, likes, 
              withoutLinks, numHash, numAts, quotedStatus, langMatch,
              numAtsDesc, numHashDesc, description, numsInName, 
              followers_count, friends_count, statuses_count, lang, verified,
              favourites_count, url, has_extended_profile, 
              default_profile_image, listed_count
            }

            const sorted = {}

            Object.keys(ranker)
              .sort()
              .forEach(function(v, i) {
                  sorted[v] == ranker[v]
               });

            // console.log(ranker)

            // firebase.ref(`hammers/${screen_name}`)
            //     .set(ranker)

            // firebase.ref(`hammmers`).remove()

            twitterAlgo(sorted, screen_name)
            // const tracking = true
            
            // const twitterer = {
            //   tracking,
            //   created: Date.now()
            // }

            // firebase
            //   .ref(`twitters/${screen_name}`)
            //   .set(twitterer)
            
            resolve(true)
          })
        }
    }
    
    catch(e) {
      console.log("caught err in twitter check ", e)
    }
  })
}