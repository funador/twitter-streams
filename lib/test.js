const handPicked = ['murkt', 'will_moriarty', 'TefoMohapi', 'KIco47', 'abolibibelot', 'Karachi_Post', 'JonhaRichman', 'thomaspower', '_IcoNicSynergy_', 'Lara_Miller', 'SamRusani', 'overdrev', 'boydcohen', 'seandotau', 'SatoshiLite', 'brian_armstrong', 'iam_preethi', 'VitalikButerin', 'naval', 'ebryn', 'aantonop', 'rogerkver', 'stephantual', 'MackFlavelle', 'theTrendyTechie', 'laurashin', 'ErikVoorhees', 'petertoddbtc', 'gavinandresen', 'Melt_Dem', 'gavofyork', 'jonmatonis', 'jb55', 'TuurDemeester', 'hernzzzzzz', '_zouhir', 'CharlieShrem', 'jonwaller', 'barrysilbert', 'dsarango', 'BenMorganIO', 'brucefenton', 'haydentiff']

const { firebase } = require('./config')
const { twitterCheck } = require('./twitter-check')

firebase
  .ref('spam')
  .once('value')
  .then(snap => {
    const obj = snap.val()
    const spammers = Object.keys(obj)
    
    const checkUser = async arr => {
      let user = arr.pop()
      
      userObj = await twitterCheck(user)

      await firebase
              .ref(`superspam/${user}`)
              .set(userObj)
      
      if(arr.length) {
        console.log("remaining:", arr.length)
        setTimeout(() => {
          checkUser(arr)
        }, 5000)
      }
    }
    
    checkUser(spammers)
  })
  


