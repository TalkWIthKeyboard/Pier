const xml2js = require('xml2js');
const fs = require('fs');
const _ = require('underscore');
const storage = require('./storagePromise');
const blobServer = require('./../config/blob');
const parseLog = require('./logParser/parselog');
const Promise = require('bluebird');
const moment = require('moment');
const path = require('path');

function parseTrxFile(trxFileObj, addDetails, buildInfo, envSelected) {
  return new Promise(function (resolve, reject) {
    let xml2jsParser = new xml2js.Parser();
    storage.getBlobToLocalFile(blobServer, trxFileObj.container, trxFileObj.path, path.join(__dirname, 'cluster', 'temporary', `${envSelected.name}_temp.trx`))
      .then(function (text) {
        let _text = text.replace('\ufeff', '');
        xml2jsParser.parseString(_text, function (err, result) {
          if (err) {
            reject(err);
            return;
          }
          let trxFileFullName = trxFileObj.path;
          let resultJson = getTestJson(result, trxFileFullName, addDetails, buildInfo, envSelected);
          resolve(resultJson);
        });
      })
      .catch(function (err) {
        reject(err);
      });
  });
}

function getTestJson(json, trxFileFullName, addDetails, buildInfo, envSelected) {
  let jsonResult = {
    id: json.TestRun.$.id
  };
  let tests = getTests(json, addDetails, envSelected);
  jsonResult.TestRun = {
    id: json.TestRun.$.id,
    env: envSelected.name || 'unknow',
    name: json.TestRun.$.name,
    deployment: json.TestRun.TestSettings ? json.TestRun.TestSettings[0].Deployment[0].$.runDeploymentRoot : 'unknown',
    buildInfo: buildInfo,
    dateStart: json.TestRun.Times[0].$.start,
    dateFinish: json.TestRun.Times[0].$.finish,
    fileFullName: trxFileFullName,
    totalTestCount: tests.length,
    team: envSelected && envSelected.nameStatsMsSql || 'unknown',
    icmProcessed: false,
    totalSuccessSummary: _.where(tests, {
      run: 1
    }).length,
    totalFlakySummary: _.filter(tests, function (test) {
      return test.failed > 0 && test.failed !== test.run;
    }).length,
    totalFailSummary: _.filter(tests, function (test) {
      return test.failed === test.run;
    }).length
  };

  jsonResult.TestRun.filePath = json.TestRun.$.filePath
    ? json.TestRun.$.filePath
    : json.TestRun.TestSettings && json.TestRun.TestSettings[0].Download
      ? json.TestRun.TestSettings[0].Download[0].$.trxPath
      : null;
  jsonResult.Tests = tests;
  return jsonResult;
}

function getTests(json, addDetails, envSelected) {
  let tests = [];
  let testDefinitions = json.TestRun.TestDefinitions[0].UnitTest;

  //console.logParser("here: "+json.TestRun.Results[0]);
  let index = 0;
  if (json.TestRun.Results[0].UnitTestResult)
    json.TestRun.Results[0].UnitTestResult.forEach(function (unitTestResult) {
      index++;
      if (index % 1000 === 0)
        console.log(`${index} for each start ${moment().format('YYYY-MM-DD HH:mm:ss')}`);
      addOneTest(tests, unitTestResult, addDetails, testDefinitions, envSelected);
    });

  if (envSelected.justDuration)
    tests = parserTests(tests);

  return tests;
}


function parserTests(tests) {
  let testList = [];
  _.each(tests, function (test) {
    testList.push(_.pick(test, ['testName', 'failed']));
  });

  return testList
}


function addOneTest(jsonResultTestArray, unitTestResult, addDetails, testDefinitions, envSelected) {
  let id = unitTestResult.$.testId;
  let existingUnitTestResult = _.findWhere(jsonResultTestArray, {
    testId: id
  });
  if (existingUnitTestResult) {
    existingUnitTestResult.run = existingUnitTestResult.run + 1;
    existingUnitTestResult.failed = unitTestResult.$.outcome === 'Failed' ? existingUnitTestResult.failed + 1 : existingUnitTestResult.failed;
    if (addDetails)
      existingUnitTestResult.details.push(getDetailTestRun(unitTestResult, envSelected));

  } else {

    let testCategoryAttribute, ownerAttribute, priorityAttribute;

    if (envSelected && envSelected.detailFromLogs) {
      testCategoryAttribute = parseLog.getCategoryValue(unitTestResult, 'TestCategoryAttribute');
      ownerAttribute = parseLog.getCategoryValue(unitTestResult, 'OwnerAttribute');
      priorityAttribute = parseLog.getCategoryValue(unitTestResult, 'PriorityAttribute');
    }

    let unitTest = {
      testId: id,
      testClassName: getClassName(testDefinitions, id),
      testName: unitTestResult.$.testName,
      run: 1,
      failed: unitTestResult.$.outcome === 'Failed' ? 1 : 0,
      attributes: {
        testCategory: testCategoryAttribute,
        owner: ownerAttribute,
        priority: priorityAttribute
      },
      details: []
    };
    if (addDetails)
      unitTest.details.push(getDetailTestRun(unitTestResult, envSelected));

    jsonResultTestArray.push(unitTest);
  }
}

function getClassName(testDefinitions, id) {
  let testDefinition = _.filter(testDefinitions, function (testDefinition) {
    return testDefinition.$.id === id;
  });
  if (testDefinition.length !== 1)
    return '';

  return testDefinition[0].TestMethod[0].$.className;
}

function getDetailTestRun(unitTestResult, envSelected) {
  let errorInfoArray = unitTestResult.Output ? unitTestResult.Output[0].ErrorInfo : undefined;
  let originalDuration;

  if (envSelected && envSelected.detailFromLogs)
    originalDuration = parseLog.getDuration(unitTestResult);
  else
    originalDuration = new Date(unitTestResult.$.endTime) - new Date(unitTestResult.$.startTime);


  return {
    computerName: unitTestResult.$.computerName,
    duration: unitTestResult.$.duration,
    startTime: unitTestResult.$.startTime,
    endTime: unitTestResult.$.endTime,
    outcome: unitTestResult.$.outcome,
    errorInfo: {
      message: errorInfoArray ? errorInfoArray[0].Message : '',
      stackTrace: errorInfoArray ? errorInfoArray[0].StackTrace : ''
    },
    originalDuration: originalDuration,
  };
}


module.exports = parseTrxFile;
