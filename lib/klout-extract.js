const request = require('request-promise')
const { firebase } = require('./config')
const BASE = 'http://api.klout.com/v2/'
const KEY = `key=${process.env.KLOUT_KEY}`

exports.kloutExtract = async (name, img, id) => {
  
  try {
    const snap = await firebase.ref(`klouters/${name}`).once('value')
    const klouter = snap.val()

    if (klouter) {
      if (!klouter.topics) klouter.topics = []
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
        created: Date.now()
      }

      await firebase
        .ref(`klouters/${name}`)
        .set(klouter)

      return klouter
    }
  }

  catch (e) {
    
    const nonKlouter =  {
      score: 1,
      topics: [],
      created: Date.now()
    } 

    if (e.statusCode) {
      console.log('IDDDDDDDD', id)
      if (e.statusCode == '403') {
        const cued = {
          id, name, img,
          statusCode: '403'
        }

        await firebase
          .ref('cuedKlouters')
          .push(cued)
      }

      else if (e.statusCode == '404') {
        await firebase
          .ref(`klouters/${name}`)
          .set(nonKlouter)
      }
    }

    return nonKlouter
  }
}