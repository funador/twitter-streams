const request = require('request-promise')
const BASE = 'http://api.klout.com/v2/'
const KEY = `key=${process.env.KLOUT_KEY}`
const { firebase } = require('./config')
const moment = require('moment')

const kloutExtract = async (name, id) => {
  
  try {
    const snap = await firebase.ref(`klouters/${name}`).once('value')
    const klouter = snap.val()

    if(klouter) {
      if(!klouter.topics) klouter.topics = []
      return klouter
    }

    else {
      const kloutId = await request(`${BASE}identity.json/twitter?screenName=${name}&${KEY}`)
      const id = JSON.parse(kloutId).id
      const score = await request(`${BASE}user.json/${id}/score?${KEY}`)
      const topics = await request(`${BASE}user.json/${id}/topics?${KEY}`)

      const klouter = {
        score: Math.round(JSON.parse(score).score),
        topics: JSON.parse(topics).map(topic => topic.name) || [],
        timestamp: Date.now()
      }

      await firebase
        .ref(`klouters/${name}`)
        .set(klouter)

      return klouter
    }
  }

  catch(e) {
    
    // console.log("ERR in Klout", e.statusCode)
    const nonKlouter =  {
      score: 1,
      topics: [],
      timestamp: Date.now()
    } 

    if(e.statusCode) {
      if(e.statusCode == '403') {
        const cued = {
          id, name, 
          statusCode: '403'
        }

        await firebase
          .ref('cuedKlouters')
          .push(cued)
      }

      if(e.statusCode == '404') {
        await firebase
          .ref(`klouters/${name}`)
          .set(nonKlouter)
      }
    }

    return nonKlouter
  }
}

module.exports = { kloutExtract }


