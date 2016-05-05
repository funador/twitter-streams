'use strict'

var PythonShell = require('python-shell');
// var pyshell = new PythonShell('./utils/classify.py');

module.exports = {
   classify: (ref) => {

    var tweet

    ref.child('all/imagesize').on('child_added', (snap) => {
      var tweet = snap.val()
      var id    = snap.key()

      PythonShell.run('./utils/python-classifier/classify.py', {args: [tweet.article]}, function (err, results) {
        if (err) throw err;
        console.log("----------------------");
        console.log(tweet.article.substring(0, 100))
        console.log('results: %j', results);
        console.log("----------------------");
      });
    })
  }
}
