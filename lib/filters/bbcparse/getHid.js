module.exports = async (hid, abacus) => {
  return new Promise(async (resolve, reject) => {
    const key = `hid-${hid}`;
    
    try {
      // try getting from local node cache
      const local = await abacus.cache.get(key);
      if (local !== undefined) {
        resolve(local);
        return;
      }

      // try redis
      const redis = await abacus.redis.get(key);
      if (redis !== undefined && redis !== null) {
        abacus.cache.set(key, redis);
        resolve(redis);
        return;
      }
      resolve();
    } catch (e) {
      reject(e);
    }
  });
};
