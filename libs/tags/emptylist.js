var varType = 9;
var stringType = 1;

exports.parse = function (str, line, parser, types, options) {
  var data
    , firstString = true
    , firstVar = true;

  parser.on(types.STRING, function (token) {
    if (firstString) {
      this.out.push(token);
      firstString = false;
    }
  });

  parser.on(types.VAR, function (token) {
    if (firstVar) {
      this.out.push(token);
      firstVar = false;
    }
  });

  return true;
};

exports.compile = function (compiler, args, content, parents, options, blockName) {

  var list
    , tips;

  for (var i = 0; i < args.length; i++) {
    if (args[i].type == varType) {
      list = '_ctx.'+args[i].match;
    }else if (args[i].type == stringType) {
      tips = args[i].match;
    }
  }

  list = list || '[]';
  tips = tips || '"当前城市暂无相关资源"';
  tips = '\"<p class=\\"text-muted lj-empty-list\\">\"+'+tips+'+\"</p>\"';

  return '(function () {\n' +
            'var __o = "";\n'+
            'var arr = '+list+';\n'+
            'if (arr&&!arr.length) {\n'+
            '__o += '+ tips + ';\n'+
            '};\n'+
            '_output += __o;\n' +
          '})();\n';
};

exports.ends = false;
exports.blockLevel = false;
