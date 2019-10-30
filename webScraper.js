const cheerio = require("cheerio");
const axios = require("axios");
const Knwl = require("knwl.js");
const knwlInstance = new Knwl("english");

const {API_KEY} = require('./.env');

knwlInstance.register("phones", require("./utils/phones"));
knwlInstance.register("places", require("./utils/places"));

// takes domain from email address provided in CL

const getDomain = (email) => {
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

// function for pulling out all anchor tags with a "href" attrib, from which phone numbers/email addresses may be extracted

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

  // returns results of the "phones" plugin, assigning the array to the above empty array

  telephoneNumbers = await knwlInstance.get("phones");

  // looks through all anchor tags on the webpage, checking for any containing "tel:", and pushing any relevant, formatted results to the above array;

  links.forEach(link => {
    if (link && /tel:/.test(link)) {
      let newLink = link.split("tel:")[1];

      // removes any spaces
      newLink = newLink.replace(/\s/g, "");

      // if string begins with 0, replaces with +44 (assuming UK numbers for now)
      newLink = newLink.replace(/^0/g, "+44");

      // removes any punctuation often included to telephone numbers, which might lead to duplication with the results from the "phones" plugin;
      newLink = newLink.replace(/[-)(]/g, "");

      // removes any 0s following the +44 area code, as per the formatting on some websites, to prevent further duplication

      if (/^(\+44)0(\d+)$/g.test(newLink)) {
        newLink = newLink.replace(/^(\+44)0(\d+)$/g, `$1$2`);
      }

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

  // gets emails from the "emails" plugin, and adds them to the above array if they are not already in there

  const emails = await knwlInstance.get("emails");

  emails.forEach(email => {
    if (!emailAddresses.includes(email.address)) {
      emailAddresses.push(email.address);
    }
  });

  // takes all anchor tags which contain a "mailto:" reference, pushing these into the above array, as long as they are not already there

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
    `https://maps.googleapis.com/maps/api/geocode/json?address=${domain}+${postcode}&key=${API_KEY}`
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

// below still work in progress; need to find an online API containing all first names, with which to check any words which are capitalized. I would check by looping through the words variable, and push any positive hits (along with the words[i + 1]) and push into an array of names.

const getPeople = () => {
  const words = knwlInstance.words.get("linkWordsCasesensitive");

  console.log(words.join(" ").replace(/([a-zA-Z])([A-Z])(?=[a-z])/g, `$1 $2`));
};

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

if (!process.argv[2]) {
  const inputEmail = process.argv[2];

  const domain = getDomain(inputEmail);

  getData(domain);
} else {
  console.log("Please enter a valid email address");

  process.exit();
}
