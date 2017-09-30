const rsmq = require('./../rsmqPromise');
const MSSQLFacade = require('./../MSSQLFacade');
const _ = require('underscore');

let initRedis = async () => {
  try {
    await rsmq.createQueue('envQueue');
    await rsmq.createQueue('taskQueue');
    let envs = await MSSQLFacade.getEnvAll();
    envs = envs.recordsets[0];

    for (let index = 0; index < envs.length; index ++) {
      let envSelected = envs[index];
      await rsmq.sendMessageOnly('envQueue', envSelected);
    }

    console.log('Send all message!');
  } catch (err) {
    console.log(err);
  }
};

let initRedisList = async () => {
  try {
    await rsmq.createQueue('envQueue');
    await rsmq.createQueue('taskQueue');
    console.log('finished');
  } catch (err) {
    console.log(err);
  }
};

let initMessageQueue = async() => {
  let envs = await MSSQLFacade.getEnvAll();
  envs = envs.recordsets[0];

  for (let index = 0; index < envs.length; index ++) {
    let envSelected = envs[index];
    if (envSelected.name === 'campaign_mt_fftp') {
      console.log('Find data from campaign-mt-fftp and save it in message queue.');
      await rsmq.sendMessageOnly('envQueue', envSelected);
    }
  }

  console.log('Send all message!');
  return envs[envs.length - 1].name;
};


module.exports = initMessageQueue;