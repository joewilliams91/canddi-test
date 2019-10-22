const axios = require('axios')

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

    const getCoordinates = postcode => {
      
     
        axios.get(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${postcode}&key=AIzaSyA0NPRN93V8yRyOeg4IPwPuy-qQAXDBf2Q`
        )
          .then(response => console.log(response.data.results[0].address_components))
          // .then(responseJson => {
          //  console.log(responseJson)
          // })
      //     .then(coordinates => {
      //       this.props.updateLocation(coordinates);
      //     })
      //     .catch(error => alert("Please enter a valid postcode."));
      // } catch (error) {
      //   alert("Please enter a valid postcode.");
      // }
    };

    
    results.forEach(postcode => {
      getCoordinates(postcode)
    })

    return results;
  };


}

module.exports = Places;
