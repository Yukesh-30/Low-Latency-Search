const natural = require('natural');

class Tokenizer {
  constructor() {
    this.tokenizer = new natural.WordTokenizer();
    this.stemmer = natural.PorterStemmer;
  }

  /**
   * Tokenizes and stems a string (e.g., a filename).
   * Now includes N-grams for fuzzy matching support.
   * @param {string} text 
   * @returns {string[]} - Array of unique stems and n-grams.
   */
  process(text) {
    if (!text) return [];

    // 1. Better Splitting: CamelCase, dots, underscores, hyphens
    const normalizedText = text
      .replace(/([a-z])([A-Z])/g, '$1 $2') // split camelCase
      .replace(/[\._\-]/g, ' ')            // split by ., _, -
      .replace(/[^a-zA-Z0-9\s]/g, '');     // remove other special chars

    const rawTokens = this.tokenizer.tokenize(normalizedText.toLowerCase());
    
    const results = new Set();

    rawTokens.forEach(token => {
      // 2. Add the original token (if it's long enough)
      if (token.length > 1) {
        results.add(token);
      }

      // 3. Add the stem
      const stem = this.stemmer.stem(token);
      if (stem.length > 1) {
        results.add(stem);
      }

      // 4. Add character N-grams (bi-grams and tri-grams)
      // This is the "fuzzy matching" optimization
      if (token.length >= 3) {
        this._getCharNGrams(token, 3).forEach(g => results.add(g));
      }
      if (token.length >= 2) {
        this._getCharNGrams(token, 2).forEach(g => results.add(g));
      }
    });

    return [...results];
  }

  /**
   * Generates character n-grams for a single token.
   * @private
   */
  _getCharNGrams(token, n) {
    const grams = [];
    for (let i = 0; i <= token.length - n; i++) {
      grams.push(token.substring(i, i + n));
    }
    return grams;
  }
}

module.exports = new Tokenizer();
