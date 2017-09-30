const sql = require('mssql');
const util = require('util');
const _ = require('underscore');
const connect = require('../config/mssql');
const model = require('../model/mssqlModel');

// Query
let query = (queryString) => {
  return new Promise((resolve, reject) => {
    connect.then(pool => {
      return pool.request().query(queryString)
    }).then(result => {
      resolve(result);
    }).catch(err => {
      reject(err);
    })
  });
};

let getEnvByName = async (name) => {
  let queryStr = "SELECT * FROM Environment " +
    "WHERE Environment.name = '%s'";

  return await query(util.format(queryStr, name));
};

let getEnvAll = async () => {
  let queryStr = "SELECT * FROM Environment e";

  return await query(queryStr)
};

let getTestRunFileNameByEnv = async (env) => {
  let queryStr = "SELECT TestRun.fileFullName " +
    "FROM TestRun " +
    "WHERE TestRun.env = '%s'";

  return await query(util.format(queryStr, env));
};

let getTestFileOrderByFilter = async (env, filter, pageRange) => {

  let queryStr = "select Test.testName, " +
    "SUM(Test.totalFail) as failed, " +
    "SUM(Test.totalRetry) as retries, " +
    "100 - (SUM(Test.failed) * 100 / SUM(Test.run)) as passRate " +
    "from Test " +
    "join (select top %d TestRun.id, TestRun.env " +
    "from TestRun " +
    "where TestRun.env = '%s' " +
    "order by TestRun.dateFinish DESC) AS Tem " +
    "on Tem.id = Test.testRunId " +
    "group by Test.testName " +
    "order by %s DESC ";

  return await query(util.format(queryStr, pageRange, env, filter));
};

let getTestInfoByEnv = async () => {
  // let queryStr = `SELECT info.Id,info.ClasseName,info.Name,info.Owner FROM TestStatsNew stats
  //   INNER JOIN TestInfoNew info ON stats.IdTestInfo = info.Id WHERE stats.Env = '${env}'
  //   GROUP BY info.Id,info.ClasseName,info.Name,info.Owner`;

  let queryStr = "SELECT * FROM TestInfoNew";

  return await query(queryStr);
};

let getTestStatsAll = async () => {
  let queryStr = "SELECT t.id FROM TestStatsNew t";

  return await query(queryStr);
};

// Update
let envUpdate = async (env) => {
  let queryStr = "UPDATE Environment SET " +
    "depth = %d, " +
    "container = '%s', " +
    "nameDisplay = '%s', " +
    "fileNameContains = '%s', " +
    "fileNameContainsFilter = %d, " +
    "displayUI = %d, " +
    "hasBuildNumber = %d, " +
    "detailFromLogs = %d, " +
    "nameStatsMsSql = '%s', " +
    "insertStatsMsSql = %d, " +
    "insertDocDb = %d, " +
    "insertSql = %d, " +
    "insertKusto = %d, " +
    "enable = %d, " +
    "justDuration = %d, " +
    "subTitle = '%s', " +
    "title = '%s' " +
    "WHERE Environment.name = '%s'";

  await query(util.format(queryStr,
    env.depth,
    env.container,
    env.nameDisplay,
    env.fileNameContains,
    env.fileNameContainsFilter,
    env.displayUI,
    env.hasBuildNumber,
    env.detailFromLogs,
    env.nameStatsMsSql,
    env.insertStatsMsSql,
    env.insertDocDb,
    env.insertSql,
    env.insertKusto,
    env.enable,
    env.justDuration,
    env.subTitle,
    env.title,
    env.name
  ))
};

// BulkInsert
let tableColumnsAdd = (model, table) => {
  _.mapObject(model, (setting, name) => {
    table.columns.add(name, setting.type, setting.options);
  })
};

let alignObjData = (data, model) => {
  let list = [];
  _.mapObject(model, (value, key) => {
    switch (value.type) {
      case sql.DateTime:
        data[key] = new Date(data[key]);
        break;
      case sql.Int || sql.Bit:
        data[key] = parseInt(data[key]);
        break;
      default:
        if (typeof data[key] === 'object') {
          data[key] = JSON.stringify(data[key]);
        }
        break;
    }

    list.push(data[key])
  });

  return list;
};


