const { firebase } = require('../config')

const handPicked = ['murkt', 'will_moriarty', 'TefoMohapi', 'KIco47', 'abolibibelot', 'Karachi_Post', 'JonhaRichman', 'thomaspower', '_IcoNicSynergy_', 'Lara_Miller', 'SamRusani', 'overdrev', 'boydcohen', 'seandotau', 'SatoshiLite', 'brian_armstrong', 'iam_preethi', 'VitalikButerin', 'naval', 'ebryn', 'aantonop', 'rogerkver', 'stephantual', 'MackFlavelle', 'theTrendyTechie', 'laurashin', 'ErikVoorhees', 'petertoddbtc', 'gavinandresen', 'Melt_Dem', 'gavofyork', 'jonmatonis', 'jb55', 'TuurDemeester', 'hernzzzzzz', '_zouhir', 'CharlieShrem', 'jonwaller', 'barrysilbert', 'dsarango', 'BenMorganIO', 'brucefenton', 'haydentiff']

const handPicked2 = ['breitwoman', 'arthurb', 'austinhill', 'ethereumJoseph', 'stephantual',
'nicksdjohnson', 'jeffehh', 'Kitchsan', 'peter_szilagyi', 'leashless', 'trentmc0',
'vrde', 'jilliancyork', 'sherminvo', 'ninsie3', 'gmcmullen', 'doriantaylor', 'gavofyork',
'avsa', 'feindura', 'TaylorGerring', 'BobSummerwill', 'MihaiAlisie', 'hudsonjameson',
'JohnLilic', 'edhesse79', 'wmougayar', 'ameetshah', 'jdh', 'jeremysliew', 'ataussig',
'parulia', 'jjacobs22', 'arifj', 'Nik_Quinn', 'jbrowder1', 'joshypants', 'BitCoinSusan',
'sarahkoebel', 'kimbal', 'crystalrose', 'DBrozeLiveFree', 'PeterSchiff', 'christinatobin',
'HerveTourpe', 'sonjadav', 'bmann', 'HelgeSeetzen', 'IlianaOV', 'andreimpop', 'JordanMenashy',
'nielmclaren', 'adamjsaint', 'davemmett', 'mattfriesen', 'shanlynm', 'saraheadler',
'sarah_edo', 'kentcdodds', 'mxstbr', 'acdlite', '_developit', 'nikgraf', 'ryyppy',
'jdalton', 'cowboy', 'rmurphey', 'SlexAxton', 'thedesirina', 'mathias', 'markdalgleish',
'davidbaron', 'DavidKPiano', 'stubbornella', 'rem', 'satya164', 'HugoGiraudel', 'WalterStephanie',
'armst', 'shawnjan8', 'escapist', 'thedaniel', 'pea53', 'aniero', 'scottjg', 'PakwitD',
'5chdn', 'BerserkMogul', 'CacheBoi', 'ChaseTheTruth', 'Cryptopathic', 'Datarella', 'Dr_Bonehead',
'FmFrancoise', 'Jareeed7', 'MisterCh0c', 'Neil_BIM', 'RobinBascom', 'SegevLaw', 
'Tanzeel_Akhtar', 'TarakRindani', 'TechnoL0g', 'WadsworthJason', 'WodAnzu', 'austinhill',
'bitxbitxbitcoin', 'borengokinga', 'chcolleran', 'chrisamccoy', 'chriswilson_ss',
'danielcawrey', 'denkawet', 'dghughes62', 'hankeh', 'jasonthomasmba', 'jillwill01', 'll88891',
'marketcalls_', 'mayazi', 'ofnumbers', 'nandubatchu', 'phildaian', 'rhcm123', 'shamanroger',
'sn0m0ns', 'thechaz', 'werdelin', 'wonsun_catarina', 'x_slug_x', 'intolerabili']

const peepsToFollow = ['WolfOfPoloniex']

const joinedArr = [... new Set([...handPicked, ...handPicked2])]


// joinedArr.forEach(pick => {
//     firebase
//       .ref(`ham/${pick}`)  
//       .set({pick})
// })