const request = require('request-promise')
const BASE = 'http://api.klout.com/v2/'
const KEY = `key=${process.env.KLOUT_KEY}`
const { firebase } = require('./config')
const moment = require('moment')

const kloutExtract = async name => {
  
  try {
    const snap = await firebase.ref(`klouters/${name}`).once('value')
    const klouter = snap.val()

    if(klouter) {
      return klouter
    }

    else {
      // pull the reference from firebase
      const kloutId = await request(`${BASE}identity.json/twitter?screenName=${name}&${KEY}`)
      const id = JSON.parse(kloutId).id
      const score = await request(`${BASE}user.json/${id}/score?${KEY}`)
      const topics = await request(`${BASE}user.json/${id}/topics?${KEY}`)
      // const influence = await request(`${BASE}user.json/${id}/influence?${KEY}`)

      const klouter = {
        score: Math.round(JSON.parse(score).score),
        topics: JSON.parse(topics).map(topic => topic.name),
        influencers: JSON.parse(influence).myInfluencers.map(person => person.entity.payload.nick),
        influencees: JSON.parse(influence).myInfluencees.map(person => person.entity.payload.nick),
        timestamp: Date.now()
      }

      await firebase
        .ref(`klouters/${name}`)
        .set(klouter)

      return klouter
    }
  }

  catch(e) {
    // if 403
      // add klouters to a cue to be processed later?
    // if 404 track the user as well
      // but with empty totals
    console.log("ERR in Klout", e.statusCode)

    const nonKlouter =  {
      score: 1,
      topics: [],
      inlfuencers: [],
      influencees: [],
      timestamp: Date.now()
    } 

    if(e.statusCode === '404') {
      await firebase
          .ref(`klouters/${name}`)
          .set(nonKlouter)
    }

    return nonKlouter
  }
}

module.exports = { kloutExtract }


