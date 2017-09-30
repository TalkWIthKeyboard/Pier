const cp = require('child_process');
const redis = require('./redisPromise');
const Task = require('./../model/task');
const rsmq = require('./rsmqPromise');
const _ = require('underscore');

let startJob = async (fileList) => {
  let status = await redis.get('jobStatus');

  if (!status) {
    status = true;
    await rsmq.createQueue('jobTaskQueue')
  } else {
    status = JSON.parse(status);
    if (status) {
      console.log('Job is started.');
      return false;
    } else {
      status = true;
    }
  }

  await redis.set('jobStatus', status);
  _.each(fileList, file => {
    new Task(file.path, file.name);
  });

  return true;
};

let closeJob = async () => {
  let status = await redis.get('jobStatus');

  if(!status) return false;
  else status = JSON.parse(status);

  if (status) {
    let pid = {};
    pid.message = 1;
    while (pid.message) {
      try {
        pid = await rsmq.popMessage('jobTaskQueue');
        if (pid.message) {
          cp.execSync(`TSKILL ${pid.message}`);
        }
      } catch (err) {
        console.log(`Job Manager make error: ${err}`);
      }
    }

    status = false;
    await redis.set('jobStatus', status);
    return true;
  } else {
    return false;
  }
};

module.exports = {
  startJob: startJob,
  closeJob: closeJob
};