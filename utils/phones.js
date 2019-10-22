function Phones(knwlInstance) {
		
    this.languages = { 
        english: true	
    };
    
    this.calls = function() {
        
        const words = knwlInstance.words.get('linkWordsCasesensitive'); //get the String as an array of words

        console.log(words)

        // words.forEach(word => {
        //     if(/\d+/.test(word)){
        //         console.log(word.replace(/\n/g, ""))
        //     }
        // })



       
        let resultsArray = [];
        
       
        
        return results;
    };
}

module.exports = Phones;