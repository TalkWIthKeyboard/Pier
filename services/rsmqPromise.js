const rsmq = require('./../config/rsmq');
const redis = require('./../config/redis');
const Promise = require('bluebird');


let createQueue = (queueName) => {
  return new Promise((resolve, reject) => {
    rsmq.createQueue({qname: queueName}, (err, resp) => {
      err ? reject(err) : resolve(resp);
    })
  })
};

let sendMessage = (queueName, filePath, content, env, db, logger) => {
  return new Promise((resolve, reject) => {
    let fileName = `${env.name}_${filePath}`;

    redis.get(fileName, (err, reply) => {
      if (err) {
        reject(err)
      } else {
        if (!reply) {
          redis.set(fileName, content, (setErr, setReply) => {
            if (setErr) {
              reject(setErr);
            } else {
              rsmq.sendMessage({qname: queueName, message: JSON.stringify({
                key: fileName,
                db: db,
                env: env
              })}, (_err, _res) => {
                _err ? reject(_err) : resolve(_res);
              })
            }
          })
        } else {
          logger.logging(`-- ${fileName} is already in message queue.`, 'WARN');
          resolve('IsAlreadyExits');
        }
      }
    })
  })
};

let sendMessageOnly = (queueName, message) => {
  return new Promise((resolve, reject) => {
    rsmq.sendMessage({qname: queueName, message: JSON.stringify(message)}, (err, res) => {
      err ? reject(err) : resolve(res);
    })
  })
};

let receiveMessage = (queueName) => {
  return new Promise((resolve, reject) => {
    rsmq.receiveMessage({qname: queueName}, (err, res) => {
      err ? reject(err) : resolve(res);
    })
  })
};

let popMessage = (queueName) => {
  return new Promise((resolve, reject) => {
    rsmq.popMessage({qname: queueName}, (err, res) => {
      err ? reject(err): resolve(res);
    })
  })
};


module.exports = {
  createQueue: createQueue,
  sendMessage: sendMessage,
  sendMessageOnly: sendMessageOnly,
  receiveMessage: receiveMessage,
  popMessage: popMessage
};