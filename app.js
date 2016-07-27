const path = require('path');
const domain = require('domain');

const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const swig = require('swig');
const compression = require('compression');
const tracer = require('tracer');

const log = require('./libs/log.js');
const browser = require('./libs/browser');
const fileUtils = require('./libs/fileUtils');
const lang = require('./libs/lang');
const typeOf = require('./libs/typeof');
const math = require('./libs/math');

const init = require('./init');

const app = express();

const assetsPath = '/assets';
const docPath = '/doc';
const ieSupportVersion = 9;
const env = process.env.NODE_ENV || 'development';
const isProduction = env === 'production';
const config = require('./config.js');

const logger = tracer.dailyfile({ root: `./logs/${env}`, maxLogFiles: 10 });

function renderError(error, req, res) {
  const errorInfo = error.toString();

  logger.error('500-error', JSON.stringify(req.headers, null, 2), req.originalUrl, errorInfo);

  res.render('500', {
    'error': isProduction ? '您访问的页面暂时受限，请联系客服或浏览其他页面' : errorInfo
  });
}

function redirect(url) {
  return { code: 302, url };
}

global.app = app;
global.logger = logger;
global.Redirect = redirect;

// var package = require('./package.json');
// 设置gzip压缩
app.use(compression());
// middleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());
// app.use(express.methodOverride());
// app.use(session({
//   secret: 'lianjie-pc',
//   resave: false,
//   saveUninitialized: true,
//   cookie: { secure: true }
// }))
app.use(cookieParser());
// used for uncaughExcption，不会因未捕捉的异常导致服务器内存占用
// app.use(connectDomain);
// nginx代理转发后，要获取正确host需要：
app.set('config', config);
app.set('trust proxy', 'loopback');
app.set('query parser', 'extended');
app.engine('swig', swig.renderFile);
app.set('view engine', 'swig');
app.set('views', `${__dirname}/views`);
app.set('viewExt', '.swig');
// 设置模板
// 开发模式下设置缓存false，生产环境应设为true
const swigDefaults = {
  loader: swig.loaders.fs(app.get('views'))
};
if (!isProduction) {
  swigDefaults.cache = false;
}
swig.setDefaults(swigDefaults);
// 东八区时间，单位 分钟
swig.setDefaultTZOffset(-8 * 60);
// 内置变量
const appLocals = {
  'cssPath': `${assetsPath}/css/pages`,
  'jsPath': `${assetsPath}/js`,
  'imgPath': `${assetsPath}/image`,
  'defaultImgPath': `${assetsPath}/image/common/default-img.jpg`,
  'defaultImgPath_w1h1': `${assetsPath}/image/common/default_w1_h1.png`,
  'staticPath': `${assetsPath}/static`,
  config
};

const fileMapJson = ['js', 'css'].map(type => {
  const mapJson = require(`.${assetsPath}/${type}-map.json`); // eslint-disable-line global-require
  const newMapJson = {};

  Object.keys(mapJson).map(key => {
    const pageUrl = key.replace(path.extname(key), '');
    const name = `${type}Path`;

    newMapJson[pageUrl] = `${appLocals[name]}/${mapJson[key]}`;

    return name;
  });

  return newMapJson;
});

appLocals.jsMap = fileMapJson[0];
appLocals.cssMap = fileMapJson[1];
// 自定义filter
// 阿里云图片的缩略图
swig.setFilter('thumb', (input, size = 'small', crop) => {
  if (!input || input.indexOf('aliyuncs.com') < 0) {
    return input;
  }
  // 修正域名，img-cn域名才可以接受缩略图参数
  const image = input.replace('oss-cn', 'img-cn');
  const alias = {
    'full': 1600,
    'large': 960,
    'medium': 480,
    'small': 280,
    'tiny': 120,
    'micro': 48
  };
  const cropParam = crop ? '_1c_1e' : '';

  let sizeParam = size;
  if (alias[size]) {
    sizeParam = alias[size];
  }

  if (typeOf(sizeParam).is('number')) {
    sizeParam = `${sizeParam}w_${sizeParam}h`;
  }

  return `${image}@${sizeParam}${cropParam}`;
});
// 默认项目，资源图片
const defaultCoverDivisor = {
  'project': 10,
  'resource': 7
};
// 设置项目，资源在无图片的时候显示默认图，一般是抓取的数据缺失图片
swig.setFilter('defaultCover', (input, id, type = 'project') => {
  if (input) {
    return input;
  }

  const remainder = id % defaultCoverDivisor[type];
  const defaultUrl = `${appLocals.imgPath}/default/${type}/${remainder}.png`;

  return defaultUrl;
});
// 金钱转换过滤器，目前只支持万和分的互相转换
const coin = 1;
const yuan = 100 * coin;
const wanYuan = 10000 * yuan;
const unitMap = {
  '万': wanYuan,
  '元': yuan,
  '分': coin
};
swig.setFilter('money', (input, unit = '万', isInput = false) => {
  let money = +input;
  let unitShow = unit;
  let method = 'div';

  if (isInput) {
    method = 'mul';
    unitShow = '';
  }

  money = math[method](money, unitMap[unit]);

  return `${money}${unitShow}`;
});

fileUtils.walkSync('./libs/tags', (e, paths) => {
  const tag = require(`${__dirname}/${paths}`); // eslint-disable-line global-require

  swig.setTag(lang.hyphen(path.basename(paths, '.js')), tag.parse, tag.compile);
});

// 静态文件处理
app.use('/assets', express.static(`${__dirname}${assetsPath}`));
app.use('/doc', express.static(`${__dirname}${docPath}`));
app.use('/upload-files', express.static('upload-files'));

// 设置APP变量
app.set('rootPath', __dirname);
app.set('assetsPath', assetsPath);

// 错误处理
app.use('/', (req, res, next) => {
  if (!isProduction) {
    return next();
  }

  const reqDomain = domain.create();
  // next抛出的异常在这里被捕获,触发此事件
  reqDomain.on('error', e => renderError(e, req, res));

  return reqDomain.run(next);
});

app.use('/', (req, res, next) => {
  const profile = browser(req);
  const ieLowwer = profile.ie && profile.version < ieSupportVersion;

  const pathes = req.path.split('/').filter(item => !!item);
  const pageId = pathes.join('-');
  const moduleName = pathes[0] || 'home';

  // 检查低版本ie
  if (ieLowwer && pageId !== 'kill-ie') {
    return res.redirect('/kill-ie');
  }

  // 为模板注入变量
  appLocals.request = req;
  appLocals.moduleName = moduleName;
  appLocals.pageId = pageId;
  appLocals.pathes = pathes;
  appLocals.pagePath = pathes.join('/');

  swig.setDefaults({
    locals: {
      'app': appLocals
    }
  });

  return next();
});

// init routes
init(app, appLocals);

app.listen(config[env].port, () => {
  const startInfo = `server run at http:\/\/localhost:${config[env].port}`;

  log.info(startInfo);
  logger.info(startInfo);
});
