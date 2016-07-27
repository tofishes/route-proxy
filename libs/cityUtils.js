"use strict";
//从cookie中获取city，参数：cookie
var city =function (cookies) {
  var userCityCookie = config.cookieName.userCity
  var city = cookies[userCityCookie];
  city =  city && JSON.parse(city);
  return city;
}

exports.city = city;
