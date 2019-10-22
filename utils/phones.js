function Phones(knwlInstance) {
  this.languages = {
    english: true
  };

  this.calls = function() {
    const words = knwlInstance.words.get("words");

    let newWords = [];

    words.forEach(word => {
      if (/\d+/.test(word)) {
        newWords.push(word);
      }
    });

    let nums = [];

    for (let i = 0; i < newWords.length; i++) {
      const testRegExp = /^\d+$/;

      if (testRegExp.test(words[i])) {
        if (testRegExp.test(words[i - 1])) {
          nums[nums.length - 1] = nums[nums.length - 1] + words[i];
        } else {
          nums.push(words[i]);
        }
      }
    }

    let results = [];

    nums.forEach(num => {
      let newNum = num;
      if (newNum[0] !== "0") {
        newNum = num.replace(/([^0]\d+)/g, `0$1`);
      }
      newNum = newNum.replace(/^0/g, "+44");

      if (!results.includes(newNum) && newNum.length === 13) {
        results.push(newNum);
      }
    });

    return results;
  };
}

module.exports = Phones;
