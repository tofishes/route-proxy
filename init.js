// 初始化，路由
const fs = require('fs');
const path = require('path');

const fu = require('./libs/fileUtils');
const log = require('./libs/log.js');
const typeOf = require('./libs/typeof.js');
const getValueChain = require('./libs/value-chain.js');
const config = require('./config.js');

const pathRegexp = require('path-to-regexp');
const async = require('async');
const request = require('request');

const env = process.env.NODE_ENV || 'development';
const isProduction = env === 'production';
const apiMap = require('./api-map.js')[env];

const headerTokenName = config.header.token;
const tokenName = config.cookieName.token;
// https证书
const certFile = path.resolve(__dirname, 'libs/ca.crt');
const requestDefaults = {
  'cert': fs.readFileSync(certFile),
  'strictSSL': false,
  'timeout': 10 * 1000, // milliseconds 10秒
  'json': true
};
const clientPC = 1;
const commonAPI = '/user/getUserInfoByNoCheck';

global.config = config;
global.log = log;

// 设置接口通用项目
function getRequest(req) {
  const headers = {
    'x-client': clientPC,
    'x-area': '',
    'x-version': config[env].version,
    'x-device': '',
    'x-nettype': ''
  };
  headers[headerTokenName] = req.cookies[tokenName] || '';
  requestDefaults.headers = headers;

  return request.defaults(requestDefaults);
}

