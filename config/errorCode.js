let errorCode = {
  NAME_REPEAT: 'This name is already exists in db.',
  PARAM_LACK: 'There are short of params.',
  TASK_START: 'Task is already started.',
  TASK_STOP: 'Task is already stopped.',
  INNER_ISSUE: 'Some issues are made inner.'
};

let errorGenerator = (err, status) => {
  return {
    status: status || 510,
    message: errorCode[err]
  }
};

module.exports = errorGenerator;