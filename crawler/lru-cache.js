/**
 * A highly optimized LRU (Least Recently Used) Cache.
 * Uses a Doubly Linked List and a Map to achieve O(1) time complexity for get, put, and eviction.
 */
class Node {
  constructor(key, value) {
    this.key = key;
    this.value = value;
    this.prev = null;
    this.next = null;
  }
}

class LRUCache {
  constructor(capacity = 100) {
    this.capacity = capacity;
    this.cache = new Map();
    this.head = new Node(0, 0); // Dummy head
    this.tail = new Node(0, 0); // Dummy tail
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  /**
   * Get a value from the cache and move it to the front (most recently used).
   */
  get(key) {
    if (!this.cache.has(key)) return null;

    const node = this.cache.get(key);
    this._remove(node);
    this._add(node);
    return node.value;
  }

  /**
   * Put a value into the cache. Evicts the least recently used item if at capacity.
   */
  put(key, value) {
    if (this.cache.has(key)) {
      this._remove(this.cache.get(key));
    }

    const newNode = new Node(key, value);
    this.cache.set(key, newNode);
    this._add(newNode);

    if (this.cache.size > this.capacity) {
      const lru = this.tail.prev;
      this._remove(lru);
      this.cache.delete(lru.key);
    }
  }

  /**
   * Clears the cache.
   */
  clear() {
    this.cache.clear();
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  /**
   * Internal helper to add node to the front (after head).
   * @private
   */
  _add(node) {
    const headNext = this.head.next;
    this.head.next = node;
    node.prev = this.head;
    node.next = headNext;
    headNext.prev = node;
  }

  /**
   * Internal helper to remove node from the list.
   * @private
   */
  _remove(node) {
    const nextNode = node.next;
    const prevNode = node.prev;
    prevNode.next = nextNode;
    nextNode.prev = prevNode;
  }
}

module.exports = LRUCache;
