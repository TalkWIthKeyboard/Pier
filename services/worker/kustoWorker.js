const kustoFacede = require('../KustoFacade');

let saveIntoKusto = async (runObj, env, logger) => {
  try {
    logger.logging(`Kusto: Enter in ${runObj.TestRun.deployment}.`);
    await kustoFacede.ingestIntoKusto(env, runObj, logger);
  } catch (err) {
    throw err;
  }
};

module.exports = saveIntoKusto;