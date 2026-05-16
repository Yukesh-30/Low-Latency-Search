
class BloomFilter {
  constructor(size = 1024 * 1024, hashCount = 3) {
    this.size = size;
    this.hashCount = hashCount;
    this.bits = new Uint32Array(Math.ceil(size / 32));
  }


  add(item) {
    for (let i = 0; i < this.hashCount; i++) {
      const hash = this._hash(item, i);
      const index = hash % this.size;
      this.bits[Math.floor(index / 32)] |= (1 << (index % 32));
    }
  }


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


  clear() {
    this.bits.fill(0);
  }


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
