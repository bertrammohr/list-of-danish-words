const words = require("./wordlists/words.json");

const longestWord = words.filter(word => !word.includes(" ")).reduce((longest, word) => {
    return word.length > longest.length ? word : longest;
}, "");

console.log(longestWord);