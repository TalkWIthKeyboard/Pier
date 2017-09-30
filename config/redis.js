const redis = require('redis');

let conf = {
  port: 6380,
  hostName: 'test-monitor-cache.redis.cache.windows.net',
  key: '2hC66S/R5ST2SBZz6qwWviy3pruI+5+3NO2eppN39sY='
};

module.exports = redis.createClient(
  conf.port,
  conf.hostName,
  {
    auth_pass: conf.key,
    tls: {
      servername: conf.hostName
    }
  }
);