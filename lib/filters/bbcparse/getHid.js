const NodeCache = require('node-cache');
const demoCache = new NodeCache({ stdTTL: 100, checkperiod: 120 });

// const redis = require('redis').createClient({ host: 'redis-signedin.ddllrs.0001.euw1.cache.amazonaws.com' });
const redis = require('redis').createClient();

getHid = (hid) => {
  return new Promise((resolve, reject) => {
    demoCache.get(hid, (err, val) => {
      if (err) {
       // console.log(err.message);
      } else if (val !== undefined && val !== null && val !== 'null') {
        resolve(JSON.parse(val));
        return;
      }
      
      redis.get(hid, (err, reply) => {
        // console.log(err, reply);
        if (err) {
          reject(err);
          return;
        }
        demoCache.set(hid, reply);
        resolve(JSON.parse(reply));
      });
    });
  });
};

module.exports = async (hid) => {
  let data;
  try {
    data = await getHid(hid);
  } catch (e) {
    console.log(e.message);
  }
  return data;
};