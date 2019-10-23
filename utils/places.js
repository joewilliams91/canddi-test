const axios = require("axios");

function Places(knwlInstance) {
  this.languages = {
    english: true
  };

  this.calls = function() {
    const words = knwlInstance.words.get("words");

    let results = [];

    for (let i = 0; i < words.length; i++) {

      // two regexs for if the postcode is split up into two separate components
      const firstPostcodeRegExp = /[a-z]{1,2}\d{1}\w?/g;
      const secondPostcodeRegExp = /\d{1}[a-z]{2}/g;

      // one regex for if the postcode is complete
      const fullPostcodeRegExp = /([a-z]{1,2}\d{1}\? *\d{1}[a-z]{2})$/g;

      // if the postcode appears as an intact postcode, all spaces are replaced and it is pushed into the array
      if (fullPostcodeRegExp.test(words[i])) {
        const newPostcode = words[i].replace(/\s/g, "");
        if (!results.includes(newPostcode)) {
          results.push(newPostcode);
        }

      // if the postcode appears in two separate components, and/or is mixed with other characters, the relevant matches are concatenated and pushed into the array
      } else if (
        firstPostcodeRegExp.test(words[i]) &&
        secondPostcodeRegExp.test(words[i + 1])
      ) {
        const newPostcode =
          /[a-z]{1,2}\d{1}\w?/.exec(words[i]) + /\d{1}[a-z]{2}/.exec(words[i + 1]);
        if (!results.includes(newPostcode)) {
          results.push(newPostcode);
        }
      }
    }

    return results;
  };
}

module.exports = Places;
