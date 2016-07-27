"use strict";
var queryString = require('querystring');
var url = function (path, arr) {
  // 获取视图入口的地址
  //echo static::r_file(path, Aii::debug_file());
  //echo static::absolute_path(path, Aii::debug_file());
  if (path) {
    //path = substr(static::relative_path(static::absolute_path(path, Aii::debug_file()), $_SERVER['DOCUMENT_ROOT']), 1);
  }

  if (Array.isArray(path)) {
    arr = path;
    path = null;
  }

  let s = '';
  if (arr.length) {
    s = '?' + queryString.stringify(arr);
  }

  if (!path)
    return s;
  return path + s;
}
exports.url = url;