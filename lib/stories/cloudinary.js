const { cloudinary } = require('../config')

console.log(cloudinary)

module.exports = (image, resize) => {
  return new Promise((resolve, reject) => {
    cloudinary.v2.uploader.upload(image, { eager: [resize] }, (err, res) => {
      if(res) return resolve(res.eager[0].secure_url)
      resolve()
    }) 
  })
}