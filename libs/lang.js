(function(root, factory) {
  if(typeof define === 'function' && define.amd) {
    define([], function() {
      return factory(root)
    });
  } else if(typeof module === 'object' && module.exports) {
    module.exports = factory(root)
  }
})(global, function(global){
  var $ = global.$ || {};
  // 这个空对象是内部用的
  var emptyObj = {}

  // 这个正则很常用
  $.rword = /[^, |]+/g;

  if (typeof $.camelCase !== 'function') {
    var rmsPrefix = /^-ms-/,
      rdashAlpha = /-([\da-z])/gi,
      fcamelCase = function( all, letter ) {
        return letter.toUpperCase();
      };
    /**
     * 将字符串转换为驼峰形式
     * @param string
     * @returns {string}
     */
    $.camelCase = function (string) {
      return string.replace(rmsPrefix, "ms-").replace( rdashAlpha, fcamelCase );
    }
  }

  /**
   * 将字符串转换为大驼峰形式
   * @param name
   * @returns {string}
   */

  $.upperCamelCase = function (name){
    return name.charAt(0).toUpperCase() + $.camelCase(name).substr(1)
  }

  var rhyphen = /[^a-z0-9]?([A-Z0-9])/g,
    fhyphen = function (m, w) {
      return '-' + w.toLowerCase();
    };

  /**
   * 将字符串转换为横杠联结形式
   * @param string
   * @returns {string}
   */
  $.hyphen = function ( string ){
    return string.replace( rhyphen, fhyphen );
  }

  /**
   * 判断对象是否有自身的key属性
   * @param obj
   * @param key
   * @returns {boolean}
   */
  $.hasOwn = function (obj, key) {
    return emptyObj.hasOwnProperty.call(obj, key)
  }


  /**
   * hasOwn返回true时，返回该key的值
   * @param obj
   * @param key
   * @returns {*}
   */

  $.own = function(obj, key){
    if ($.hasOwn(obj, key)) return obj[key]
  }

  /**
   * 返回变量类型
   * @param obj
   * @param type
   * @returns {boolean|string}
   */
  $.stringType = function (obj, type) {
    var result = emptyObj.toString.call(obj).slice(8, -1);
    if (type) result = !!result.match(RegExp(type, 'gi'));
    return result;
  }


  /**
   * 允许类似function的apply来apply一个构造器
   * @param constructor
   * @param args
   */
  $.constrApply = function constrApply(constructor, args) {
    var pram1 = '';
    var pram2 = '';
    for (var i = 0; i < args.length; i++) {
      pram1 += 'var p' + i + ' = args[' + i + '];';
      pram2 += i == 0 ? 'p' + i : ',p' + i;
    }
    return (new Function('constructor', 'args', pram1 + 'return new constructor(' + pram2 + ')'))(constructor, args)
  }

  if (typeof $.each != 'function') {

    /**
     * 遍历一个对象或者数组
     * @param obj
     * @param iterator
     * @returns {*}
     */
    $.each = function each(obj, iterator) {
      var i;
      if ($.isArrayLike(obj)) {
        for (i = 0; i < obj.length; i ++) {
          if (iterator(i, obj[i]) === false) break;
        }
      } else {
        for (i in obj) {
          if ($.hasOwn(obj, i)) {
            if (iterator(i, obj[i]) === false) break;
          }
        }
      }
      return obj
    }
  }

  if (typeof $.isWindow != 'function') {
    /**
     * 判断对象是否是window
     * @param obj
     * @returns {boolean}
     */
    $.isWindow = function (obj) {
        return obj != null && obj === obj.window;
      }
  }

  if (typeof $.isPlainObject != 'function') {
    $.isPlainObject = function (obj) {
      if (typeof obj !== "object" || obj.nodeType || isWindow(obj)) {
        return false;
      }
      return !(obj.constructor && !hasOwn(obj.constructor.prototype, "isPrototypeOf"));
    }
  }

  /**
   * 判读对象是否是类似jQuery对象
   * @param node
   * @returns {boolean}
   */

  $.isQueryElement = function (node) {
    return !!(node &&
    (node.nodeName
    || (node.prop && node.attr && node.find)));

  }

  /**
   * 判读对象是否是一个类对象
   * @param obj
   * @returns {boolean}
   */
  $.isObjectLike = function (obj) {
    return typeof obj == 'object' || typeof obj == 'function';
  }

  /**
   * 判断一个对象是否是类数组
   * @param obj 需要判断的对象
   * @param includeString 是否包含字符串
   * @returns {*}
   */
  $.isArrayLike = function isArrayLike(obj, includeString) { //是否包含字符串
    var type = $.stringType(obj);
    if (includeString && type === "string") {
      return true;
    }
    switch (type) {
      case "Array" :
      case "Arguments":
      case "NodeList":
      case "Collection":
      case "StaticNodeList":
      case "HTMLCollection":
        return true;
    }
    if (type === "Object") {
      var i = obj.length;
      return typeof obj.callee == 'function' || obj.namedItem || (i >= 0) && (i % 1 === 0) && ($.hasOwn.call(obj, '0') || typeof obj.each == 'function' || typeof obj.forEach == 'function'); //非负整数
    }
    return false;
  }
  
  $.isEmptyObject = $.isEmptyObject || function( obj ) {
      var name;
      for ( name in obj ) {
        return false;
      }
      return true;
    }

  function keyParse (str){
    return str.split(/[[\].]/);
  }

  function keyStringify(arr, useBracket, withQuote){
    if (withQuote == undefined) withQuote = true;
    return $.reduce(arr, function(memo, key, i) {
      if (i == 0) return memo + key;
      else if ($.type(key) == 'number') {
        return memo + '[' + key + ']';
      } else if (!useBracket) {
        return memo + '.' + key
      } else if (withQuote) {
        return memo + '["' + key + '"]'
      } else {
        return memo + '[' + key + ']'
      }
    }, '')
  }

  /**
   * 反射字符串，并返回对应的对象和键，比如reflect(window, 'document.body')则会返回[window.document, 'body']
   * @param target 需要反射的对象
   * @param name 返回
   * @param create 当不存在该对象时，则构造这个对象
   * @returns {*[]}
   */
  function reflect(target, name, create) {
    var arrayKey = '!@#%'
    var a = [], obj, s, tmp;
    if (name.indexOf('[]') > -1 &&  name.indexOf('[]') < name.length - 2) {
      throw Error('[] must be the last word of reflect name: ' + name);
    }
    name = name.replace('[]', '[' + arrayKey + ']');
    a = keyParse(name.replace(/[[\].]$/, ''));


    var i = 0;
    obj = target;
    for(;i < a.length - 1; i++) {
      s = a[i];
      if (s == '') {
        a.splice(i, 1);
        continue
      }
      var nextKey = a[i + 1];
      if ((tmp = obj[s]) == null && create) {
        var isArray = nextKey == arrayKey || parseInt(nextKey) == nextKey;
        if (isArray)
          obj[s] = [];
        else
          obj[s] = {}
        tmp = obj[s];
      }
/*
      else {
        // 如果不是create， 则抛出异常
        throw Error('can not read ' + name + ' of target')
      }
*/
      obj = tmp;
    }
    var key = a.pop();
    if (key == arrayKey) {
      key = obj.length;
    }
    return [obj, key]
  }

  function reflectVal(target, name, defaultVal) {
    var ret
    try {
      var ref = reflect(target, name);
      ret = ref[0][ref[1]];
    } catch (e) {
      ret = defaultVal
    }
    return ret;
  }

  function baseExtend(target, source, options){
    options = options || {};
    var create = options.create,
      deep = options.deep,
      keepArrRef = options.keepArrRef,
      ignore = options.ignore || [];
    target = target || {};
    $.each(source, function(_, item){
      $.each(item, function(key, value){
        var tmp, obj;
        if (value == undefined) return;
        if (/[\[\]\.]/.test(key)) {
          try {
            tmp =  reflect(target, key, create);
          } catch(e) {
            tmp = undefined;
          }
        }

        if (tmp && typeof tmp[0] == 'object') {
          obj = tmp[0];
          key = tmp[1];
        } else {
          obj = target
        }
        tmp = null;
        if (!!~ignore.indexOf(key)) return;

        if($.isArrayLike(obj) && deep) {
          if (key == parseInt(key)) {
            key = parseInt(key);
            // 处理a[]这种情况下，推进数组
            if (!$.isArrayLike(value)) {
              value = [value];
            }
            // 当位数不足时，补足undefined
            while(key > obj.length) {
              obj.push(undefined)
            }
            [].splice.apply(obj, [key, 0].concat([].slice.call(value)))
          } else if (keepArrRef) {
            [].slice.apply(obj, [0, obj.length].concat([].slice.call(value)))
          }
        } else if (typeof obj[key] == 'object' && typeof value == 'object' && deep) {
          if ($.stringType(value, 'date')) {
            obj[key] = new Date(value.valueOf());
          } else if ($.stringType(value, 'regexp')) {
            obj[key] = new RegExp(value);
          } else if (value.nodeName) {
            obj[key] = value.cloneNode(true);
          } else if ($.isQueryElement(value)) {
            obj[key] = value.clone();
          } else if ($.isArrayLike(obj[key])){
            obj[key] = baseExtend.call(this, [], [obj[key], value]);
          } else {
            obj[key] = $.isPlainObject(obj[key]) ?
              baseExtend.call(this, {}, [obj[key], value], options) :
              // Don't extend strings, etc. with objects
              baseExtend.call(this, {}, [value], options);
            // Copy everything else by reference
          }
        } else  {
          obj[key] = value;
        }

      })
    })
    return target;

  }

  $.reduce = function (o, iterator, memo) {
    return Object.keys(o).reduce(function (memo, key) {
      return iterator.call(null, memo, o[key], key, o)
    }, memo);
  }
  $.indexWhere = function (value, iterator) {
    var ret = -1;
    $.each(value, function (i, item) {
      if (iterator.call(value, item)) {
        ret = i;
        return false;
      }
    });
    return ret;
  }

  $.indexAllWhere = function (value, iterator) {
    var ret = [];
    $.each(value, function (i, item) {
      if (iterator.call(value, item)) {
        ret.push(i);
      }
    });
    return ret;
  }

  $.where = function (value, iterator) {
    return value[$.indexWhere(value, iterator)];
  }

  $.whereAll = function (value, iterator) {
    return $.indexAllWhere(value, iterator).map(function(item){
      return value[item]
    })
  }

  if (typeof $.extend !== 'function') {
    $.extend = function(){
      var args = [].slice.call(arguments);
      var deep, target;
      if ($.stringType(args[0]) == 'Boolean'){
        deep = args.shift();
      }
      target = args.length > 1 ? args.shift() : this;
      return baseExtend(target, args, {
        deep: deep
      });
    }
  }

  $.extend($, {
    mix: function(){
      var args = [].slice.call(arguments);
      var target = args.length > 1 ? args.shift() : this;
      return baseExtend(target, args, {
        deep: true,
        create: true,
        keepArrRef: true,
        ignore: ['$$hashKey']
      })
    },
    setAsGroup: function (obj, key, item) {
      if (!(key in obj)) {
        obj[key] = item;
        return
      }
      if (!$.isArray(obj[key]))
        obj[key] = [obj[key]];
      obj[key].push(item);
    },
    keyParse: keyParse,
    keyStringify: keyStringify,
    reflect: reflect,
    reflectVal: reflectVal,
    stringType: function (obj, type) {
      var result = emptyObj.toString.call(obj).slice(8, -1);
      if (type) result = !!result.match(RegExp(type, 'gi'));
      return result;
    },
    flatten: function (obj, combine) {
      var a = {};

      function s(name, obj, b) {
        if ($.type(obj) == 'object' || $.isArray(obj)) {
          $.each(obj, function (i, item) {
            s((combine && $.isArray(obj) && typeof item != 'object') ? (name + '[]') : (name + '[' + i + ']'), item, b);
          })
        } else $.setAsGroup(b, name, obj)

      }

      $.each(obj, function (key, item) {
        s(key, item, a);
      });
      return a;
    }
  })
  /**
   * 序列化，通过对象或数组产生类似cookie、get等字符串
   * @method armer.serialize
   * @static
   * @param {Object|Array.Object} obj
   * @param {string} [separator] 分割符，默认【&】
   * @param {string} [assignment] 赋值符，默认【=】
   * @param {string|function} [join] 数组类型的合并符，默认【,】，或者是合并方法
   * @param {boolean} [encode] 是否进行编码, 默认true
   * @returns {Object}
   */

  $.serialize = function () {
    // 猜测值返回不同结果
    function assume(value) {
      if ('undefined' == typeof value) return;
      else if (null == value) return '';
      else if ('object' != typeof value) return value;
      else return JSON.stringify(value);
    }

    function buildParams(i, value, assignment, add) {
      var k;
      if ($.isArray(value)) {
        if (typeof value[0] == 'object') {
          add(i, assume(value), assignment)
        } else {
          $.each(value, function (_, value) {
            k = assume(value);
            if (k !== void 0) add(i + '[]', k, assignment);
          });
        }
      } else if ($.isPlainObject(value)) {
        var k = assume(value);
        if (k !== void 0) add(i, k, assignment);
      } else if ($.isFunction(value)) {
        return;
      } else if ('object' != typeof value) {
        value = value == null ? '' : value;
        add(i, value, assignment);
      }
    }

    return function serialize(obj, separator, assignment, join, encode) {
      if (join == null) {
        join = ',';
      }
      if (typeof obj == 'string' && obj == '' || obj == null) return '';
      else if ($.isArrayLike(obj)) {
        return serialize.call(this, $.serializeNodes(obj, join), separator, assignment, join, encode);
      } else if ('object' == typeof obj) {
        separator = separator || '&';
        assignment = assignment || '=';
        encode = encode == undefined ? true : encode;
        var s = [],
          arrSeparator,
          add = function (key, value, assignment) {
            s.push(key + assignment + (encode ? encodeURIComponent(value) : value))
          },
          resource = $.extend({}, obj);
        if (typeof join == 'string') {
          arrSeparator = join;
          join = function (a) {
            if (typeof a[0] == 'object')
              return a
            else
              return a.join(arrSeparator);
          }
        }
        if (typeof join == 'function') {
          for (var i in resource) {
            if ($.isArray(resource[i]))
              resource[i] = join(resource[i]);
          }
        }
        $.each(resource, function (i, value) {
          buildParams(i, value, assignment, add);
        })
      } else {
        throw new TypeError;
      }
      return s.join(separator);
    }
  }();
  /**
   * 反序列化，通过字符串来生成对象
   * @method armer.unserialize
   * @static
   * @param {String} str
   * @param {String} [separator] 分割符，默认【&】
   * @param {String} [assignment] 赋值符，默认【=】
   * @param {String} [spliter] 分隔符，默认【,】
   * @returns {Object|Array}
   */
  $.unserialize = function () {
    var r = /[\n\r\s]/g;

    function assume(value) {
      try {
        value = decodeURIComponent(value)
      } catch (e) {
      }
      if (value.indexOf('{') == 0 || value.indexOf('[') == 0) {
        // 预测是对象或者数组
        try {
          return JSON.parse(value)
        } catch (e) {
          return value;
        }
      } else if (value == '') {
        //为空
        return null
        /*
         } else if (!isNaN(Number(value).valueOf())) {
         //数字
         return Number(value).valueOf();
         */
      } else if (value == 'true') {
        return true
      } else if (value == 'false') {
        return false
      } else {
        return value
      }
    }

    return function (str, separator, assignment, spliter) {
      if (str == '' || str == null) return {};
      separator = separator || '&';
      assignment = assignment || '=';
      spliter = spliter || ',';
      str = str.replace(r, '');
      var group = str.split(separator),
        result = {};
      $.each(group, function (__, str) {
        var splits = str.split(assignment),
          key = splits[0],
          value = splits[1];
        var m = key.match(/(.*)\[\]$/);

        if (m) {
          key = m[1];
          result[key] = result[key] || [];
        }

        if (!value) return;
        else {
          var s = decodeURIComponent(value);
          if (value.indexOf(spliter) > -1 && s.indexOf('[') != 0 && s.indexOf('{') != 0) {
            result[key] = result[key] || [];
            $.each(value.split(spliter), function (__, value) {
              $.setAsGroup(result, key, assume(value))
            });
          } else {
            $.setAsGroup(result, key, assume(value))
          }
        }
      });
      return $.mix({}, result);
    }
  }();

  $.factory = function(constructor, protoMixin, base){
    var prototype;
    if (!$.isFunction(constructor)) {
      base = protoMixin;
      protoMixin = constructor;
      constructor = $.own(protoMixin, 'constructor') || function(){
          var callee = constructor;
          if (!(this instanceof callee)) {return $.constrApply(callee, arguments)}
          this.constructor = callee;
          if (this._init) {
            return this._init.apply(this, [].slice.call(arguments));
          }
        };
    }

    if (!$.isPlainObject(protoMixin)) {
      base = protoMixin;
      protoMixin = {}
    }
    if (!base) {
      base = $.own(protoMixin, 'inherit') || this;
    }

    // 如果 base报错，具体方法待定
    var basePrototype = base.prototype;
    try{
      prototype = new base();
    } catch(e){
      base = function(){};
      base.prototype = basePrototype;
      prototype = new base();
    }

    $.each(protoMixin, function(prop, value){
      if ($.isFunction(value)) {
        prototype[prop] = (function () {
          var _super = function () {
            return base.prototype[prop].apply(this, arguments);
          }, _superApply = function (args) {
            return base.prototype[prop].apply(this, args);
          }, fn = function () {
            var __super = this._super,
              __superApply = this._superApply,
              returnValue;
            this._super = _super;
            this._superApply = _superApply;
            returnValue = value.apply(this, arguments);
            this._super = __super;
            this._superApply = __superApply;
            return returnValue;
          }
          fn.toString = function () {
            return value.toString();
          }
          return fn;
        })();
      } else {
        prototype[prop] = value;
      }
    });
    constructor.prototype = $.extend(prototype, {
      options: $.mix( {}, basePrototype.options, prototype.options),
      inherit: base
    });
    constructor.extend = base.extend;
    constructor.mix = base.mix;
    return constructor
  };

  return $
});