function apiPathToName(apiPath) {
  return apiPath.replace(/\//g, '_');
}

function getFullAPIUrl(apiUrl, isStrict) {
  const domain = apiMap[apiUrl];

  if (isStrict && !domain) {
    const error = `!!! Error: can not find ${apiUrl} in apiMap config`;

    throw new Error(error);
  }

  return domain + apiUrl;
}

function getMember(data) {
  const key = apiPathToName(commonAPI);

  return getValueChain(data, `${key}.data`, {});
}

function setMember(dataMap, appLocals) {
  // 处理并最后剥离公共api的数据
  const member = getMember(dataMap);

  appLocals.member = member;

  appLocals.isLogined = !!member.id;

  delete dataMap[apiPathToName(commonAPI)];
}

// 简单获取根域名
function getRootDomain(hostname) {
  return hostname.substring(hostname.lastIndexOf('.', hostname.lastIndexOf('.') - 1) + 1);
}

function setCookie(req, res, apiResponse) {
  const token = apiResponse.headers[headerTokenName];

  if (!token) {
    return false;
  }

  const autoLogin = req.cookies[config.cookieName.autoLogin];
  let expiresDate = null;

  if (autoLogin) {
    expiresDate = new Date(Date.now() + config.cookieExpires);
  }
  const domain = getRootDomain(req.hostname);
  const options = {
    'expires': expiresDate,
    'domain': isProduction ? `.${domain}` : domain
  };

  return res.cookie(tokenName, token, options);
}

function autoProxy(req, res, api, apiUrl) {
  const method = req.method.toLowerCase();
  const options = {
    'url': getFullAPIUrl(apiUrl || req.originalUrl, !!apiUrl),
    'body': req.body  // originalUrl中已经包含req.query
  };

  api[method](options).on('response', response => {
    res.set(response.headers);
    setCookie(req, res, response);
  })
  .pipe(res);
}

function autoRender(req, res) {
  const app = req.app;
  const filePath = app.get('views') + req.path + app.get('viewExt');

  fs.exists(filePath, (exists) => {
    // 例如访问： /member/profile, 则自动转到 /views/member/profile.swig模板渲染
    if (exists) {
      return res.render(path.relative('/', req.path));
    }
    // 找不到模板，则返回404
    if (isProduction) {
      return res.render('404', {
        title: 'Not Found 您访问的页面受限'
      });
    }

    return res.status(404).send(`未找到模板: ${filePath}`);
  });
}

function commonJSON(data) {
  const isSuccess = data.code === config.successCode;

  return Object.assign({
    'time': Date.now(),
    'success': isSuccess,
    'data': {},
    'message': isSuccess ? 'success' : 'fail'
  }, data);
}

function decodeParam(val) {
  if (typeof val !== 'string' || val.length === 0) {
    return val;
  }

  return decodeURIComponent(val);
}

function pretyJSON(json) {
  return JSON.stringify(json, null, 2);
}

function getMethod(req) {
  return req.method.toLowerCase();
}

function doRequests(req, apiPaths, queries, params, onComplete, allDone, logger) {
  if (!apiPaths.length) {
    return;
  }

  const requestes = {};

  apiPaths.map(api => {
    // 通过apiPath前缀，可以设置api请求方法
    // 例如:  'get:/user/info'
    let apiMethod = getMethod(req);
    let apiQueries = Object.assign({}, queries);
    let apiParams = Object.assign({}, params);
    let apiPath = api;

    // apiPath有两种配置：
    // 1、默认字符串形式
    // 2、高级定制对象形式
    if (!apiPath.substring) {
      const apiQuery = apiPath.query;
      const apiHandleParams = apiPath.params;

      apiPath = apiPath.url;

      if (apiQuery) {
        apiQueries = apiQuery(apiQueries, req);
      }

      apiParams = Object.assign({}, apiQueries, req.body);

      if (apiHandleParams) {
        apiParams = apiHandleParams(apiParams, req);
      }
    }

    if (apiPath.startsWith('get:') || apiPath.startsWith('post:')) {
      const parsePaths = apiPath.split(':');

      apiMethod = parsePaths[0];
      apiPath = parsePaths[1];
    }

    const name = apiPathToName(apiPath);

    if (!apiPath.startsWith('http')) {
      apiPath = getFullAPIUrl(apiPath, true);
    }

    function action(callback) {
      const options = {
        url: apiPath,
        body: apiParams,
        qs: apiQueries
      };
      const complete = (error, response, body) => {
        logger.debug('===============\nvisit page:', req.originalUrl);

        if (error) {
          logger.error('\nvisit page:', {
            'url': req.originalUrl, apiMethod, apiPath, params, error
          });

          let code = 503;
          let message = `接口${apiPath} Service Unavailable, 无法提供正常服务。`;

          if (error.code === 'ETIMEDOUT') {
            code = 504;
            message = `接口${apiPath} Request Timeout, 请求超时`;
          }

          return callback(error, { code, message, error });
        }

        logger.debug({
          apiMethod, options,
          'result': response ? response.body : '!!!!!!!!!!!!!\nreturn response undefined'
        });

        let data = body;
        if (!response || response.statusCode !== 200) {
          data = {
            code: response ? response.statusCode : 500,
            message: 'response exception, not 200 ok.',
            origin_body: body
          };
        }

        if (onComplete) {
          onComplete(error, data, response);
        }

        return callback(error, data);
      };

      getRequest(req)[apiMethod](options, complete);
    }

    requestes[name] = action;

    return requestes;
  });

  async.parallel(requestes, (error, results) => {
    const dataMap = results;

    if (!isProduction) {
      log.info('\n后端接口', apiPaths, '请求参数：', pretyJSON({ body: params, qs: queries }));
      log.info('返回数据集合：\n', pretyJSON(dataMap));
    }

    allDone(error, dataMap);
  });
}
// 解析路由名中由多个逗号分隔的值
// 允许多个路由设置同一条规则： '/route, /route/:name'
function parseMultiRouteName(routesPart) {
  const routeName = Object.keys(routesPart);
  const newPart = {};

  routeName.forEach(name => {
    const routes = name.split(',');

    if (routes.length > 1) {
      routes.forEach(route => {
        newPart[route.trim()] = routesPart[name];
      });
    } else {
      newPart[name] = routesPart[name];
    }
  });

  return newPart;
}

module.exports = (app, appLocalsReference) => {
  // 读取route map， 获取route array
  const logger = global.logger;
  const dir = `${__dirname}/routes`;
  const routeMap = {};
  const appLocals = appLocalsReference;

  fu.walkSync(dir, (err, file) => {
    try {
      const routesPart = require(file); // eslint-disable-line global-require

      Object.assign(routeMap, parseMultiRouteName(routesPart));
    } catch (e) {
      log.error(file, ' Error: ', e);
    }
  });

  const routes = Object.keys(routeMap);
  // 解析route为正则
  const routeRegx = routes.map(route => {
    routeMap[route].routeKeys = [];
    return pathRegexp(route, routeMap[route].routeKeys, {});
  });

  // app监管所有请求，1、设置公共api信息 2、匹配route，请求接口，处理数据，返回到view 3、默认view及404处理
  // TODO 过滤层等加入
  app.use('/', (req, res) => {
    const isXhr = req.xhr;
    const url = req.path;
    const httpRequest = getRequest(req);

    let pathInfo;
    let routeKeys;
    let route;

    // 两种匹配方法： 1、用filter得到全部匹配； 2、for循环得到一个匹配就终止；
    // 目前按第二种方式
    // TODO 根据req.method再对route分组，减少循环次数
    for (let i = 0, l = routeRegx.length; i < l; i++) {
      const regx = routeRegx[i];
      pathInfo = regx.exec(url);

      if (pathInfo) {
        route = routeMap[routes[i]];
        routeKeys = route.routeKeys;
        break;
      }
    }

    // ajax和非ajax都有两种情况： 匹配到路由和未匹配到路由
    // 无匹配的route配置
    if (!pathInfo) {
      // ajax或非html请求，进行代理转发，否则寻找模板直接渲染，寻找不到模板，返回404
      if (isXhr) {
        return autoProxy(req, res, httpRequest);
      }

      const done = (error, dataMap) => {
        setMember(dataMap, appLocals);
        autoRender(req, res);
      };

      return doRequests(req, [commonAPI], null, null, null, done, logger);
    }

    // 有route匹配
    route = route[getMethod(req)];

    if (!route) {
      throw new Error(`405 ${getMethod(req)} Method Not Allowed`);
    }

    // 是转发
    if (route.proxy) {
      return autoProxy(req, res, httpRequest, route.api);
    }

    // 得到参数
    // 路由的参数将被合并到req.query
    // https://github.com/expressjs/express/blob/master/lib/router/layer.js
    for (let j = 1; j < pathInfo.length; j++) {
      const key = routeKeys[j - 1];
      const prop = key.name;
      const val = decodeParam(pathInfo[j]);

      if (val !== undefined) {
        req.query[prop] = val;
      }
    }

    let queries = Object.assign({}, req.query);
    let params = Object.assign({}, req.body);

    // 提供可以定制get参数的方法
    if (route.query) {
      queries = route.query(queries, req);
    }

    Object.assign(params, queries);

    // 定制post参数的方法
    if (route.params) {
      params = route.params(params, req);
    }
    // 统一参数给req对象
    req.params = params;

    // 无配置view路径，默认为url同名路径
    let view = route.view;
    let routeApi = route.api;

    if (!view) {
      view = url.replace('/', ''); // url需替换掉第一个/
    } else if (typeOf(view).is('function')) {
      view = view(params, req);
    }

    // 补充设置模板内置变量
    // 修改pageid为模板目录名和文件名的拼接
    appLocals.pageId = view.split('/').filter(viewPath => !!viewPath).join('-');
    appLocals.pagePath = view;
    appLocals.title = route.title;

    function commonRender(routeConfig, dataMap) {
      const keys = Object.keys(dataMap);
      const length = keys.length;
      let data = dataMap;
      let result;

      // 判断正常页面访问，返回的api数据中是否需要登录
      if (routeConfig.autoLogin !== false && !isXhr) {
        const needLoginItems = keys.filter(key => data[key].code === config.statusCode.auth);

        if (needLoginItems.length) {
          return res.redirect(`${config.loginPage}?redirect=${encodeURIComponent(url)}`);
        }
      }

      if (length === 1) {
        data = data[keys[0]];
        // 防止后端app返回格式不正确，最主要的是code
        if (typeof data.code === 'undefined') {
          data.code = 500;
        }
      }

      if (routeConfig.handle) {
        result = routeConfig.handle(data, req, res);
      }
      // 返回false，表示handle内部处理响应流
      if (result === false) {
        return false;
      }
      // 如果handle返回新data，原来的data重新赋值
      // handle可以直接处理data的引用并保持data更新
      if (typeof result !== 'undefined') {
        data = result;
      }

      if (isXhr) {
        return res.json(commonJSON(data));
      }
      // 渲染或redirect
      if (data.code === 302) {
        return res.redirect(decodeURIComponent(data.url));
      }
      // 更新title
      appLocals.title = routeConfig.title;

      return res.render(view, data);
    }

    // 未配置接口请求
    if (!routeApi) {
      const done = (error, dataMap) => {
        setMember(dataMap, appLocals);
        commonRender(route, {});
      };

      return doRequests(req, [commonAPI], null, null, null, done, logger);
    }
    // ajax返回data -> json，非ajax返回data -> view, 中间过程一样
    // 获取api地址，发送api，有多个api需求
    // 每个请求的数据以处理后的apiUrl命名，保持数据识别
    if (typeOf(routeApi).is('function')) {
      routeApi = routeApi(params, req);
    }

    const apiPaths = Array.isArray(routeApi) ? routeApi : [routeApi]; // 配置为数组或字符串

    // 增加公共api请求
    if (!isXhr) {
      apiPaths.push(commonAPI);
    }

    function onComplete(error, data, response) {
      setCookie(req, res, response);
    }

    function allDone(error, results) {
      if (!isXhr) {
        setMember(results, appLocals);
      }

      commonRender(route, results);
    }

    return doRequests(req, apiPaths, queries, params, onComplete, allDone, logger);
  });
};
