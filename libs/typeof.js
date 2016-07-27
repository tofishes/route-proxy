module.exports = function typeOf(obj) {
  const type = Object.prototype.toString.call(obj)
    .toLowerCase()
    .replace('[object ', '')
    .replace(']', '');

  return {
    'is': (typeName) => typeName.toLowerCase() === type,
    type
  };
};
