const mssql = require('mssql');

let mssqlConfig = {
  user: 'nodeazure',
  password: 'AB_Node01',
  server: 'shipping-monitor.database.windows.net',
  database: 'fftpMonitor',
  options: { encrypt: 'true'},
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

let connection = new mssql.ConnectionPool(mssqlConfig).connect();

module.exports = connection;