const redis = require('./../config/redis');

let redisGetPromise = (key) => {
  return new Promise((resolve, reject) => {
    redis.get(key, (err, res) => {
      err ? reject(err) : resolve(res);
    })
  })
};

let redisSetPromise = (key, value) => {
  return new Promise((resolve, reject) => {
    redis.set(key, value, (err, res) => {
      err ? reject(err) : resolve(res);
    })
  })
};

let redisGetKeysPromise = (keys) => {
  return new Promise((resolve, reject) => {
    redis.keys(keys, (err, res) => {
      err ? reject(err) : resolve(res);
    })
  })
};

let redisDeleteKeyPromise = (key) => {
  return new Promise((resolve, reject) => {
    redis.del(key, (err, res) => {
      err ? reject(err) : resolve(res);
    })
  })
};

module.exports = {
  get: redisGetPromise,
  set: redisSetPromise,
  keys: redisGetKeysPromise,
  del: redisDeleteKeyPromise
};
