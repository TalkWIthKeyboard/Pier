let pub = {};

pub.resSuccessBuilder = (ctx, data) => {
  ctx.status = 200;
  ctx.body = {'data': data};
};

pub.resErrorBuilder = (ctx, err) => {
  ctx.status = err.status || 510;
  ctx.body = {'err': err.message};
};

module.exports = pub;