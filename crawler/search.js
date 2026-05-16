const path = require('path');
const natural = require('natural');
const indexer = require('./indexer');
const tokenizer = require('./tokenizer');
const LRUCache = require('./lru-cache');

class SearchEngine {
  constructor() {
    this.jaroWinkler = natural.JaroWinklerDistance;
    this.cache = new LRUCache(200); // Cache up to 200 frequent queries
  }

  /**
   * Search for files based on a query.
   * Leverages LRU cache, Bloom Filter, and Inverted Index for maximum performance.
   * @param {string} query 
   * @returns {Array} - Ranked results.
   */
  search(query) {
    if (!query) return [];
    
    const normalizedQuery = query.toLowerCase().trim();

    // 1. Check LRU Cache (Fastest)
    const cachedResults = this.cache.get(normalizedQuery);
    if (cachedResults) {
      console.log(`Cache HIT for query: "${normalizedQuery}"`);
      return cachedResults;
    }

    // 2. Process query to get tokens (stems + n-grams)
    const queryTokens = tokenizer.process(normalizedQuery);
    if (queryTokens.length === 0) return [];

    // 3. Collect Candidate Files using Inverted Index
    // We only look at files that contain at least one of the query tokens
    const candidateFiles = new Map(); // path -> { file, score }

    queryTokens.forEach(qToken => {
      const matchingFiles = indexer.getFilesByToken(qToken);
      
      matchingFiles.forEach(file => {
        if (!candidateFiles.has(file.path)) {
          candidateFiles.set(file.path, { file, score: 0 });
        }
        
        const entry = candidateFiles.get(file.path);
        
        // --- IMPROVED SCORING ---
        // 1. Give massive points for long token matches (stems/full words)
        // 2. Give very few points for short n-grams to reduce "noise"
        if (qToken.length >= 4) {
          entry.score += (qToken.length * 10); 
        } else if (qToken.length === 3) {
          entry.score += 2;
        } else {
          entry.score += 0.5; // Minimal points for bi-grams
        }
      });
    });

    if (candidateFiles.size === 0) return [];

    // 4. Ranking & Refinement
    const results = [];
    candidateFiles.forEach(entry => {
      const { file, score: initialScore } = entry;
      let finalScore = initialScore;
      const fileNameLower = file.name.toLowerCase();

      // Boost for exact filename substring match (e.g. searching "first" finds "first_file.txt")
      if (fileNameLower.includes(normalizedQuery)) {
        finalScore += 100; // Major boost for substring match
      }

      // Bonus for exact name match (no extension)
      if (path.parse(fileNameLower).name === normalizedQuery) {
        finalScore += 50;
      }

      // Final refinement with Jaro-Winkler for fuzzy ranking
      const fuzzyScore = this.jaroWinkler(normalizedQuery, fileNameLower);
      if (fuzzyScore > 0.8) {
        finalScore += fuzzyScore * 10;
      }

      results.push({ file, score: finalScore });
    });

    // 5. Sort and Cache
    const rankedResults = results
      .sort((a, b) => b.score - a.score);

    this.cache.put(normalizedQuery, rankedResults);
    console.log(`Cache MISS for query: "${normalizedQuery}". Indexed ${candidateFiles.size} candidates.`);

    return rankedResults;
  }

  /**
   * Clears the search cache (call this when index updates).
   */
  clearCache() {
    this.cache.clear();
  }
}

module.exports = new SearchEngine();
