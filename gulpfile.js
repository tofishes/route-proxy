'use strict';

var gulp = require('gulp');

var cp = require('child_process')
, path = require('path')
, os = require('os')
, fs = require("fs");

var fileUtil = require('./libs/fileUtils.js');

var tmodjs = require('gulp-tmod')
, rename = require('gulp-rename')
, stylus = require('gulp-stylus')
, base64 = require('gulp-css-base64')
, bootstrap = require('bootstrap-styl')
, gutil = require('gulp-util')
, copy = require('gulp-copy-ext')
, clean = require('gulp-clean')
, sourcemaps = require('gulp-sourcemaps')
, cleanCss = require('gulp-clean-css') // 压缩css
, uglify = require('gulp-uglify')
, rev = require('gulp-rev')
, appConfig = require('./config')
, webpackStream = require('webpack-stream')
, webpack = require('webpack')
, browserSync = require('browser-sync').create();

const isWindows = os.type() === 'Windows_NT';
// new AssetsPlugin({
//         path: distPath,
//         filename: 'assets.json',
//         prettyPrint: true
//       })

var srcPath = `${__dirname}/src`
, distPath = './assets';

const env = process.env.NODE_ENV || 'development';
const isProduction = env === 'production';

var uglifyPlugin = new webpack.optimize.UglifyJsPlugin({
  test: /(\.jsx|\.js)$/,
  compress: {
    warnings: false
  }
});

var base64Config = {
  maxWeightResource: 20 * 1024 // 20k
  // extensionsAllowed: ['.gif', '.jpg', '.png']
};

var stylusConfig = {
  'include css': true,
  use: [bootstrap()],
  rawDefine: {
    '$app-config': appConfig
  }
};

var pagesPath = {
  'js': `${srcPath}/js/pages`,
  'css': `${srcPath}/css/pages`
};
var entryMap = {
  'js': {
    'common': `${srcPath}/js/common/entry.js`
  },
  'css': {}
};

function updateEntryMap() {
  Object.keys(pagesPath).map((type) => {
    fileUtil.walkSync(pagesPath[type], (err, file) => {
      entryMap[type][path.parse(file).name] = file;
    })
  });
}

updateEntryMap();
// 根据webpack处理的chunks信息生成所需的js map对应关系
function jsMapJSON() {
  this.plugin("done", function(stats) {
    var mapJson = stats.toJson()
    , chunks = mapJson.chunks
    , jsMap = {}
    , base = './src/js/pages/';
    chunks.map(chunk => {
      chunk.files.map((hashFileName, index) => {
        let origin = chunk.origins[index]

        if (origin.name === 'common') {
          jsMap.common = hashFileName;
          return;
        }
        let module = origin.moduleName.replace(base, '');
        let pathId = module//.replace(/\.js/, '').replace(/\//g, '-');

        jsMap[pathId] = hashFileName;
      })
    });

    fs.writeFileSync(path.join(distPath, "js-map.json"), JSON.stringify(jsMap));
  });
};

var webpackConfig = {
  entry: entryMap.js,
  devtool: isProduction ? null : 'eval',
  output: {
    filename: '[name].[chunkhash:8].js'
  },
  resolve: {
    root: [
      path.resolve('./src/js'),
      path.resolve('./src/template')
    ]
  },
  plugins: [jsMapJSON, uglifyPlugin],
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel?presets[]=es2015'
      },
      {
        test: /\.html$/,
        loader: "tmodjs"
      },
      {
        test: /\.css$/,
        loader: "style-loader!css-loader"
      },
      {
        test: /\.styl$/,
        loader: 'style-loader!css-loader!stylus-loader'
      },
      {
        test: /\.js$/,
        loader: "source-map-loader"
      }
    ]
  },
  // 添加了此项，则表明从外部引入，内部不会打包合并进去
  externals: {
    'app-config': JSON.stringify(appConfig),
    'jquery': 'window.jQuery',
    'lj': 'window.lj',
    'moment': 'window.moment',
    'api': 'window.api',
    'modal': 'window.modal',
    'tmodjs-loader/runtime': 'window.template', // webpack tmodjs-loader的全局依赖
    'template': 'window.template'
  },
  stylus: stylusConfig
};

gulp.task('update-entry', () => {
  updateEntryMap();
  return null;
});

gulp.task('js', () => {
  return gulp.src(entryMap.js.common)
    .pipe(webpackStream(webpackConfig))
    .pipe(gulp.dest(`${distPath}/js`));
});
gulp.task('js-pages', () => {
  var jsSrc = Object.keys(entryMap.js).map(key => entryMap.js[key]);

  return gulp.src(jsSrc)
    .pipe(webpackStream(webpackConfig))
    .pipe(gulp.dest(`${distPath}/js`));
});

