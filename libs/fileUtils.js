var fs = require('fs')
,	path = require('path');

var walk = function (dir, callback) {
	dir = path.normalize(dir);

	fs.stat(dir, function(err, stats) {
		// windows下的回收站文件夹会丢失stats对象
		if (!stats) return;

		var ignore = path.basename(dir).startsWith('.');
		if (stats.isFile() && !ignore) {
			callback(err, dir);
			return;
		};

		if (stats.isDirectory()) {
			fs.readdir(dir, function (err, files) {
				if (err) {
					callback(err);
					return;
				};

				files.forEach(function (name) {
					walk(dir + '/' + name, callback);
				});
			});
		};
	});
};
var walkSync = function (dir, callback) {
	dir = path.normalize(dir);

	var stats = fs.statSync(dir);
	// windows下的回收站文件夹会丢失stats对象
	if (!stats) return;

	var ignore = path.basename(dir).startsWith('.');
	if (stats.isFile() && !ignore) {
		callback(null, dir);
		return;
	};

	if (stats.isDirectory()) {
		var files = fs.readdirSync(dir)

		files.forEach(function (name) {
			walkSync(dir + '/' + name, callback);
		});
	};
};

exports.walk = walk;
exports.walkSync = walkSync;

// function walkInto(dir, back) {
//     var result = [];
//     fs.readdir(dir, function(err, files){
//         if (err) back(err);

//        var pending = files.length;

//         if (pending === 0) {
// 			console.info('***************', dir, '******', back)
// 			back(null, result);
// 			return;
// 		}

//         files.forEach(function(file){
// 			var path = dir + '/' + file;
//             fs.stat(path, function(err, stats) {
//                 if (stats && stats.isFile()) {
//                     result.push(dir + '/' + file);
//                     if (!--pending) back(null, result);
//                 }
//                 if (stats && stats.isDirectory()) {
//                     walkInto(dir + '/' + file, function(err, res){
//                         result = result.concat(res);
//                         if (!--pending) back(null, result);
//                     })
//                 }
//             });
//         });
//     });
// };
// walk(__dirname + '/./', function (err, file) {
// 	console.info(file)
// })