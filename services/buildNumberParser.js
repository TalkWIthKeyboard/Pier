const buildInfoNotFound = null;
const storage = require('./storagePromise');
const blobServer = require('./../config/blob');

let isBuddyBuildFromHtmlFile = async (fileObj) => {
  try {
    let res = await storage.getBlobToText(blobServer, fileObj.container, fileObj.summary);
    return res.results.indexOf('This is a buddy build.') >= 0 ? true : buildInfoNotFound;
  } catch (err) {
    console.log(`func: isBuddyBuildFromHtmlFile, message: ${err}`);
    return buildInfoNotFound;
  }
};


let getBuildInfoFromEmail = async (fileObj, envSelected) => {
  if (envSelected.hasBuildNumber && fileObj.summary) {
    let isBuddy = await isBuddyBuildFromHtmlFile(fileObj);
    let fakeBuildInfo = {
      BuildDropUrl: 'unknown',
      SyncToChange: 'unknown',
      Guid: 'unknown'
    };

    fakeBuildInfo.BuildRole = isBuddy ? 'Buddy' : 'unknown';
    return fakeBuildInfo;
  } else {
    return buildInfoNotFound;
  }
};

module.exports = {
  getBuildInfo: getBuildInfoFromEmail
};
