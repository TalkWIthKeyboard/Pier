const RedisSMQ = require("rsmq");
const redis = require('./redis');

module.exports = new RedisSMQ({client: redis, ns: "TestPier"});