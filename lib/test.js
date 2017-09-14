const { T, firebase } = require('./config')

const query = {
        screen_name: 'thefunador',
        count: 50
      }

T.get('statuses/user_timeline', query, (err, tweets) => {
  const filtered = tweets.filter(tweet => {
    return tweet.in_reply_to_screen_name
  })
  console.log('filtered', filtered)
  
})



firebase
  .ref('klouters')
  .once('value')
  .then(snap => {
    const klouters = snap.val()
    // console.log("klouters", klouters)
    const distribution = Object.keys(klouters).reduce((obj, key) => {
      if(!obj[klouters[key].score]) {
        obj[klouters[key].score] = 1
      }
      else {
        obj[klouters[key].score] ++
      }
      return obj
    }, {})
    console.log(distribution)
  })