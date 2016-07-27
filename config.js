'use strict';

const fs = require('fs');
const path = require('path');
const fileUtils = require('./libs/fileUtils')
const _ = require('./libs/lang')

const day = 1000 * 60 * 60 * 24;

var devConfigFile = __dirname + '/config.dev.js'
, devConfig = {};
if (fs.existsSync(devConfigFile)) {
  devConfig = require(devConfigFile);
}

let configs = {}
fileUtils.walkSync(__dirname + '/config', function(e, paths){
  try {
    configs[_.camelCase(path.basename(paths, '.js'))] = require(paths);
  } catch(e){}
});


module.exports = Object.assign({
  'apiServer': 'http://113.108.139.178',
  'ICP': '粤ICP备15020461号',
  'company': '广东联结网络技术有限公司' || '广东联结电子商务有限公司',
  'cookieExpires': 30 * day, // days
  'memberStatus': {
    0: '普通会员',
    1: '普通会员', // 实名认证审核中，但是页面展示依然是普通会员
    2: '认证会员',
    3: '会员禁用中'
  },
  'statusCode': {
    'success': 1000,
    'auth': 210018
  },
  // 接口状态码与http状态码转换表
  'codeMap': {
    '1000': '200',
    // 内部错误
    '1002': '500',
    // 参数错误
    '210018': '401',
    '401': '401',
    // 超时
    '502': '408'
  },
  'successCode': 1000, // 成功的返回码
  'production': {
    'port': 9000, // 生产环境node app的端口
    'version': '1.0' // 对应后端接口版本
  },
  'development': {
    'port': 8000,
    'version': '1.0'
  },
  'cookieName': {
    'token': 't',
    'autoLogin': 'l',
    'userCity': 'c',
    'userId': 'u'
  },
  'header': {
    'token': 'x-token'
  },
  'loginPage': '/login'
}, configs);
