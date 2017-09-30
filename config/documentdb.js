const documentClient = require('documentdb').DocumentClient;
const endpoint = 'https://shipping-monitor-doucument-db.documents.azure.com:443/';
const primaryKey = 'xwzZ6Cgbs0OiF8wBwinFV7dXNUQaYPmU28dA8KgaRKccNOVuiPEfVK6ioqGu24SOAxx3NynWPMmwU6BPHX3ccw==';
const client = new documentClient(endpoint, {'masterKey': primaryKey});
const Dao = require('./../model/documentDao');

let table = {
  runObject: {
    databaseId: 'trxFiles',
    collectionId: 'runObject'
  }
};

module.exports = {
  runDao: new Dao(client, table.runObject.databaseId, table.runObject.collectionId)
};

