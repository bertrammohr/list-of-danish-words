const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

// set default axios url
axios.defaults.baseURL = 'https://ordnet.dk/ddo/ordbog';

// const words = require("./words.json");
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

var deaths = [];

const startTime = Date.now();
var wordsInitially = 0;
var wordsAdded = 0;
var wordsPerMinute = 0;
const estimatedWords = 1000000;
const timeUntilDone = () => {
    const timePassed = Date.now() - startTime;
    const timePerWord = timePassed / wordsAdded;
    const timeLeft = timePerWord * (estimatedWords - wordsAdded);
    wordsPerMinute = 60000 / timePerWord;
    return Math.round(timeLeft / 1000);
}

var searchIndexes = {
    "0": [],
    a: [],
    b: [],
    c: [],
    d: [],
    e: [],
    f: [],
    g: [],
    h: [],
    i: [],
    j: [],
    k: [],
    l: [],
    m: [],
    n: [],
    o: [],
    p: [],
    q: [],
    r: [],
    s: [],
    t: [],
    u: [],
    v: [],
    w: [],
    x: [],
    y: [],
    z: [],
    'æ': [],
    'ø': [],
    'å': []
};
searchingWords.forEach(index => {
    searchIndexes[index] = require("./wordlists/" + index + "-words.json");
    wordsInitially += searchIndexes[index].length;
});

const getNextIndex = (curIndex) => {
    const i = searchingWords.indexOf(curIndex);
    if (i == searchingWords.length - 1) {
        return searchingWords[0];
    } else {
        return searchingWords[i + 1];
    }
};

const searchWord = (word, index) => {
    console.log("Searching word " + word + " @ " + index)
    axios.get("/?query=" + word).then(res => {
        // console.log(res.data);
        const $ = cheerio.load(res.data);
        var isDead = false;
        $(".searchResultBox div a").each((i, el) => {
            // console.log(el.attribs.href);
            const regex = /(?<=aselect=)(.*)(?=&query=)/gi;
            const res = regex.exec(el.attribs.href);
            if (res) {
                res[0] = res[0].replace("<RegVare/>", "");

                var nextIndex = getNextIndex(index);
                if (searchIndexes[nextIndex].indexOf(res[0]) != -1) {
                    console.log(index + " DIED!")
                    isDead = true;
                } else if (searchIndexes[index].indexOf(res[0]) == -1) {
                    console.log("Found word " + res[0] + " @ " + index);
                    
                    wordsAdded++;
                    searchIndexes[index].push(res[0]);
                }
            }
        });
        if (!isDead) {
            searchWord(searchIndexes[index][searchIndexes[index].length-1], index);
            deaths.push(index);
        }
    }).catch(err => {
        console.log("error with word " + word + " @ " + index);
    });
}

const startSearch = () => {
    // start searching
    searchingWords.forEach((index) => {
        var wordList = require("./wordlists/" + index + "-words.json");
        var curWord = wordList[wordList.length - 1] || index;

        searchWord(curWord, index);
    });

    setInterval(() => {
        console.log("Current progress is " + (wordsAdded+wordsInitially) + " words @ (" + ((wordsAdded+wordsInitially) / estimatedWords) * 100 + "%)   -   Done in " + timeUntilDone() + " seconds");
        console.log("Words per minute: " + wordsPerMinute);
        searchingWords.forEach(index => {
            fs.writeFileSync("./wordlists/" + index + "-words.json", JSON.stringify(searchIndexes[index], null, 2));
        });
    }, 2500)
}

startSearch();