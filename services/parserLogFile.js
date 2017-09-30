const fs = require('fs');
const path = require('path');
const _ = require('underscore');

const producer = '_producer.log';
const customer = '_customer.log';

let parserLogFileName = async () => {
  let logFolderPath = path.join(__dirname, '..', 'log');
  let logList = fs.readdirSync(logFolderPath);

  let logNameSet = new Set();
  _.each(logList, logName => {
    let producerIndex = logName.search(producer);
    let customerIndex = logName.search(customer);
    let env = producerIndex !== -1
      ? logName.slice(0, producerIndex)
      : logName.slice(0, customerIndex);

    logNameSet.add(env);
  });

  let res = [];
  for (let item of logNameSet.keys()) {
    res.push(item);
  }

  return res;
};

let parserLogFile = async (fileName) => {
  let logFolderPath = path.join(__dirname, '..', 'log');
  let thisProducer = path.join(logFolderPath, fileName + producer);
  let thisCustomer = path.join(logFolderPath, fileName + customer);
  let res = {producer: '', customer: ''};

  if (fs.existsSync(thisProducer)) {
    res.producer = fs.readFileSync(thisProducer);
    res.producer = res.producer.toString();
  }

  if (fs.existsSync(thisCustomer)) {
    res.customer = fs.readFileSync(thisCustomer);
    res.customer = res.customer.toString();
  }

  return res;
};

let deleteAllLogFile = async () => {
  let logFolderPath = path.join(__dirname, '..', 'log');
  let logList = fs.readdirSync(logFolderPath);

  try {
    for (let index = 0; index < logList.length; index ++) {
      let log = logList[index];
      fs.unlinkSync(path.join(logFolderPath, log));
    }
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
};

module.exports = {
  name: parserLogFileName,
  file: parserLogFile,
  deleteAllLogFile: deleteAllLogFile
};

