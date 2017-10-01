const url = 'https://venturebeat.com/2017/09/29/chinas-bitcoin-market-alive-and-well-as-traders-defy-crackdown/?utm_campaign=crowdfire&utm_content=crowdfire&utm_medium=social&utm_source=twitter#743368342048669698-tw#1506844187797'
const unfluff = require('unfluff')
const request = require('request-promise')
const { firebase } = require('./config')

firebase
  .ref('cuedKlouters')
  .remove()
