const _ = require('underscore');
const https = require('https');
const AadAuthentication = require('./AadAuthentication');
const config = require('../config/KustoConfig');

const basicOptions = {
  hostname: config.hostname,
  port: 443,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  }
};

async function ingestIntoKusto(envSelected, runObject, logger) {
  let dateStart = new Date(runObject.TestRun.dateStart);
  let dateFinish = new Date(runObject.TestRun.dateFinish);
  let duration = dateFinish - dateStart;
  let Env = envSelected.nameStatsMsSql;
  let SubEnv = runObject.TestRun.env;

  let testRun = {
    Id: runObject.TestRun._id,
    Env: Env,
    SubEnv: SubEnv,
    DateStart: dateStart,
    DateFinish: dateFinish,
    Duration: duration,
    TotalTestCount: runObject.TestRun.totalTestCount,
    TotalSuccessSummary: runObject.TestRun.totalSuccessSummary,
    TotalFlakySummary: runObject.TestRun.totalFlakySummary,
    TotalFailSummary: runObject.TestRun.totalFailSummary,
    FileFullName: runObject.TestRun.fileFullName,
  };

  let testStats = [];

  for (let i = 0; i < runObject.Tests.length; i++) {
    let test = runObject.Tests[i];
    //Get the duration if exists. If there is multiple runs for a test, we calculate the sum of the duration
    let sumDuration = _.reduce(test.details, function (memo, detail) {
      return memo + (detail.originalDuration ? detail.originalDuration : 0);
    }, 0);
    //Get the duration of all passed test run
    let passDuration = _.filter(test.details, function (detail) {
      return detail.outcome === 'Passed';
    }).reduce(function (memo, detail) {
      return memo + (detail.originalDuration ? detail.originalDuration : 0);
    }, 0);
    // Get the duration of retry test run
    let retryDuration = _.filter(test.details, function (detail) {
      return detail.outcome === 'Failed';
    }).reduce(function (memo, detail) {
      return memo + (detail.originalDuration ? detail.originalDuration : 0);
    }, 0);

    let testStat = {
      Id: test.testId,
      Env: Env,
      SubEnv: SubEnv,
      Name: test.name,
      ClassName: test.testClassName,
      Date: dateFinish,
      Passed: test.run === test.failed ? 0 : 1,
      Retries: test.failed,
      TotalDuration: sumDuration,
      PassDuration: passDuration,
      RetryDuration: retryDuration,
    };
    testStats.push(testStat);
    // batch ingest every 100 testStats
    if (i % 100 === 0) {
      await ingestIntoTestStatsInline(testStats, logger);
      testStats = [];
    }
  }

  // ingest the remaining testStats
  await ingestIntoTestStatsInline(testStats.logger);

  // ingest TestRuns in the last
  await ingestIntoTestRunsInline(testRun, logger);
}

function getFileFullNamesByEnv(env, subEnv, logger) {
  let csl = `${config.testRunsTable} | where Env == '${env}' and SubEnv == '${subEnv}' | project FileFullName`;
  return query(csl)
      .then(res => JSON.parse(res).Tables[0].Rows)
      .catch(err => logger.logging(`get FileFullNames by Env=${env} and SubEnv=${subEnv} failed: ${err}`));
}

function ingestIntoTestRunsInline(testRun, logger) {
  let csl = `.ingest inline into table ${config.testRunsTable} [${testRun.Id},${testRun.Env},${testRun.SubEnv},`
      + `${testRun.DateStart},${testRun.DateFinish},${testRun.Duration},${testRun.TotalTestCount},${testRun.TotalSuccessSummary},`
      + `${testRun.TotalFlakySummary},${testRun.TotalFailSummary},${testRun.FileFullName}]`;
  manage(csl)
      .then(res => logger.logging(`save ${testRun.Id} into testRuns successfully.`))
      .catch(err => logger.logging(`save ${testRun.Id} into testRuns fails: ${err}`));
}

function ingestIntoTestStatsInline(testStats, logger) {
  let csl = `.ingest inline into table ${config.testStatsTable} `;
  testStats.forEach(testStat => {
    csl += `[${testStat.Id},${testStat.Env},${testStat.SubEnv},`
        + `${testStat.Name},${testStat.ClassName},${testStat.Date},${testStat.Passed},${testStat.Retries},`
        + `${testStat.TotalDuration},${testStat.PassDuration},${testStat.RetryDuration}]`
  });
  console.log(csl);
  manage(csl)
      .then(res => logger.logging(`save ${testStats.length} records into testStats successfully.`))
      .catch(err => logger.logging(`save ${testStats.length} records into testStats fails: ${err}`));
}

function query(queryStr) {
  return new Promise((resolve, reject) => {
    AadAuthentication.getToken()
        .then(token => generate(token, queryStr, true))
        .then(data => request(data.options, data.postData))
        .then(res => resolve(res))
        .catch(err => reject(err))
  })
}

function manage(mgmtStr) {
  return new Promise((resolve, reject) => {
    AadAuthentication.getToken()
        .then(token => generate(token, mgmtStr, false))
        .then(data => request(data.options, data.postData))
        .then(res => resolve(res))
        .catch(err => reject(err))
  })
}

function request(options, postData) {
  return new Promise((resolve, reject) => {
    let req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => {
        data += chunk;
      });
      res.on('end', () => {
        resolve(data);
      })
    });

    req.on('err', err => {
      reject(err);
    });

    req.write(postData);
    req.end();
  });
}

function generate(token, csl, isQuery) {
  return new Promise((resolve, reject) => {
    console.log(`token: ${token}`);
    let bearer = `Bearer ${token}`;
    let postData = JSON.stringify({
      'db': config.db,
      'csl': csl,
    });
    let options = basicOptions;
    if (isQuery) {
      options.path = '/v1/rest/query';
    } else {
      options.path = '/v1/rest/mgmt';
    }
    options.headers['Content-Length'] = Buffer.byteLength(postData);
    options.headers['Authorization'] = bearer;
    resolve({options: options, postData: postData});
  })
}

module.exports = {
  ingestIntoKusto: ingestIntoKusto,
  getFileFullNamesByEnv: getFileFullNamesByEnv,
};