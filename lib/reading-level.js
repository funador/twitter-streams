const syllable = require('syllable')
const flesch = require('flesch')
const Tokenizer = require('sentence-tokenizer')

const readingLevel = text => {

  const tokenizer = new Tokenizer('Chuck')
  tokenizer.setEntry(text)
  
  const sentences = tokenizer.getSentences()
  
  const tracker = {
    syllables: 0,
    words: 0
  }

  const counts = sentences.reduce((obj, sentence) => {
    
    const words = sentence.replace(/[^\w\s]|_/g, "").replace(/\s+/g, " ").split(' ')
    obj.words += words.length
    
    obj.syllables += words.reduce((total, word) => {
      return total += syllable(word)
    }, 0)

    return obj 
  }, tracker)

  const first = counts.words / sentences.length
  const second = counts.syllables / counts.words
  const level = 0.39 * first + 11.8 * second - 15.59
  const score = isNaN(level) ? 0 : level
  console.log("SCORE!!!", Math.round(score))
  return Math.round(score)
}

module.exports = { readingLevel }