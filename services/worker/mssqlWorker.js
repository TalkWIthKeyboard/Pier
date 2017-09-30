const mssqlFacade = require('./../MSSQLFacade');
const _ = require('underscore');
const moment = require('moment');
const util = require('util');
const redis = require('./../redisPromise');

const pageRange = [20, 30, 50];
const filterList = ['failed', 'retries'];
// ex 'fftp_10_failed_1' (env_pageRange_filter_time)
const redisSetResultFormat = '%s_%d_%s_%d';


let batchSaveInRedis = async (env, dateFinish, logger) => {

  if (moment().diff(moment(dateFinish), 'days') <= 5) {
    for (let pageIndex = 0; pageIndex < pageRange.length; pageIndex++)
      for (let filterIndex = 0; filterIndex < filterList.length; filterIndex++) {
        try {
          let _pageRange = pageRange[pageIndex];
          let _filter = filterList[filterIndex];
          let results = await mssqlFacade.getTestFileOrderByFilter(env, _filter, _pageRange);
          results = results.recordsets;
          await redis.set(util.format(redisSetResultFormat, env, _pageRange, _filter, dateFinish), JSON.stringify(results[0]));
        } catch (err) {
          logger.logging(err, 'ERROR');
        }
      }

    logger.logging(`Redis: Finished saved [ ${env}, ${dateFinish}, 20/30/50, failed/retries ] in redis.`);
  } else {
    logger.logging(`Redis: It's dont need to save in redis, [ ${env}, ${dateFinish} ]`, 'WARN');
  }
};

let upsertTestInfo = async (runObj, timer, logger) => {
  try {
    let testInfosInDB = await mssqlFacade.getTestInfoByEnv();
    let existingIdFromDb = _.pluck(testInfosInDB.recordset, 'Id');
    let testsToAdd = _.filter(runObj.Tests, test => {
      return !_.contains(existingIdFromDb, test.testId.toUpperCase());
    });

    let testInfos = [];
    for (let index in testsToAdd) {
      let test = testsToAdd[index];
      let testInfo = {
        Id: test.testId,
        DateUpdate: new Date(),
        ClasseName: test.testClassName,
        Name: test.testName,
        Owner: !_.isEmpty(test.attributes) && test.attributes.owner ? test.attributes.owner : ''
      };
      testInfos.push(testInfo);
    }
    await mssqlFacade.testInfoBulkInsert(testInfos);

    let testsToUpdate = _.filter(runObj.Tests, test => {
      let testInfoInDb = _.findWhere(testInfosInDB, {Id: test.testId.toUpperCase()});
      return testInfoInDb && !_.contains(test.attribute) && test.attribute.owner && testInfoInDb.Owner !== test.attribute.owner;
    });
    for (let index in testsToUpdate) {
      let test = testsToUpdate[index];
      let testInfo = {
        Id: test.testId,
        DateUpdate: new Date(),
        ClasseName: test.testClassName,
        Name: test.testName,
        Owner: !_.isEmpty(test.attributes) && test.attributes.owner ? test.attributes.owner : ''
      };
      testInfos.push(testInfo);
    }
    await mssqlFacade.testInfoBulkInsert(testInfos);
  } catch (err) {
    // It is primary key violate, retry it.
    if (err.message && err.message.match(/Violation of PRIMARY KEY constraint/) && timer < 10) {
      logger.logging(`upsertTestInfo(func): ${runObj.TestRun.deployment} was violation of primary key, so retry it, timer: ${timer}`, 'WARN');
      await upsertTestInfo(runObj, ++timer, logger);
    } else {
      throw err;
    }
  }
};

let upsertTestStats = async (runObj, env, timer, logger) => {
  try {
    let dateFinish = runObj.TestRun.dateFinish;
    let finishDate = moment(dateFinish).format('YYYY-MM-DD HH:mm:ss');
    let partOfId = `,${env.name},${finishDate}`;

    let testStatsInDB = await mssqlFacade.getTestStatsAll();
    let existingIdInDb = _.pluck(testStatsInDB.recordset, 'id');
    let testsStatsToAdd = _.filter(runObj.Tests, test => {
      return !_.contains(existingIdInDb, test.testId + partOfId);
    });

    let testStats = [];

    _.each(testsStatsToAdd, test => {
      let sumDuration = _.reduce(test.details, function (memo, detail) {
        return memo + (detail.originalDuration ? detail.originalDuration : 0);
      }, 0);
      let passDuration = _.filter(test.details, function (detail) {
        return detail.outcome === 'Passed';
      }).reduce(function (memo, detail) {
        return memo + (detail.originalDuration ? detail.originalDuration : 0);
      }, 0);
      let retryDuration = _.filter(test.details, function (detail) {
        return detail.outcome === 'Failed';
      }).reduce(function (memo, detail) {
        return memo + (detail.originalDuration ? detail.originalDuration : 0);
      }, 0);

      let testStat = {
        id: `${test.testId},${env.name},${finishDate}`,
        testInfoId: test.testId,
        SubEnv: env.name,
        Env: env.nameStatsMsSql,
        Date: finishDate,
        Duration: sumDuration,
        PassDuration: passDuration,
        RetryDuration: retryDuration,
        Passed: test.run === test.failed ? 0 : 1,
        Retries: test.failed
      };

      testStats.push(testStat);
    });

    await mssqlFacade.testStatsBulkInsert(testStats);
  } catch (err) {
    if (err.message && err.message.match(/Violation of PRIMARY KEY constraint/) && timer < 10) {
      logger.logging(`upsertTestStates(func): ${runObj.TestRun.deployment} was violation of primary key, so retry it, timer: ${timer}`, 'WARN');
      await upsertTestStats(runObj, env, ++timer, logger);
    } else {
      throw err;
    }
  }
};

let saveIfNotExits = async (runObj, env, logger) => {
  try {
    let dateFinish = runObj.TestRun.dateFinish;
    logger.logging(`saveIfNotExits(func): Enter in ${runObj.TestRun.deployment}.`);
    let tests = [];
    let testDetails = [];

    _.each(runObj.Tests, test => {
      let updateDate = moment().format('YYYY-MM-DD HH:mm:ss');

      _.each(test.details, detail => {
        testDetails.push(_.extend(detail, {
          testId: `${test.testId}_${env.name}_${dateFinish}`
        }))
      });

      tests.push(_.extend(_.omit(test, 'details'), {
        updateDate: updateDate,
        testRunId: runObj.id,
        id: `${test.testId}_${env.name}_${dateFinish}`,
        totalFail: test.run === test.failed ? 1 : 0,
        totalRetry: test.failed > 0 && test.run !== test.failed ? 1 : 0
      }));
    });

    await mssqlFacade.testBulkInsert(tests);
    await mssqlFacade.testDetailBulkInsert(testDetails);
    await mssqlFacade.testRunBulkInsert([runObj.TestRun]);
    // testStats depend in testInfo
    await upsertTestInfo(runObj, 0, logger);
    await upsertTestStats(runObj, env, 0, logger);

    logger.logging(`MSSQL: Finished save ${runObj.TestRun.deployment} in db.`);
    await batchSaveInRedis(
      env.name,
      new Date(runObj.TestRun.dateFinish).getTime(),
      logger
    );
  } catch (err) {
    logger.logging(`MSSQL: ${err}`, 'ERROR');
  }
};


module.exports = saveIfNotExits;