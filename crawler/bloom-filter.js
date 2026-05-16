/**
 * A simple and efficient Bloom Filter implementation.
 * Used to quickly check if a token potentially exists in the index.
 */
class BloomFilter {
  constructor(size = 1024 * 1024, hashCount = 3) {
    this.size = size;
    this.hashCount = hashCount;
    this.bits = new Uint32Array(Math.ceil(size / 32));
  }

  /**
   * Adds an item to the bloom filter.
   */
  add(item) {
    for (let i = 0; i < this.hashCount; i++) {
      const hash = this._hash(item, i);
      const index = hash % this.size;
      this.bits[Math.floor(index / 32)] |= (1 << (index % 32));
    }
  }

  /**
   * Checks if an item might be in the set.
   * Returns false if it definitely is NOT.
   * Returns true if it MIGHT be.
   */
  contains(item) {
    for (let i = 0; i < this.hashCount; i++) {
      const hash = this._hash(item, i);
      const index = hash % this.size;
      if (!(this.bits[Math.floor(index / 32)] & (1 << (index % 32)))) {
        return false;
      }
    }
    return true;
  }

  /**
   * Resets the filter.
   */
  clear() {
    this.bits.fill(0);
  }

  /**
   * Simple string hash function (FNV-1a variant).
   * @private
   */
  _hash(str, seed) {
    let hash = 0x811c9dc5 ^ seed;
    for (let i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      hash = Math.imul(hash, 0x01000193);
    }
    return hash >>> 0;
  }
}

module.exports = BloomFilter;
