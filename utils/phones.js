function Phones(knwlInstance) {
  this.languages = {
    english: true
  };

  this.calls = function() {
    // gets all words from the knwlInstance

    const words = knwlInstance.words.get("words");

    // initialises a new array to push number matches.

    let nums = [];

    // loops through the array of words above to identify relevant number matches with which to construct a telephone number.

    for (let i = 0; i < words.length; i++) {
      // looks for any matches in the words array containing one or more digits

      if (/\d+/.test(words[i])) {
        // replaces any punctuation which might be included in a telephone number as it is displayed on a web page, but which will make the process of determining telephone numbers difficult in this context, except for the plus at the beginning, which will make the process easier.

        const numMatch = words[i].replace(/[-)(]/g, "");

         // looks for any of the above matches that contain only digits, in addition to zero or one plus at the beginning of the string.

        const testRegExp = /^\+?[0-9]+$/g;

        if (testRegExp.test(numMatch)) {

          // checks if any of the above matches are immediately preceded (in the words array) by another match containing only digits and zero or one plus at the beginning of the string. if so, the current match is concatenated with the previous match in the nums array.

          if (/^\+?[0-9]+$/g.test(words[i - 1].replace(/[-)(]/g, ""))) {

            // quick check to see if the current index begins with a +; if this is the case, it is pushed into the array, as it is likely the beginning of a new telephone number; otherwise, it is concatenated as per the above. i added this extra regex as some telephone numbers were being concatenated with each other.

            if(/^\+/g.test(numMatch)){
              nums.push(numMatch)
            } else {
              nums[nums.length - 1] = nums[nums.length - 1] + numMatch;
            } 

            // if the previous entry in the words array does not comprise only digits, the current entry is simply pushed into the nums array. this refers the first number(s) of a potential telephone number.
          } else {
            nums.push(numMatch);
          }
        }
      }
    }

    let results = [];

    nums.forEach(num => {
      let newNum = num;

      if ((newNum.length > 10)) {
        // if a zero has been omitted from the full telephone number on the website, it is added below.

        if (/[1-9]/.test(newNum[0])) {
          newNum = num.replace(/([^0]\d+)/g, `0$1`);
        }

        // NB - the below assumes UK numbers only; for all numbers beginning with 0, the 0 is replaced with +44.

        if (/^0/g.test(newNum)) {
          newNum = newNum.replace(/^0/g, "+44");
        }

        // some numbers are displayed on the webpage with both an area code and a 0; the below removes the 0 to ensure formatting is consistent, thus preventing duplicates.

        if(/^(\+44)0(\d+)$/g.test(newNum)){
          newNum = newNum.replace(/^(\+44)0(\d+)$/g, `$1$2`)
        }

        // final check to see if telephone number is already in the array, and if newly formatted number meets US/UK telephone number length requirements.

        if (!results.includes(newNum) && /\+\d{11,12}$/g.test(newNum)) {
          results.push(newNum);
        }
      }
      
    });

    return results;
  };
}

module.exports = Phones;
