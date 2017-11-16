const fs = require('fs');

const mapResult = (contentStore) => {
  return contentStore.map((row) => {
    return {
      countername: row.iStatsCounterName,
      section_uri: ((row.section && row.section.urlIdentifier) || (row.section && row.section.uri) || null),
      site_name: (row.site && row.site.urlIdentifier ) || null,
      type: row.type,
      publishedDate: row.firstPublished,
    };
  });
};

const filterResult = (meta, name) => {
  // filter with the matching countername
  cleanMeta = meta.filter((v) => {
    if (v.countername === name) return true;
    return false;
  });

  // check we atually have content still.
  if (cleanMeta.length > 0) {
    return cleanMeta[0];
  } else {
    return new Error('No Docment Found in Content Store');
  }
}

module.exports = async (cpsid, name, abacus) => {
  return new Promise(async (resolve, reject) => {
    const key = `cps-${cpsid}`;
    try {
      // try getting from local node cache
      const local = await abacus.cache.get(key);
      if (local !== undefined && Array.isArray(local) === false) {
        if (local.firstPublished) {
          local.publishedDate = local.firstPublished
        }
        resolve(local);
        return;
      } else if (local !== undefined && local.length > 1) {
        // filter with the matching countername
        const filteredMeta = filterResult(local, name);
        if (filteredMeta instanceof Error === true) reject(filteredMeta);
        else resolve(filteredMeta);
        return;
      }

      // try redis
      const redis = await abacus.redis.get(key);
      if (redis !== undefined && redis !== null && Array.isArray(redis) === false) {
        abacus.cache.set(key, redis);
        resolve(redis);
        return;
      } else if (redis !== undefined && redis !== null && redis.length > 1) {
        // filter with the matching countername
        const filteredMeta = filterResult(redis, name);
        if (filteredMeta instanceof Error === true) reject(filteredMeta);
        else resolve(filteredMeta);
        return;
      }

      // nothing found in cache, go directly to the content store
      const contentStore = await abacus.contentStore.cpsq(cpsid);
      if (contentStore === undefined) {
        // nothing found
        await abacus.cache.set(key, {});
        abacus.redis.setAndExpire(key, {}, 10800);
        reject(new Error('Not Found in The Content Store - 68'));
      } else if (contentStore.results.length === 1) {
        // a normal result with just one document
        const meta = mapResult(contentStore.results);
        abacus.cache.set(key, meta[0]);
        abacus.redis.set(key, meta[0]);
        
        const update = {
          cpsid,
          meta: meta[0],
        };
        fs.appendFileSync('./update-cps.ndjson', ` SET '${key}' '${JSON.stringify(meta)}' \n`);
        resolve(meta[0]);

      } else if (contentStore.results.length > 1) {
        // usually when there are two language version of the same cps article
        // chinese service is a good candiate for this
        // this module will return and array back of all versions which have this cps id, we have to figure out which one we want.

        const meta = mapResult(contentStore.results);

        // send to caches
        abacus.cache.set(key, meta);
        abacus.redis.set(key, meta);
        
        fs.appendFileSync('./update-cps.ndjson', ` SET '${key}' '${JSON.stringify(meta)}' \n`);
        
        // filter with the matching countername
        const filteredMeta = filterResult(meta, name);
        if (filteredMeta instanceof Error === true) reject(filteredMeta);
        else resolve(filteredMeta);
      } else {
        reject(new Error('Unexpected result from the Content Store'));
      }
    } catch (e) {
      reject(e);
    }
  });
};
