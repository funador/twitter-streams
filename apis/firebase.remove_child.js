
module.exports = {
  remove_child: (ref) => {
    ref.child('all').orderByChild("timestamp").limitToFirst(1).on('child_added', (snap) => {
      var tweet = snap.val()
      var id = snap.key()
      var cutoff = Date.now() - 5 * 60 * 1000;
      var timestamp = tweet.timestamp
      var imageSizes = ['hero', 'story', 'tweet']
      console.log(tweet)
      console.log(id)

      if(timestamp < cutoff){
        ref.child(`all/${id}`).remove()

        imageSizes.forEach((imageSize) => {
          ref.child(`${tweet.topic}/${imageSize}/${id}`).remove()
        })
        console.log("old tweet removed", `${tweet.topic}/${id}`);
      }
      else {
        console.log("not old enough");
      }
    })
  }
}
