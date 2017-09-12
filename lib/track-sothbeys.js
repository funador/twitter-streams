const { firebase } = require('./config')
const request = require('request-promise')
const moment = require('moment')

////////////////////////////////////////////////////////////////////////////////
// Track Sothbeys stock price
////////////////////////////////////////////////////////////////////////////////

exports.trackSothbeys = async () => {
  const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=BID&outputsize=full&apikey=${process.env.ALPHA_KEY}`
  
  let stockData

  try {
    const data = JSON.parse(await request(url))
    stockData = Object.keys(data['Time Series (Daily)']).map(date => (
      [
        Number(moment(date, 'YYYY-MM-DD').format('x')),
        Number(data['Time Series (Daily)'][date]['4. close'])
      ]
    ))

    firebase
     .ref('sothebys')
     .set(stockData)

  }

  catch(e) {
    console.log("Sothebys error", e)
  }
}