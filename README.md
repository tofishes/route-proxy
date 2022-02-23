# 技术说明

## 开发环境

* 首先安装nodejs, node-dev[https://github.com/fgnass/node-dev], gulp[https://github.com/gulpjs/gulp/blob/master/docs/getting-started.md]
* 使用git克隆项目： git clone this.git
* 然后安装全局模块：
* npm install -g node-dev
* npm install -g gulp-cli
* npm install -g tmodjs
* 最后安装本地模块：
* npm install 安装当前项目的依赖模块

## 线上环境
* 需安装 git(内网), nodejs, gulp-cli tmodjs pm2 -g
* centos安装步骤
```
# install nodejs
curl --silent --location https://rpm.nodesource.com/setup_4.x | bash -
yum install -y nodejs
# install git
wget https://github.com/git/git/archive/v2.9.0.tar.gz
# 安装依赖
yum install curl-devel expat-devel gettext-devel openssl-devel perl-devel zlib-devel gcc asciidoc xmlto docbook2X
ln -s /usr/bin/db2x_docbook2texi /usr/bin/docbook2x-texi
# 编译源码
make configure
./configure --prefix=/usr/local
make all doc info
make install install-doc install-html install-info
```

### git基本使用
```
# clone项目
git clone git-remote
# 添加文件更改
git add .
# 提交更改到本地
# 必须有一个合适的消息前缀： add|update|delete|fix
git commit -m 'update 提交内容'
# push到服务器
git push
# 拉取服务器最新修改
git pull
```

## 启动项目
首次启动项目前执行 `gulp init`， 只执行一次即可;
每次执行 `gulp` 或者 `npm start`, 浏览器访问： http://localhost:3000/

## Nodejs端使用

* express框架
* swig模板引擎 [http://paularmstrong.github.io/swig/docs]
* ~~superagent作为HTTP API请求库 [http://visionmedia.github.io/superagent/]~~
* http api请求使用request库，更适合某些场景 [github.com/request/request]
* express-resource, 暂未使用 [http://github.com/expressjs/express-resource]
* logger, 使用tracer

## Browser端使用

* 基础样式normalize.css [https://github.com/necolas/normalize.css/blob/master/normalize.css]
* ~~样式库 pure.css~~
* 基础js库 jQuery

## 两端共用

* artTempate

## 编码规范 - AirBnb规范

查看： [https://oucliuliu.gitbooks.io/airbnb-front-end-style-guide/content/es5_style_guide.html]
<br>
原版： [https://github.com/airbnb/javascript]

基本规范： 一个tab设置为两个空格替代，html和css中不出现下划线_，使用中划线-做连字符，js命名使用驼峰规则。
命名原则上不允许出现数字等不明语义的词。

例如：

```
<div id="header-login">
  <div id="login-name"></div>
</div>

#header-login { color: green; }

var headerLogin = document.getElementById('header-login');
```

## 开发注意：

* *[编写让别人能够读懂的代码](http://www.cnblogs.com/richieyang/p/4840614.html)*

* 理解normalize.css的样式统一思想，每个标签应有的样式不变。
* 编译工具将自动处理css中引入的小图片，转换为base64编码，因此不需要自己切雪碧图
* css使用了stylus预处理引擎

* 每完成一个小功能或一个页面就可以提交一次git，当push时发现远程有更新，执行 git pull --rebase操作，否则就直接push

* swig模板中的文件引入路径，可以直接相对于/views文件夹，比如 /views/common/a.swig 在/views/member/b.swig中的引入路径可以是： {% extends 'common/a.swig' %}

* swig模板中可以直接用到内置变量app：
``
app = {
  'cssPath': [String],  // 样式路径
  'jsPath': [String],  //  js路径
  'imgPath': [String],  // 图片路径
  'staticPath': [String],  // 静态文件路径， 是指引入 ./src/static 中的文件
  'config': config配置对象, // 全局配置， 详见config.js
  'jsMap': [object Object],
  'cssMap': [object Object],
  'request': [Object],  // 本次的请求对象，是express request对象的引用
  'moduleName': [String],  // 模块名，例如 /member/profile/1 的模块名为 member
  'pageId': [String],  // 页面id，例如 /member/profile.swig 模板文件渲染 的页面id为 member-profile
  'pathes': [String],  // 路径数组，例如 ['member', 'profile', '1']
  'pagePath': demo/empty, // 页面view文件路径
  'isLogined': [boolean], // 是否已登录
  'member': [object Object], // 用户信息
}
``
* src/js目录下 name-config.js 用于名称定义，比如token的cookie名， 可两端共用
* 项目根目录下 config.js 用于项目全局配置，比如 api域名

* nodejs返回的API格式约定如下：

``
/**
 * API请求前缀： /api
 * 响应的json格式
 * {
 *   code: 0,           // 响应状态码，成功为0，不成功则为其他数值
 *   success: true,     // 响应是否成功
 *   data: [Object],    // 返回的数据
 *   time: [Date.now()] // 服务器时间
 * }
 */
``

* logger使用： logger.info 记录服务器启动信息  logger.log 记录请求响应信息  logger.error 记录报错

## 了解项目开发流程

* 项目各目录作用，nodejs端有哪些目录，前端有哪些目录
* 前端编译的源和结果
* express的模板swig设置，swig文件相互引用从根目录开始。
* swig模板的置入变量有哪些
* 同构模板的使用
* js的依赖关系
* js组件开发目录及使用
* js全局对象lj
* stylus的目录约定
* 开始第一个页面

## api接口地址在开发过程中的配置

在config.dev.js中修改，该文件由 gulp init 命令来生成

## route配置
整个nodejs转发由 app.use('/') 定义，在其中做各种路由匹配，格式如下：

``
// @TODO
// 可能存在的问题： 1、一个api请求多次；2、不同api传递不同参数
``

``
module.exports = {
  '/tender': {
    autoLogin: false // 关闭自动检查登录状态并跳转到登录页
  },
  '/login': {  // 配置路由
    'get': {  // 使用get请求
      'handle': function (data) {  // handle方法用于处理api请求后的数据，并可以返回数据给view
        var data = {
          'loginForm': loginForm({})
        };

        // 注意，使用 this.title 设置页面title，则handle不能使用箭头函数，必须是普通函数
        this.title = '登录页'; // 可以根据数据来设置页面title，会覆盖下面的title设置

        return data;
      },
      'view': 'public/login', // 定义模板文件
      'title': '登录' // 设置页面的title
    },
    'post': { // 使用post请求
      'api': '/front/login/', // 定义需要请求的api路径，可以是字符串或数组（当需要多个api时）,也可以是函数，返回数组或字符串
      'query': (query) => { // query方法处理后的参数会传递给get请求的后端地址
        return {
          pageSize: 10,
          page: 1
        }
      },
      'params': (params) => { // params方法处理后的参数会传递给post请求的后端地址, 包含query方法的参数
        params.uuid = uuid.v4();
        return params;
      },
      'handle': (data) => {
        if (data.success) {
          return Redirect('/member/profile'); // 返回一个Redirect，比如登录成功，重定向至另外一个页面
        }

        return {
          'loginForm': loginForm(data) // 未登录成功，返回一些错误数据给view
        };
      },
      'view': 'public/login'
    }
  },
  '/api/login': {
    'post': {
      'api': '/front/login/',
      'params': (params) => {
        params.uuid = uuid.v4();
        return params;
      },
      'handle': (data, req, res) => {
        if (data.code === 0) {
          return {
            url: getDefaultPath(req)
          }
        }
        return data;
      }
    }
  }
}
``
需要注意，一个路由定义了 api数组 请求，则返回的数据由多个经处理的api路径为key的对象组成。
例如： 配置了
``
api: ['/front/res/list', '/front/user']
``
则在配置的handle方法中或view模板中的数据为：
``
{
  _front_res_list: {},
  _front_user: {}
}
``
意即 api路径的斜线 / 替换为下划线 _


## 常见问题

* 调试nodejs输出，1、使用logger记录至文件；2、使用 gulp dev 和 node-dev app.js 两个命令组合，console输出

* 编译报错：Module not found: Error: a dependency to an entry point is not allowed， 是指require的js文件，同时也是webpack的entry设置中的一个文件，两者不能共存。

* superagent问题：使用pipe(res)方法可以转发请求，但是不能处理响应headers，cookie等，遇到验证码图片'transfer-encoding': 'chunked'时不能正常响应，一直pending。

* request 更容易处理公共配置，转发完整的headers。

* 后端api的请求数据格式为json，普通的form data格式不行。

* 接口报错，比如登录接口：
``
// 暂时发现是由于传递了x-token=空字符串导致的
{
  code: 1004001
  message: "internal error"
}
``
