const _ = require('underscore');
const storage = require('./storagePromise');
const blobServer = require('./../config/blob');
const FileNameObj = require('./../model/fileName');

let filter = (fileName, fileNameContains) => {
  if ((fileName.extname()) !== 'trx') return false;
  let regExp = new RegExp('.*[^0-9]$');
  if (! regExp.exec(fileName.basename())) return false;
  if (fileName.basename().match(/tmiRun.*/) && !fileName.basename().match(/.*All/g)) return false;
  return !(fileNameContains && fileName.basename().indexOf(fileNameContains) === - 1);
};

let searchAll = (options) => {
  return new Promise((resolve, reject) => {
    // loggingTool('Searching All Files FromRootDir = ' + options.container + ' with depth = ' + options.depth);
    let fileList = [];

    storage.listBlobsSegmented(blobServer, options.container)
      .then(res => {
        let results = res ? res.results.entries : null;
        let summarySet = new Set();

        _.map(results, file => {
          let _fileName = new FileNameObj(file.name);
          if (_fileName.extname() === 'htm')
            summarySet.add(file.name);
        });

        _.map(results, file => {
          let _fileName = new FileNameObj(file.name);

          if (!options.fileNameContainsFilter || filter(_fileName, options.fileNameContains)) {
            let fileOpObj = {container: options.container, path: file.name};
            // add Summary.htm
            if (summarySet.has(`${_fileName.dirname()}/Summary.htm`))
              fileOpObj.summary = `${_fileName.dirname()}/Summary.htm`;
            fileList.push(fileOpObj);
          }
        });

        resolve(fileList);
      })
      .catch(err => {
        reject(err);
      });
  });
};

module.exports = {
  searchAll: searchAll
};
