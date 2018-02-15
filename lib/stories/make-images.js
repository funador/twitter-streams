const size = require('request-image-size')
const { firebase, cloudinary, resizeHero, resizeThumb } = require('../config')

module.exports = async (image, topic, id) => {

  //////////////////////////////////////////////////////////////////////////////
  // makeImages creates the appropriate images on Cloudinary for the design
  //////////////////////////////////////////////////////////////////////////////

  let heroImg = 'no-image', thumbnailImg, displaySize

  try {

    // Get the dimensions of the image
    const dimensions = await size(image)

    // Check if the dimensions are big enough for a hero image
    const heroCheck = dimensions.width >= 900 && dimensions.height >= 500
    
    // Make a thumbnail image regardless
    thumbnailImg = await cloudinary(image, resizeThumb)  

    // Is it big enough to be a hero?
    if (heroCheck) {

      // Make the hero image and then set displaySize to 'hero'
      heroImg = await cloudinary(image, resizeHero)
      displaySize = 'hero'
    }

    // Otherwise set the flag to 'thumbnail'
    else {
      displaySize = 'thumbnail'
    } 

    await firebase
      .ref(`${topic}/${id}`)
      .update({heroImg, thumbnailImg, displaySize})

  }
  catch(e) {}
}