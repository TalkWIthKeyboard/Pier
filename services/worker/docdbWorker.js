const runDao = require('./../../config/documentdb').runDao;

let saveIfNotExits = async (item, env, logger) => {
  let _item = item;
  try {
    let results = await runDao.find(_item.id);
    if (results.length === 0) await runDao.addItem(_item);
    else throw 'It`s in DB.';
  } catch (err) {
    throw new Error(err);
  }
};

module.exports = saveIfNotExits;