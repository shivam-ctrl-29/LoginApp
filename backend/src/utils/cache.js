const NodeCache = require('node-cache');

// Cache with 10 minute TTL
const cache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

const get = (key) => cache.get(key);
const set = (key, value) => cache.set(key, value);
const del = (key) => cache.del(key);
const flush = () => cache.flushAll();

module.exports = { get, set, del, flush };
