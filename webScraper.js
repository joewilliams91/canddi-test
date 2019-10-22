const cheerio = require("cheerio");
const axios = require("axios");
var Knwl = require("knwl.js");
var knwlInstance = new Knwl("english");

let domain;
let inputEmail = process.argv[2];

// takes domain from email address provided in CL

function getDomain(email) {
  domain = email.split("@")[1];
  return domain;
}

// creates URL that axios can work with from domain taken from email address

const createURL = domain => {
  const url = `https://www.${domain}`;
  return url;
};

// axios makes http request on url to obtain raw url data

const urlRequest = async domain => {
  const url = createURL(domain);
  const { data } = await axios.get(url);
  return data;
};

const convertToCheerio = async body => {
  const $ = await cheerio.load(body, {
    normalizeWhitespace: true,
    xmlMode: true,
    decodeEntities: true,
    withDomLvl1: true
  });

  return $;
};

// function for pulling out all anchor tags, from which phone numbers/email addresses can be extracted

const getHyperLinks = $ => {
  let hyperlinks = [];
  let anchors = $("a");
  $(anchors).each((i, anchor) => {
    hyperlinks.push($(anchor).attr("href"));
  });

  return hyperlinks;
};

// function for extracting all telephone numbers from web page

const getTelephoneNumbers = (body, links) => {
  const telephoneNumbers = [];

  links.forEach(link => {
    if (link && /tel:/.test(link)) {
      let newLink = link.split("tel:")[1];
      newLink = newLink.replace(/\s/g, "");
      newLink = newLink.replace(/^0/g, "+44");

      if (!telephoneNumbers.includes(newLink)) {
        telephoneNumbers.push(newLink);
      }
    }
  });

  return telephoneNumbers;
};

// function for extracting all email addresses from web page

const getEmailAddresses = async (body, links) => {
  const emailAddresses = [];

  const emails = await knwlInstance.get("emails");

  emails.forEach(email => {
    if (!emailAddresses.includes(email.address)) {
      emailAddresses.push(email.address);
    }
  });

  links.forEach(link => {
    if (link && /mailto:/.test(link)) {
      let newLink = link.split("mailto:")[1];

      if (!emailAddresses.includes(newLink)) {
        emailAddresses.push(newLink);
      }
    }
  });

  return emailAddresses;
};

// main function for extracting, manipulating and returning relevant data

const getData = async () => {
  const body = await urlRequest(domain);

  knwlInstance.init(body);

  const $ = await convertToCheerio(body);

  const hyperlinks = await getHyperLinks($);

  const telephoneNumbers = await getTelephoneNumbers(body, hyperlinks);

  const emailAddresses = await getEmailAddresses(body, hyperlinks);

  console.log(emailAddresses);
};

if (process.argv[2] !== null) {
  domain = getDomain(inputEmail);

  getData();
} else {
  console.log("Please enter a valid email address");

  process.exit();
}

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
