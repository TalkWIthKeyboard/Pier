const config = require('../config/KustoConfig');
const AuthenticationContext = require('adal-node').AuthenticationContext;
const authContext = new AuthenticationContext(config.authorityUrl);

var token;

function getToken() {
  return new Promise((resolve, reject) => {
    if (token) {
      resolve(token);
    } else {
      authContext.acquireTokenWithClientCredentials(config.resource, config.clientId, config.clientSecret, (err, resp) => {
        if (err) {
          reject(err);
        } else {
          let token = resp.accessToken;
          resolve(token);
        }
      });
    }
  });
}

function refreshToken() {
  return new Promise((resolve, reject) => {
    authContext.acquireTokenWithClientCredentials(config.resource, config.clientId, config.clientSecret, (err, resp) => {
      if (err) {
        reject(err);
      } else {
        let token = resp.accessToken;
        resolve(token);
      }
    });
  });
}

module.exports = {
  getToken: getToken,
  refreshToken: refreshToken,
};