function swallowError(error) {
  console.log(error.toString());
  this.emit('end')
}

// gulp.task('css-common', ()=>{
//   return gulp.src([`${srcPath}/css/common/common.styl`])
//     .pipe(sourcemaps.init())
//     .pipe(stylus(stylusConfig))
//     .on('error', swallowError)
//     .pipe(base64(base64Config))
//     .pipe(cleanCss())
//     .pipe(rev())
//     .pipe(sourcemaps.write('.'))
//     .pipe(gulp.dest(`${distPath}/css`))
//     .pipe(rev.manifest({
//       path: 'css-map.json',
//       merge: true
//     }))
//     .pipe(gulp.dest(distPath)); // write manifest to build dir;
// })

gulp.task('css', () => {
  var stream = gulp.src([`${srcPath}/css/pages/**/*`, `${srcPath}/css/common/common.styl`])
    .pipe(sourcemaps.init())
    .pipe(stylus(stylusConfig))
    .on('error', swallowError)
    .pipe(base64(base64Config))
    .pipe(cleanCss())
    .pipe(rev())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(`${distPath}/css/pages`))
    .pipe(rev.manifest({
      path: 'css-map.json',
      merge: true
    }))
    .pipe(gulp.dest(distPath)); // write manifest to build dir;

  return stream;
});
// gulp.task('css', ['css-common', 'css-page']);

gulp.task('copy', () => {
  ['image', 'static'].map((type) => {
    return gulp.src(`${srcPath}/${type}/**/*`)
    .pipe(copy())
    .pipe(gulp.dest(`${distPath}/${type}`))
  });
});

var templateBase = `${srcPath}/template`;
var templateOutput = './tpl';
// production
gulp.task('art-tpl-simple', function(){
  var stream = gulp.src([`${templateBase}/**/*.html`, '!**/*.native.html'])
    .pipe(tmodjs({
      templateBase: templateBase,
      type: 'commonjs',
      helpers: './libs/art-template-helpers.js'
    }))
    .pipe(gulp.dest(templateOutput));
  return stream;
});
gulp.task('art-tpl-native', function(){
  var stream = gulp.src([`${templateBase}/**/*.native.html`])
    .pipe(tmodjs({
      templateBase: templateBase,
      type: 'commonjs',
      syntax: 'native'
    }))
    .pipe(gulp.dest(templateOutput));
  return stream;
});
gulp.task('art-tpl', ['art-tpl-simple', 'art-tpl-native'])

var baseTasks = ['art-tpl', 'css', 'js-pages', 'copy'];

gulp.task('server', baseTasks , () => {
  var options = { shell: true, stdio: 'inherit' }
  if (isWindows) {
    cp.spawn(isProduction ? 'node' : 'node-dev.cmd', ['app'], options);
  } else {
    cp.spawn('npm', ['run', 'app'], options)
  }
});
gulp.task('server-pm2', baseTasks , () => {
  var options = { shell: true, stdio: 'inherit' }
  cp.spawn('pm2', ['start', 'process.json'], options);
});

gulp.task('browser-sync', () => {
  setTimeout(function () {
    browserSync.init({
      proxy: "localhost:8000",
      browser: "google chrome",
      open: false,
      files: [`${srcPath}/**/*`, './views/**/*', './routes/**/*']
    });
  }, 1000);
});
gulp.task('server-sync', ['server', 'browser-sync']);

gulp.task('watcher', () => {
  gulp.watch([`${srcPath}/template/\*.html`, `${srcPath}/js/pages/**/\*`], ['update-entry', 'js-pages', 'art-tpl']);
  gulp.watch(`${srcPath}/js/common/\*.js`, ['update-entry', 'js']);
  gulp.watch([`${srcPath}/css/pages/**/\*`, `${srcPath}/css/common/**/\*`], ['update-entry', 'css']);
  gulp.watch([`${srcPath}/image/**/*`, `${srcPath}/static/**/*`], ['update-entry', 'copy']);
});

gulp.task('clean', () => {
  return gulp.src(distPath).pipe(clean());
});

gulp.task('default', ['clean'], () => {
  gulp.start('server-sync', 'watcher');
});

gulp.task('production', ['clean'], () => {
  gulp.start('server-pm2');
});

gulp.task('dev', ['clean', 'js', 'css'], function(){
  gulp.start('watcher', 'browser-sync')
});
