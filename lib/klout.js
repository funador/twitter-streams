const rp = require('request-promise')
const BASE = 'http://api.klout.com/v2/'
const KEY = `key=${process.env.KLOUT_KEY}`

const kloutExtract = async name => {
  
  try {
    const kloutId = await rp(`${BASE}identity.json/twitter?screenName=${name}&${KEY}`)
    const id = JSON.parse(kloutId).id
    const score = await rp(`${BASE}user.json/${id}/score?${KEY}`)
    const topics = await rp(`${BASE}user.json/${id}/topics?${KEY}`)
    const influence = await rp(`${BASE}user.json/${id}/influence?${KEY}`)
    
    return {
      score: Math.round(JSON.parse(score).score),
      topics: JSON.parse(topics).map(topic => topic.name),
      influencers: JSON.parse(influence).myInfluencers.map(person => person.entity.payload.nick),
      influencees: JSON.parse(influence).myInfluencees.map(person => person.entity.payload.nick)
    }
  }

  catch(e) {
    console.log("--------------- error in Klout", e.statusCode)
    return {
      score: 1,
      topics: [],
      inlfuencers: [],
      influencees: []
    } 
  }
}

module.exports = { kloutExtract }