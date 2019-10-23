const cheerio = require("cheerio");
const axios = require("axios");
var Knwl = require("knwl.js");
var knwlInstance = new Knwl("english");

knwlInstance.register("phones", require("./utils/phones"));
knwlInstance.register("places", require("./utils/places"));

// takes domain from email address provided in CL

function getDomain(email) {
  const domain = email.split("@")[1];
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

// create cheerio parsed body with which to generate knwl instance

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

// function with which to extract any links to potentially relevant web addresses

const getLinks = links => {
  let extLinks = [];
  links.forEach(link => {
    if (link && /^https:/.test(link)) {
      if (!extLinks.includes(link)) {
        extLinks.push(link);
      }
    }
  });

  return extLinks;
};

// function for extracting all telephone numbers from web page

const getTelephoneNumbers = async links => {
  let telephoneNumbers = [];

  telephoneNumbers = await knwlInstance.get("phones");

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

const getEmailAddresses = async links => {
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

// function to obtain accurate address using business name and postcode

const getAddress = async (domain, postcode) => {
  const { data } = await axios.get(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${domain}+${postcode}&key=AIzaSyA0NPRN93V8yRyOeg4IPwPuy-qQAXDBf2Q`
  );

  const { formatted_address } = data.results[0];

  return formatted_address;
};

// function for if the places plugin returns multiple postcodes (doesn't seem to make too much difference with the google api, as this will often return the correct address based on the business name alone, ignoring the postcode, but I thought it would be good for the sake of thoroughness)

const getAddresses = async (domain, postcodes) => {
  let addresses = [];

  postcodes.forEach(postcode => {
    addresses.push(getAddress(domain, postcode));
  });

  if (addresses.length === postcodes.length) {
    const allAddresses = Promise.all(addresses);
    return allAddresses;
  }
};


// still work in progress; neeed to find an online API containing all first names, with which to check any words which are capitalized. I would check by looping through the words variable, and push any positive hits (along with the words[i + 1]) and push into an array of names.

const getPeople = () => {

  const words = knwlInstance.words.get("linkWordsCasesensitive");

  console.log(words.join(" ").replace(/([a-zA-Z])([A-Z])(?=[a-z])/g, `$1 $2`))
}

// main function for extracting, manipulating and returning relevant data

const getData = async domain => {
  const body = await urlRequest(domain);

  const $ = await convertToCheerio(body);

  const text = $.text();

  knwlInstance.init(text);

  const hyperlinks = await getHyperLinks($);

  const postcode = await knwlInstance.get("places");

  const name = domain.split(".")[0].replace(/^\w/, x => x.toUpperCase());

  const telephoneNumbers = await getTelephoneNumbers(hyperlinks);

  const emailAddresses = await getEmailAddresses(hyperlinks);

  const links = await getLinks(hyperlinks);

  let address;

  if (postcode.length === 1) {
    address = await getAddress(name, postcode[0]);
  } else {
    const addresses = await getAddresses(name, postcode);
    address = [...new Set(addresses)];
  }

  // const people = getPeople();

  const output = {
    name,
    url: createURL(domain),
    emailAddresses,
    telephoneNumbers,
    address,
    links
  };

  console.log(output);
};

if (process.argv[2] !== null) {
  const inputEmail = process.argv[2];

  const domain = getDomain(inputEmail);

  getData(domain);
} else {
  console.log("Please enter a valid email address");

  process.exit();
}
