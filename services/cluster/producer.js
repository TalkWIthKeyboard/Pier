const _ = require('underscore');
const cluster = require('cluster');
// const numCPUs = require('os').cpus().length;
const numCPUs = 1;
const rsmq = require('./../rsmqPromise');
const Promise = require('bluebird');
const MSSQLFacade = require('./../MSSQLFacade');
const runDao = require('./../../config/documentdb').runDao;
const searchTrxFiles = require('../searchTrxFiles');
const buildInfoParser = require('../buildNumberParser');
const parseTrxFile = require('../parseTrxFile');
const Logger = require('./clusterLog');
const initRSMQ = require('./initRSMQ');

const checkBox = {
  insertStatsMsSql: {
    instance: MSSQLFacade,
    db: 'mssql'
  },
  insertDocDb: {
    instance: runDao,
    db: 'documentdb'
  },
  // insertKusto: 'kusto'
};

let mergeResults = (fileInDb, fileInStorage, errorLog) => {
  let fullNameMap = new Map();
  let fileFullNameMap = {};

  _.each(fileInDb, (res, index) => {
    fileFullNameMap[_.values(checkBox)[index].db] = _.isArray(res)
      ? _.chain(res).pluck('fileFullName').value()
      : _.chain(res.recordset).pluck('fileFullName').value();
  });

  // 1. create fileInStorage map
  _.each(fileInStorage, (info) => {
    if (!fullNameMap.has(info.path)) {
      fullNameMap.set(info.path, {
        documentdb: true,
        mssql: true,
        // kusto: false
        file: info
      })
    }
  });

  // 2. replenish more information
  _.mapObject(fileFullNameMap, (dbResult, db) => {
    _.each(dbResult, file => {
      let dbList = fullNameMap.get(file);
      if (dbList) {
        dbList[db] = false;
        fullNameMap.set(file, dbList);
      } else {
        errorLog.logging(`${file} is in documentDB, but not in storage.`);
      }
    })
  });

  return fullNameMap;
};

let fileTaskProducer = async (fileNotInDbMap, envSelected, logger) => {
  for (let dbStatus of fileNotInDbMap.values()) {
    try {
      let fileObj = dbStatus.file;
      let buildInfo = await buildInfoParser.getBuildInfo(fileObj, envSelected);

      if (envSelected.hasBuildNumber && buildInfo === null) {
        logger.logging(`This environment has a buildNumber setup but has not been found. Don't save this trx file in DB : ${fileObj.name}`);
        return null;
      }

      let content = await parseTrxFile(fileObj, true, buildInfo, envSelected);
      let promiseList = [];
      _.mapObject(_.omit(dbStatus, 'file'), (isSaveInDb, dbName) => {
        if (isSaveInDb) {
          promiseList.push(rsmq.sendMessage(
            'taskQueue',
            dbStatus.file.path,
            JSON.stringify(content),
            envSelected,
            dbName,
            logger
          ));
        }
      });
      await Promise.all(promiseList);
      logger.logging(`-- Send all message about ${dbStatus.file.path}`);
    } catch (err) {
      logger.logging(`  FileTaskProducer [${dbStatus.file.path}] made error: ${JSON.stringify(err)}`, 'ERROR');
    }
  }
};

let envTaskProducer = async (worker, process) => {
  try {
    let envSelected = await rsmq.popMessage('envQueue');
    if (!envSelected.message) {
      process.send('finished');
      worker.kill();
    } else {
      envSelected = JSON.parse(envSelected.message);
      if (envSelected.name === 'campaign_mt_fftp') {
        let logger = new Logger(envSelected, 'producer');
        logger.logging(`Enter in ${envSelected.name} to work.`);
        let fileInStorage = await searchTrxFiles.searchAll(envSelected);
        let promiseList = [];
        _.mapObject(checkBox, (value, key) => {
          if (envSelected[key])
            promiseList.push(value.instance['getTestRunFileNameByEnv'](envSelected.name));
        });
        let results = await Promise.all(promiseList);
        let errorLogger = new Logger(envSelected, 'error');
        let fileNotInDbMap = mergeResults(results, fileInStorage, errorLogger);
        logger.logging('Finished merge work, start to send message now.');
        await fileTaskProducer(fileNotInDbMap, envSelected, logger);
      } else {
        console.log('It is not campaign-mt-fftp');
      }
      process.send(envSelected.name);
      worker.kill();
    }
  } catch (err) {
    console.log(err);
    console.log('  envTaskProducer made error: ', JSON.stringify(err));
  }
};

let exitEvent = (worker, code, signal) => {
  // console.log('Worker ' + worker.process.pid + ' died with code: ' + code + ', and signal: ' + signal);
  // console.log('Starting a new worker');
  cluster.fork();
};


if (cluster.isMaster) {
  let finishedNum = 0;
  let lastEnv;

  rsmq.sendMessageOnly('jobTaskQueue', process.pid)
    .then(() => {
      for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
      }

      cluster.on('exit', exitEvent);

      cluster.on('message', async (worker, msg) => {
        if (msg === 'finished') {
          cluster.removeAllListeners('exit');
          finishedNum ++;
        }

        if (msg === lastEnv || finishedNum === 1) {
          console.log('Start reload!');
          // replenish message queue and restart all worker.
          lastEnv = await initRSMQ();
          for (let i = 0; i < numCPUs; i++) {
            cluster.fork();
          }
          cluster.on('exit', exitEvent);
        }
      });
    })
} else {
  // console.log(`WORKER: ${cluster.worker.id} started.`);
  envTaskProducer(cluster.worker, process);
}



