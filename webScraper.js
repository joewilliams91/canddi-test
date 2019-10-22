const cheerio = require("cheerio");
const axios = require("axios");
var Knwl = require("knwl.js");
var knwlInstance = new Knwl("english");

let domain;
let inputEmail = process.argv[2]

if (process.argv[2] !== null) {
    domain = getURL(inputEmail);
} else {
    console.log('Please enter a valid email address');
    process.exit();
}

function getURL(email) {
    domain = email.split('@')[1];
    return domain;
}

// axios makes http request on url to obtain raw url data

const urlRequest = async (domain) => {
  const {data} = await axios.get(url);
  console.log(data)
}

urlRequest(domain)





//   knwlInstance.init(html);
//   console.log(knwlInstance.words.get('linkWordsCasesensitive'));
//   const $ = cheerio.load(html, {
//     normalizeWhitespace: true,
//     xmlMode: true,
//     decodeEntities: true,
//     withDomLvl1: true,
// });
//   knwlInstance.init($.html());
//   console.log($.html())
//   const emails = knwlInstance.get("phones");
//   console.log(emails);
// }).catch(err => {
//     console.log(err)
// })

