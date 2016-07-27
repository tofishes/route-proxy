// red: [31, 39],green: [32, 39],yellow: [33, 39],blue: [34, 39],magenta: [35, 39],cyan: [36, 39],
const env = process.env.NODE_ENV || 'development';
const isProduction = env === 'production';
const colorMap = {
  'error': 31,
  'info': 32,
  'debug': 33
};

function log(type, argItems) {
  if (isProduction) {
    return;
  }

  // 转换arguments为真正数组
  const items = Array.prototype.slice.call(argItems);

  const start = `\u001b[${colorMap[type]}m`;
  const end = '\u001b[39m';

  items.splice(0, 0, start);
  items.push(end);

  console.log.apply(null, items);
}

log.error = function error(...args) {
  log('error', args);
};
log.info = function info(...args) {
  log('info', args);
};
log.debug = function debug(...args) {
  log('debug', args);
};

module.exports = log;
