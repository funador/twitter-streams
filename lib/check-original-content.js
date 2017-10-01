const { T, firebase } = require('./config')
const ss = require('string-similarity')
const fsm = require('fuzzy-string-matching')
const unfluff = require('unfluff')
const request = require('request-promise')
const uu = require('url-unshort')()
const { shorteners } = require('./config')
const { cleanText } = require('./utils')
uu.add(shorteners)

exports.checkOriginalContent = (data, screen_name, lang, spamOHam) => {
  return new Promise((resolve, reject) => {

    const count = 0
    data.forEach(async (tweet, i) => {

      if (!tweet.retweeted_status && tweet.entities && tweet.entities.urls[0]) {
        const expandedUrl = tweet.entities.urls[0].expanded_url

        let uuexpand
        try {
          
          uuexpand = await uu.expand(expandedUrl)
          
          if (uuexpand) {
            const html = await request(uuexpand)
            const unfluffed = await unfluff(html)
            const types = tweet.entities

            let str = cleanText(tweet.text)
            str = str.replace(/#/g, '')
            str = str.replace(/@/g, '')
            str = str.replace('...', '')
            Object.keys(types).forEach(type => {
              if (type == 'urls') {
                urls = types[type]
                urls.forEach(url => {
                  str = str.replace(url.url, '')
                })
              }
            })
            
            // console.log('---------------------------')
            // console.log(str)
            const fluffed = cleanText(unfluffed.title.replace('...', ''))
            // console.log(fluffed)
            const match = ss.compareTwoStrings(str.slice(0, fluffed.length), fluffed)
            // console.log("org match", match)  
            // console.log('---------------------------')

            if(match > 0.8) count++
            if(i == 99) {
              resolve(count)
            }

          }
        }
        catch(e) {
          // console.error("EXPAND ERR", e.message)
        }

      }
      else {
        resolve(count)
      }
    })
  })
}