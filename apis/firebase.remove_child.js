
module.exports = {
  remove_child: (ref) => {
    ref.child('all').orderByChild("timestamp").limitToFirst(1).on('child_added', (snap) => {
      var tweet = snap.val()
      var id = snap.key()
      var cutoff = Date.now() - 60 * 60 * 1000;
      var timestamp = tweet.timestamp

      if(timestamp < cutoff){
        ref.child(`all/${id}`).remove()

        var imageSizes = ['hero', 'story', 'tweet']
        imageSizes.forEach((imageSize) => {
          ref.child(`${tweet.topic}/${imageSize}/${id}`).remove()
        })
      }
    })
  }
}
