// put a timestamp on the scores to erase after two weeks
// set timeout that makes a ref request then on success call back:
//  = removes from cue
//  = add to score

module.exports = {
  cue: (ref, screen_name) => {
    // data structure => id: {score: 42}
    // if no snap, call klout
    // if snap, add to tweetObj
  }
}
