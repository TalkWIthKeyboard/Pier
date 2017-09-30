const cp = require('child_process');

class task {
  constructor(filePath, taskName) {
    this.childrenProcess = cp.fork(filePath);
    this.taskName = taskName;

    this.childrenProcess.on('close', () => {
        console.log(`${this.taskName} is already exits.`);
    })
  }
}

module.exports = task;