const natural = require('natural');

class Tokenizer {
  constructor() {
    this.tokenizer = new natural.WordTokenizer();
    this.stemmer = natural.PorterStemmer;
  }


  process(text) {
    if (!text) return [];


    const normalizedText = text
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/[\._\-]/g, ' ')
      .replace(/[^a-zA-Z0-9\s]/g, '');

    const rawTokens = this.tokenizer.tokenize(normalizedText.toLowerCase());

    const results = new Set();

    rawTokens.forEach(token => {

      if (token.length > 1) {
        results.add(token);
      }


      const stem = this.stemmer.stem(token);
      if (stem.length > 1) {
        results.add(stem);
      }



      if (token.length >= 3) {
        this._getCharNGrams(token, 3).forEach(g => results.add(g));
      }
      if (token.length >= 2) {
        this._getCharNGrams(token, 2).forEach(g => results.add(g));
      }
    });

    return [...results];
  }


  _getCharNGrams(token, n) {
    const grams = [];
    for (let i = 0; i <= token.length - n; i++) {
      grams.push(token.substring(i, i + n));
    }
    return grams;
  }
}

module.exports = new Tokenizer();
