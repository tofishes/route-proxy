const querystring = require('querystring');

module.exports = {
  'stringify': params => {
    const query = [];

    Object.keys(params).map(key => {
      if (params[key]) {
        query.push(`${key}=${params[key]}`);
      }

      return key;
    });

    return query.join('&');
  },
  'parse': querystring.parse
};
