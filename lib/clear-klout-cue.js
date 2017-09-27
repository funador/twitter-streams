const { firebase } = require('./config')
const { kloutExtract } = require('./klout-extract')

////////////////////////////////////////////////////////////////////////////////
// Periodically attempt to process Klouters that have been cued
////////////////////////////////////////////////////////////////////////////////

exports.clearKloutCue = () => {

  const processCue = async klouters => {
    
    const arr = Object
                  .keys(klouters)
                  .slice(0, 2)
                  .map(key => {
                    const obj = klouters[key]
                    return {
                      name: obj.name,
                      id: obj.id,
                      key
                    }
                  })

    const klouter = arr.pop()
    const { id, name, img, key } = klouter
    const processedKlouter = await kloutExtract(name, id)
   
    if (processedKlouter.statusCode == '403') {
      console.log('In cue, over Klout limit, will try at next interval')
      return
    }

    // if they have a Klout score, add to the story
    if (processedKlouter.score > 1) {

      processedKlouter.name = name
      processedKlouter.img = img
      delete processedKlouter.topics

      firebase
        .ref(`ico/${id}/retweeters/${name}`)
        .set(processedKlouter)
      
      // check if there are more to process
      if (arr.length) {

        delete klouters[key]
        processCue(klouters)

      }
    }

    // remove from cue, including non-klouters
    firebase
      .ref(`cuedKlouters/${key}`)
      .remove()
  }

  setInterval(() => { 
    
    firebase
      .ref('cuedKlouters')
      .once('value')
      .then(snap => {
        const klouters = snap.val()
        if(klouters) processCue(klouters) 
      })

  // check every 30 mins
  }, 30 * 60 * 1000)
}

