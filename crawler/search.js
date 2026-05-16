const path = require('path');
const natural = require('natural');
const indexer = require('./indexer');
const tokenizer = require('./tokenizer');
const LRUCache = require('./lru-cache');

class SearchEngine {
  constructor() {
    this.jaroWinkler = natural.JaroWinklerDistance;
    this.cache = new LRUCache(200);
  }


  search(query) {
    if (!query) return [];

    const normalizedQuery = query.toLowerCase().trim();


    const cachedResults = this.cache.get(normalizedQuery);
    if (cachedResults) {
      console.log(`Cache HIT for query: "${normalizedQuery}"`);
      return cachedResults;
    }


    const queryTokens = tokenizer.process(normalizedQuery);
    if (queryTokens.length === 0) return [];



    const candidateFiles = new Map();

    queryTokens.forEach(qToken => {
      const matchingFiles = indexer.getFilesByToken(qToken);

      matchingFiles.forEach(file => {
        if (!candidateFiles.has(file.path)) {
          candidateFiles.set(file.path, { file, score: 0 });
        }

        const entry = candidateFiles.get(file.path);




        if (qToken.length >= 4) {
          entry.score += (qToken.length * 10);
        } else if (qToken.length === 3) {
          entry.score += 2;
        } else {
          entry.score += 0.5;
        }
      });
    });

    if (candidateFiles.size === 0) return [];


    const results = [];
    candidateFiles.forEach(entry => {
      const { file, score: initialScore } = entry;
      let finalScore = initialScore;
      const fileNameLower = file.name.toLowerCase();


      if (fileNameLower.includes(normalizedQuery)) {
        finalScore += 100;
      }


      if (path.parse(fileNameLower).name === normalizedQuery) {
        finalScore += 50;
      }


      const fuzzyScore = this.jaroWinkler(normalizedQuery, fileNameLower);
      if (fuzzyScore > 0.8) {
        finalScore += fuzzyScore * 10;
      }

      results.push({ file, score: finalScore });
    });


    const rankedResults = results
      .sort((a, b) => b.score - a.score);

    this.cache.put(normalizedQuery, rankedResults);
    console.log(`Cache MISS for query: "${normalizedQuery}". Indexed ${candidateFiles.size} candidates.`);

    return rankedResults;
  }


  clearCache() {
    this.cache.clear();
  }
}

module.exports = new SearchEngine();
