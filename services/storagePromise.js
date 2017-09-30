const Promise = require('bluebird');
const fs = require('fs');

let returnHandler = (resolve, reject, err, results, response) => {
  err
    ? reject(err)
    : resolve({'results': results, 'response': response});
};

let createContainerIfNotExistsPromise = (blobService, buildDefinitionId) => {
  return new Promise((resolve, reject) => {
    blobService.createContainerIfNotExists(buildDefinitionId, (err, results, response) =>
      returnHandler(resolve, reject, err, results, response));
  });
};

let listBlobsSegmentedPromise = (blobService, container) => {
  return new Promise((resolve, reject) => {
    blobService.listBlobsSegmented(container, null, (err, results, response) =>
      returnHandler(resolve, reject, err, results, response));
  });
};

let getBlobToTextPromise = (blobService, container, blob) => {
  return new Promise((resolve, reject) => {
    blobService.getBlobToText(container, blob, (err, results, response) =>
      returnHandler(resolve, reject, err, results, response));
  });
};

let getBlobToLocalFilePromise = (blobService, container, blob, filename) => {
  return new Promise((resolve, reject) => {
    blobService.getBlobToLocalFile(container, blob, filename, (err) => {
      if (err) {
        reject(err)
      } else {
        fs.readFile(filename, (error, text) => {
          try {
            let _text = text.toString();
            error ? reject(error) : resolve(_text);
          } catch (err) {
            reject(err);
          }
        })
      }
    })
  })
};

let createBlockBlobFromLocalFilePromise = (blobService, container, blob, filePath) => {
  return new Promise((resolve, reject) => {
    blobService.createBlockBlobFromLocalFile(container, blob, filePath, (err, results, response) =>
      returnHandler(resolve, reject, err, results, response));
  });
};

let createBlockBlobFromTextPromise = (blobService, container, blob, text) => {
  return new Promise((resolve, reject) => {
    blobService.createBlockBlobFromText(container, blob, text, (err, results, response) =>
      returnHandler(resolve, reject, err, results, response));
  });
};

module.exports = {
  'createContainerIfNotExists': createContainerIfNotExistsPromise,
  'listBlobsSegmented': listBlobsSegmentedPromise,
  'getBlobToText': getBlobToTextPromise,
  'getBlobToLocalFile': getBlobToLocalFilePromise,
  'createBlockBlobFromLocalFile': createBlockBlobFromLocalFilePromise,
  'createBlockBlobFromText': createBlockBlobFromTextPromise
};
