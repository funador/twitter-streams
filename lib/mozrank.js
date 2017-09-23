const { Mozscape } = require('mozscape')

const moz = new Mozscape(process.env.MOZ_ID, process.env.MOZ_SECRET)

exports.mozrank = url => {
  
  return new Promise((resolve, reject) => {
    moz.urlMetrics(url, ['domain_mozRank', 'domain_authority'], (err, res) => {
      if (err) {
        console.log("err in Moz")
        resolve(null)
      } 
      
      if(res) {
         const result = {
          mozrank: Math.round(res.pmrp),
          authority: Math.round(res.pda)
        }
        
        resolve(result)
      }

      resolve(null)
    })
  })  
}

