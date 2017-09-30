const mkdirp = require('mkdirp');
const fs = require('fs');
const path = require('path');
const moment = require('moment');

class Logger {
  constructor(env, type) {
    this.dirpath = path.join(__dirname, '..', '..', 'log');
    this.path = path.join(this.dirpath, `${env.name}_${type}.log`);

    if (! fs.existsSync(this.dirpath))
      mkdirp(this.dirpath);
  }

  logging(text, level = 'INFO') {
    if (typeof text === 'object') {
      text = JSON.stringify(text);
    }
    let fd = fs.openSync(this.path, 'a+');
    fs.writeFileSync(fd, `[${moment().format('YYYY-MM-DD HH:mm:ss')}] [${level}] ${text}\r\n`);
    console.log(`[${moment().format('YYYY-MM-DD HH:mm:ss')}] [${level}] ${text}`);
    fs.closeSync(fd);
  }
}

module.exports = Logger;