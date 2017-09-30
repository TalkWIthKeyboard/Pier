const response = require('./response');

let errorHandler = () => {
  return async (ctx, next) => {
    try {
      await next();
    } catch (err) {
      await response.resErrorBuilder(ctx, err);
    }
  }
};

module.exports = {
  errorHandler: errorHandler
};