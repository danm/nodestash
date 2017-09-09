const iso8601 = require('convert-iso8601-duration');

module.exports = async (vpid, abacus) => {
  return new Promise(async (resolve, reject) => {
    const key = `dur-${vpid}`;
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

      // nothing found in cache, go directly to Nitro
      const nitro = await abacus.nitro.vpidq(vpid);
      if (nitro !== undefined && nitro !== null && nitro.nitro.results.total === 1) {
        const duration = { duration: iso8601(nitro.nitro.results.items[0].duration) };
        const update = {
          duration: duration.duration,
        };

        abacus.cache.set(key, duration);
        abacus.redis.set(key, duration);
        resolve(duration);
      } else {
        abacus.cache.set(key, {});
        abacus.redis.set(key, {});
        reject(new Error('Not found in Nitro'));
      }
    } catch (e) {
      reject(e);
    }
  });
};
