const _ = require('underscore');
const Logger = require('./clusterLog');
const cluster = require('cluster');
// const numCPUs = require('os').cpus().length;
const numCPUs = 2;
const rsmq = require('./../rsmqPromise');
const redis = require('./../redisPromise');

const workerObj = {
  documentdb: require('./../worker/docdbWorker'),
  mssql: require('./../worker/mssqlWorker')
};


let fileTaskCustomer = async (worker, process) => {
  let task = await rsmq.popMessage('taskQueue');
  if (!task.message) {
    process.send('finished');
    worker.kill();
  } else {
    task = JSON.parse(task.message);
    let fileObj = await redis.get(task.key);
    fileObj = JSON.parse(fileObj);
    let env = task.env;
    let logger = new Logger(env, 'customer');
    await workerObj[task.db](fileObj, env, logger);
    await redis.del(task.key);
    worker.kill();
  }
};

let exitEvent = (worker, code, signal) => {
  // console.log('Worker ' + worker.process.pid + ' died with code: ' + code + ', and signal: ' + signal);
  // console.log('Starting a new worker');
  cluster.fork();
};

if (cluster.isMaster) {
  rsmq.sendMessageOnly('jobTaskQueue', process.pid)
    .then(() => {
      for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
      }
      cluster.on('exit', exitEvent);
      cluster.on('message', (worker, msg) => {
        // todo  [don`t break down roll poling now]
        // if (msg === 'finished')
        //   cluster.removeAllListeners('exit');
      });
    })
} else {
  fileTaskCustomer(cluster.worker, process);
}