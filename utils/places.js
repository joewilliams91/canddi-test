const axios = require("axios");

function Places(knwlInstance) {
  this.languages = {
    english: true
  };

  this.calls = function() {
    const words = knwlInstance.words.get("words");

    let results = [];

    for (let i = 0; i < words.length; i++) {
      const firstPostcodeRegExp = /[a-z]{1,2}\d{1}/g;
      const secondPostcodeRegExp = /\d{1}[a-z]{2}/g;
      const fullPostcodeRegExp = /([a-z]{1,2}\d{1} *\d{1}[a-z]{2})$/g;
      if (fullPostcodeRegExp.test(words[i])) {
        const newPostcode = words[i].replace(/\s/g, "");
        if (!results.includes(newPostcode)) {
          results.push(newPostcode);
        }
      } else if (
        firstPostcodeRegExp.test(words[i]) &&
        secondPostcodeRegExp.test(words[i + 1])
      ) {
        const newPostcode =
          /[a-z]{1,2}\d{1}/.exec(words[i]) + /\d{1}[a-z]{2}/.exec(words[i + 1]);
        if (!results.includes(newPostcode)) {
          results.push(newPostcode);
        }
      }
    }

    return results;
  };
}

module.exports = Places;
