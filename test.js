let uu = require('url-unshort')()



// http://spok.al/67iq

uu.expand('http://spok.al/67iq')
  .then(url => {
    if (url) console.log(`Original url is: ${url}`);
    // no shortening service or an unknown one is used 
    else console.log('This url can\'t be expanded');
  })
  .catch(err => console.log(err));