let bulkInsertGenerator = (tableName, data, model) => {
  return new Promise((resolve, reject) => {
    connect.then(pool => {
      let table = new sql.Table(tableName);
      table.create = false;
      tableColumnsAdd(model, table);
      _.each(data, each => {
        table.rows.push(alignObjData(each, model))
      });
      return pool.request().bulk(table)
    }).then(result => {
      resolve(result);
    }).catch(err => {
      reject(err);
    })
  });
};

let TestBulkInsert = async (testData) => {
  try {
    await bulkInsertGenerator('Test', testData, model.Test);
  } catch (err) {
    throw err;
  }
};

let TestRunBulkInsert = async (testRunData) => {
  try {
    await bulkInsertGenerator('TestRun', testRunData, model.TestRun);
  } catch (err) {
    throw err;
  }
};

let TestDetailBulkInsert = async (testDetailData) => {
  try {
    await bulkInsertGenerator('TestDetail', testDetailData, model.TestDetail);
  } catch (err) {
    throw err;
  }
};

let TestStatsBulkInsert = async (testStatsData) => {
  try {
    await bulkInsertGenerator('TestStatsNew', testStatsData, model.TestStatsNew);
  } catch (err) {
    throw err;
  }
};

let TestInfoBulkInsert = async (testInfoData) => {
  try {
    await bulkInsertGenerator('TestInfoNew', testInfoData, model.TestInfoNew);
  } catch (err) {
    throw err;
  }
};

let TitleBulkInsert = async (titleData) => {
  try {
    await bulkInsertGenerator('Title', titleData, model.Title);
  } catch (err) {
    throw err;
  }
};

let EnvBulkInsert = async (envData) => {
  try {
    await bulkInsertGenerator('Environment', envData, model.Environment);
  } catch (err) {
    throw err;
  }
};

// Insert
let queryInsert = (queryStr, data, model) => {
  return new Promise((resolve, reject) => {
    connect.then(pool => {
      let request = pool.request();
      _.mapObject(model, (value, key) => {
        request.input(key, value.type, data[key])
      });
      return request.query(queryString)
    }).then(result => {
      resolve(result);
    }).catch(err => {
      reject(err);
    })
  });
};


let envInsert = async (env) => {
  let queryStr = "INSERT INTO Environment " +
    "([depth], [container], [name], [nameDisplay], [fileNameContains], " +
    "[fileNameContainsFilter], [displayUI], [hasBuildNumber], [detailFromLogs], " +
    "[nameStatsMsSql], [insertStatsMsSql], [insertDocDb], [insertSql], [insertKusto], " +
    "[enable], [justDuration], [subTitle], [title]) " +
    "values " +
    "(@depth, @container, @name, @nameDisplay, @fileNameContains, " +
    "@fileNameContainsFilter, @displayUI, @hasBuildNumber, @detailFromLogs, " +
    "@nameStatsMsSql, @insertStatsMsSql, @insertDocDb, @insertSql, @insertKusto, " +
    "@enable, @justDuration, @subTitle, @title)";

  await queryInsert(queryStr, env, model.Environment);
};

// delete
let envDelete = async (env) => {
  let queryStr = "DELETE FROM Environment " +
    "WHERE Environment.name = '%s'";

  await query(util.format(queryStr, env));
};

module.exports = {
  // query
  getEnvByName: getEnvByName,
  getEnvAll: getEnvAll,
  getTestRunFileNameByEnv: getTestRunFileNameByEnv,
  getTestFileOrderByFilter: getTestFileOrderByFilter,
  getTestInfoByEnv: getTestInfoByEnv,
  getTestStatsAll: getTestStatsAll,

  envInsert: envInsert,
  envUpdate: envUpdate,
  envDelete: envDelete,

  // bulk Insert
  testBulkInsert: TestBulkInsert,
  testRunBulkInsert: TestRunBulkInsert,
  testDetailBulkInsert: TestDetailBulkInsert,
  testStatsBulkInsert: TestStatsBulkInsert,
  testInfoBulkInsert: TestInfoBulkInsert,
  titleBulkInsert: TitleBulkInsert,
  envBulkInsert: EnvBulkInsert
};