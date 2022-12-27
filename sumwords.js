const fs = require('fs');

var searchingWords = [
    "0",
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
    "g",
    "h",
    "i",
    "j",
    "k",
    "l",
    "m",
    "n",
    "o",
    "p",
    "q",
    "r",
    "s",
    "t",
    "u",
    "v",
    "w",
    "x",
    "y",
    "z",
    "æ",
    "ø",
    "å",
]

var words = [];

searchingWords.forEach((word) => {
    // var wordsFile = require("./wordlists/"+word+"-words.json");
    // import data from file
    var wordsFile = JSON.parse(fs.readFileSync("./wordlists/"+word+"-words.json"));
    console.log(word, wordsFile.length);
    words = words.concat(wordsFile);
})

console.log(words.length)
fs.writeFileSync("./wordlists/words.json", JSON.stringify(words, null, 2));