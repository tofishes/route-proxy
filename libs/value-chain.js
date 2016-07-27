const log = require('./log.js');

module.exports = function getValueChain(data, chain, defaultVal) {
  const keys = chain.split('.');
  const l = keys.length;
  let i = 0;
  let value = data;

  try {
    for (; i < l; i++) {
      value = value[keys[i]];
    }
  } catch (e) {
    log.error(`${chain}获取数据到${keys[i]}报错:\n${e.stack}`);
    value = defaultVal;
  }

  if (value === undefined || value === null) {
    value = defaultVal;
  }

  return value;
};
