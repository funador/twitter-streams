var getPageRank = require('pagerank');
 
// pageRank will either be a number or null 
getPageRank('http://example.com/', function(error, pageRank) {
    console.log(error, pageRank);
});