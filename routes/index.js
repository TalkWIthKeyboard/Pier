const router = require('koa-router')();
const _ = require('underscore');
const sql = require('mssql');
const path = require('path');
const redis = require('./../services/redisPromise');
const success = require('./../services/response').resSuccessBuilder;
const envModel = require('./../model/mssqlModel').Environment;
const MSSQLFacade = require('./../services/MSSQLFacade');
const error = require('./../config/errorCode');
const jobManager = require('./../services/jobManager');
const logParser = require('./../services/parserLogFile');

// About env
router.get('/', async (ctx, next) => {
  let queryResults = await MSSQLFacade.getEnvAll();
  let envs = queryResults.recordsets[0] || null;
  await ctx.render('index', {
    envs: envs
  })
});

router.post('/env', async (ctx, next) => {
  let body = ctx.request.body;
  let flag = !!body['name'];

  if (flag) {
    let envObj = await MSSQLFacade.getEnvByName(body.name);
    if (envObj.recordset[0]) {
      throw(error('NAME_REPEAT'));
    }
  }

  _.mapObject(envModel, (value, key) => {
    if (value.type === sql.Bit || value.type === sql.Int) {
      body[key] = body[key] !== '' ? parseInt(body[key]) : null;
    }
  });

  _.each(_.keys(_.omit(envModel, 'id')), key => {
    flag = flag && body[key] !== null && body[key] !== undefined;
  });

  if (flag) {
    await MSSQLFacade.envInsert(body);
    success(ctx, 'success');
  } else {
    // error
    throw(error('PARAM_LACK'));
  }
});

router.put('/env/:name', async (ctx, next) => {
  let body = ctx.request.body;
  let name = ctx.params.name || null;

  let flag = !body['name'] && !!name;

  _.mapObject(envModel, (value, key) => {
    if (value.type === sql.Bit || value.type === sql.Int) {
      body[key] = body[key] !== '' ? parseInt(body[key]) : null;
    }
  });

  _.each(_.keys(_.omit(envModel, ['id', 'name'])), key => {
    flag = flag && body[key] !== null && body[key] !== undefined;
  });

  if (flag) {
    await MSSQLFacade.envUpdate(_.extend(body, {name: name}));
    success(ctx, 'success');
  } else {
    throw(error('PARAM_LACK'))
  }
});

router.delete('/env/:name', async (ctx, next) => {
  let name = ctx.params.name || null;

  if (name) {
    await MSSQLFacade.envDelete(name);
    success(ctx, 'success');
  } else {
    throw(error('PARAM_LACK'))
  }
});

router.get('/env/:name', async (ctx, next) => {
  let name = ctx.params.name || null;

  if (name) {
    let queryResults = await MSSQLFacade.getEnvByName(name);
    success(ctx, queryResults.recordset[0] || null);
  } else {
    throw(error('PARAM_LACK'))
  }
});

// // About Job Log
router.get('/log/:name', async (ctx, next) => {
  let name = ctx.params.name || null;

  if (name) {
    let logContent = await logParser.file(name);
    success(ctx, logContent);
  } else {
    throw(error('PARAM_LACK'))
  }
});

router.delete('/log', async (ctx, next) => {
  let isSuccess = await logParser.deleteAllLogFile();
  isSuccess ? success(ctx, 'success') : () => {
    throw(error('INNER_ISSUE'))
  }
});


// About Job
router.get('/job', async (ctx, next) => {
  let status = await redis.get('jobStatus');
  let names = await logParser.name();
  let content = names.length > 0
    ? await logParser.file(names[0])
    : {producer: '', customer: ''};

  await ctx.render('job', {
    status: JSON.parse(status),
    names: names,
    content: content
  })
});

router.get('/job/start', async (ctx, next) => {
  let fileList = [{
    path: path.join(__dirname, '..', 'services', 'cluster', 'producer'),
    name: 'producer'
  }, {
    path: path.join(__dirname, '..', 'services', 'cluster', 'customer'),
    name: 'customer'
  }];

  // let fileList = [{
  //   path: path.join(__dirname, '..', 'services', 'cluster', 'producer'),
  //   name: 'producer'
  // }];

  let flag = await jobManager.startJob(fileList);
  if (flag) {
    success(ctx, 'success');
  } else {
    throw(error('TASK_START'));
  }
});

router.get('/job/stop', async (ctx, next) => {
  let flag = await jobManager.closeJob();
  if (flag) {
    success(ctx, 'success');
  } else {
    throw(error('TASK_STOP'));
  }
});


module.exports = router;
