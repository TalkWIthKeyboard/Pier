const rsmq = require('./../services/rsmqPromise');
const MSSQLFacade = require('./../services/MSSQLFacade');

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

initRedisList();