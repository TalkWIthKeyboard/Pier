const env = require('./env');
const _ = require('underscore');
const MSSQLFacade = require('../services/MSSQLFacade');


let main = async () => {
  _.mapObject(env, (value, key) => {
    _.extend(value, {
      name: key,
      insertDocDb: true,
      insertSql: false,
      insertKusto: true,
      enable: true,
      fileNameContainsFilter: true,
      justDuration: false
    });

    _.mapObject(value, (_v, _k) => {
      if (typeof _v === 'boolean') {
        value[_k] = _v ? 1 : 0;
      }
    });
    env[key] = value;
  });

  let list = _.values(env);
  for (let i = 0; i < list.length; i++) {
    if (!list[i].fileNameContains) {
      delete list[i].fileNameContains;
    }
  }

  let title = [{
    name: 'CCUI',
  }, {
    name: 'UCM',
  }, {
    name: 'Campaign UI'
  }, {
    name: 'Campaign MT'
  }, {
    name: 'Campaign DB'
  }, {
    name: 'CCMT',
  }, {
    name: 'BILLING',
  }, {
    name: 'CCUI Daily Shipping',
    title: 'CCUI'
  }, {
    name: 'UCM Cloud Test',
    title: 'UCM'
  }, {
    name: 'Campaign DB CI',
    title: 'Campaign DB'
  }, {
    name: 'CCMT Gated Check-in',
    title: 'CCMT'
  }, {
    name: 'CCMT Regular FFTP',
    title: 'CCMT'
  }, {
    name: 'CCMT SI',
    title: 'CCMT'
  }, {
    name: 'CCMT SI AZURE',
    title: 'CCMT'
  }, {
    name: 'Billing Regular FFTP',
    title: 'BILLING'
  }, {
    name: 'Billing SI',
    title: 'BILLING'
  }, {
    name: 'Billing SI Azure',
    title: 'BILLING'
  }, {
    name: 'Billing SI Azure Partition',
    title: 'BILLING'
  }];

  _.each(title, obj => {
    _.extend(obj, {displayUI: true})
  });

  try {
    await MSSQLFacade.titleBulkInsert(title);
    await MSSQLFacade.envBulkInsert(list);
  } catch (err) {
    console.log(err);
  }

  console.log('finished!');
};

main();