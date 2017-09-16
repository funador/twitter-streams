const { firebase } = require('./config')
const { kloutExtract } = require('./klout-extract')

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

      const { id, name, key } = klouter

      console.log('------------------')
      console.log("ARR TOP", arr)
      console.log('------------------')
      
      const processedKlouter = await kloutExtract(name, id)
     
      if(processedKlouter.statusCode == '403') {
        console.log('In cue, over Klout limit, try at next interval')
        return
      }

      // if they have a Klout score, add to the story
      if(processedKlouter.score > 1) {
        // remove klouter from cue
        // add klouter to story
        console.log('------------------')
        console.log(processedKlouter)
        console.log('------------------')
        console.log('------------------')
        console.log(id, name, key)
        console.log('------------------')

        firebase
          .ref(`ico/${id}/retweeters/${name}`)
          .set(processedKlouter)
        // check if there are more to process

        if(arr.length) {
          console.log('------------------')
          console.log("ARR TOP", arr)
          console.log('------------------')
          processCue(arr)
        }
      }

      // remove from cue, including non-klouters
      firebase
        .ref(`cuedKlouters/${key}`)
        .remove()

    }

    // setInterval(() => { 
      firebase
        .ref('cuedKlouters')
        .once('value')
        .then(async snap => {
          const klouters = snap.val()
          if(klouters) processCue(klouters) 
        })
  // check every 30 mins
  // }, 30 * 60 * 1000)
}

