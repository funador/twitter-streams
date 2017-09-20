const syllable = require('syllable')
const Tokenizer = require('sentence-tokenizer')

const readingLevel = (text, full) => {

  const tokenizer = new Tokenizer('Chuck')
  tokenizer.setEntry(text)
  
  const sentences = tokenizer.getSentences()
  
  const tracker = {
    syllables: 0,
    words: 0
  }

  const counts = sentences.reduce((obj, sentence) => {
    
    // strip all puncuation from the sentences
    const words = sentence.replace(/[^\w\s]|_/g, "").replace(/\s+/g, " ").split(' ')
    obj.words += words.length
    
    // add in all the sullables
    obj.syllables += words.reduce((total, word) => {
      return total += syllable(word)
    }, 0)

    return obj

  }, tracker)

  // rewrite to an object
  const obj = {
    sentences: sentences.length,
    words: counts.words,
    syllables: counts.syllables
  }

  const first = counts.words / sentences.length
  const second = counts.syllables / counts.words
  obj.full = 0.39 * first + 11.8 * second - 15.59
  obj.rounded  = Math.round(isNaN(level) ? NaN : level)

  if(obj.rounded == Nan) {
    obj.error = 'Either no sentences or words, returning NaN'
  }

  if(full === 'full') {
    return obj
  }

  return obj.rounded
}

module.exports = { readingLevel }