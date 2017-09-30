var _ = require('underscore');

var twelveHours = (12 * 3600 * 1000);

function getDate(line) {
  if (! line)
    return;


  var matches = line.match(/\[(.+)\].+/);
  return new Date(matches[1]);
}

function getDateWithLine(logLines, token) {
  var line = _.find(logLines, line => line.indexOf(token) >= 0);
  return getDate(line);
}

function getDiffFromLog(log) {
  var logLines = log.split('\n');

  var start = getDateWithLine(logLines, 'Created WebDriver');
  var end = getDateWithLine(logLines, 'Before test cleanup');

  if (! start || ! end)
    return;


  var timeDiff = end.getTime() - start.getTime();

  if (timeDiff > (2 * twelveHours))
    timeDiff -= (2 * twelveHours);


  if (timeDiff < 0)
    timeDiff += twelveHours;

  return timeDiff;
}

/**
 * Find the line that contains the category name and return the value if exists
 * If something is not found, return string.empty
 * Example: Information[date]: TestCategoryAttribute=CCUISeleniumFFTP with categoryuName = CCUISeleniumFFTP will return CCUISeleniumFFTP
 */
function getCategoryValueFromLog(log, categoryName) {
  var logLines = log.split('\n');
  var line = _.find(logLines, line => line.indexOf(categoryName) >= 0);
  var reg = new RegExp('.*' + categoryName + '=(.+)', 'g');
  var matches = reg.exec(line);
  return matches && matches.length == 2 && matches[1] || '';
}

/**
 * return all the StdOut of the object on param if exists
 */
function getTestLog(unitTestResult){
  if (unitTestResult.Output && unitTestResult.Output[0].StdOut)
    return unitTestResult.Output[0].StdOut[0];

}

function getDuration(unitTestResult) {
  var testLog = getTestLog(unitTestResult);
  if (testLog)
    return getDiffFromLog(testLog);

}

function getCategoryValue(unitTestResult, categoryName) {
  var testLog = getTestLog(unitTestResult);
  if (testLog)
    return getCategoryValueFromLog(testLog, categoryName);

}

module.exports = {
  getDuration,
  getCategoryValue
};
