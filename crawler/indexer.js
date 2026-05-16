const fs = require('fs');
const path = require('path');
const tokenizer = require('./tokenizer');
const BloomFilter = require('./bloom-filter');

const INDEX_FILE = path.join(__dirname, '../indexes/file_index.json');

class Indexer {
  constructor() {
    this.forwardIndex = new Map();
    this.invertedIndex = new Map();
    this.bloomFilter = new BloomFilter();
    this.loadIndex();
  }

  loadIndex() {
    try {
      if (fs.existsSync(INDEX_FILE)) {
        const data = JSON.parse(fs.readFileSync(INDEX_FILE, 'utf8'));
        this.syncWithCrawl(data);
        console.log(`Loaded ${this.forwardIndex.size} files into Forward and Inverted indexes.`);
      }
    } catch (err) {
      console.error('Error loading index:', err.message);
    }
  }

  saveIndex() {
    try {
      const data = Array.from(this.forwardIndex.values());
      if (!fs.existsSync(path.dirname(INDEX_FILE))) {
        fs.mkdirSync(path.dirname(INDEX_FILE), { recursive: true });
      }
      fs.writeFileSync(INDEX_FILE, JSON.stringify(data, null, 2));
      console.log('Index saved successfully.');
    } catch (err) {
      console.error('Error saving index:', err.message);
    }
  }


  requestSave() {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.saveTimeout = setTimeout(() => {
      this.saveIndex();
      this.saveTimeout = null;
    }, 5000);
  }


  addFile(file) {
    file.tokens = tokenizer.process(file.name);
    this.forwardIndex.set(file.path, file);


    file.tokens.forEach(token => {
      if (!this.invertedIndex.has(token)) {
        this.invertedIndex.set(token, new Set());
      }
      this.invertedIndex.get(token).add(file.path);
      this.bloomFilter.add(token);
    });

    this.requestSave();
  }


  removeFile(filePath) {
    const file = this.forwardIndex.get(filePath);
    if (file && file.tokens) {
      file.tokens.forEach(token => {
        const paths = this.invertedIndex.get(token);
        if (paths) {
          paths.delete(filePath);
          if (paths.size === 0) {
            this.invertedIndex.delete(token);
          }
        }
      });
    }
    this.forwardIndex.delete(filePath);
    this.requestSave();
  }

  updateFile(filePath, stats) {

    this.removeFile(filePath);


    const file = {
      path: filePath,
      name: path.basename(filePath),
      size: stats.size,
      modified: stats.mtime.getTime()
    };
    this.addFile(file);
  }

  getAllFiles() {
    return Array.from(this.forwardIndex.values());
  }


  getFilesByToken(token) {

    if (!this.bloomFilter.contains(token)) {
      return [];
    }


    const paths = this.invertedIndex.get(token);
    if (!paths) return [];

    return Array.from(paths).map(path => this.forwardIndex.get(path)).filter(Boolean);
  }

  syncWithCrawl(files) {
    this.forwardIndex.clear();
    this.invertedIndex.clear();
    this.bloomFilter.clear();

    files.forEach(file => this.addFile(file));
    this.saveIndex();
  }
}

module.exports = new Indexer();
