const rp = require('request-promise')
const BASE = 'http://api.klout.com/v2/'
const KEY = `key=${process.env.KLOUT_KEY}`

const kloutExtract = async name => {
  const klout = {}
  try {
    const kloutId = await rp(`${BASE}identity.json/twitter?screenName=${name}&${KEY}`)
    const id = JSON.parse(kloutId).id
    const score = await rp(`${BASE}user.json/${id}/score?${KEY}`)
    const topics = await rp(`${BASE}user.json/${id}/topics?${KEY}`)
    const influence = await rp(`${BASE}user.json/${id}/influence?${KEY}`)
    klout.score = Math.round(JSON.parse(score).score)
    klout.topics = JSON.parse(topics).map(topic => topic.name)
    klout.influencers = JSON.parse(influence).myInfluencers.map(person => person.entity.payload.nick)
    klout.influencees = JSON.parse(influence).myInfluencees.map(person => person.entity.payload.nick)
    return klout
  }
  catch(e) {
    console.log("error in Klout")
  }
}

module.exports = { kloutExtract }