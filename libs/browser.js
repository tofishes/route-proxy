module.exports = (request) => {
  var ua = request.get('User-Agent')

  if (!ua) {
    return {}
  }

  ua = ua.toLowerCase();

  var match = /(webkit)[ \/]([\w.]+)/.exec(ua)
    || /(opera)(?:.*version)?[ \/]([\w.]+)/.exec(ua)
    || /(msie) ([\w.]+)/.exec(ua)
    || !/compatible/.test(ua) && /(mozilla)(?:.*? rv:([\w.]+))?/.exec(ua)
    || [null, null, 0];
  var version = match[2]
  , kernel = match[1];

  return {
    version: match[2],
    ie: kernel === "msie",
    gecko: (ua.indexOf("gecko") > -1 && ua.indexOf("khtml") == -1),
    webkit: (ua.indexOf("webkit") > -1),
    opera: (ua.indexOf("opera") > -1)
  };
}


