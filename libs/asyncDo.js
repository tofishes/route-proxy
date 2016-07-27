// @tofishes
// @v0.1
// @2013.8.1
// usage:
// // 首先定义任务序列，参数数组，每个数组
// var todos = asyncDo.todos(['todo_alias', 'todo_two', 'dosomething']);
// setTimeout(function() {
//     todos.done('todo_alias', {
//         'alias': 'some data, alias is complete'
//     });
// }, 1000);
// setTimeout(function() {
//     todos.done('todo_two'); // or no data to allDone
// }, 2000);
// setTimeout(function() {
//     todos.done('dosomething', {
//         'some': {
//             'array': [1, 2, 3]
//         }
//     });
// }, 3000);
// todos.allDone(function (dones) {
//     console.info('3 async todos is all complete! and some data is :');
//     console.info(dones.alias, dones.some.array.join());
// });

;(function (global) {
    var asyncDo = global.asyncDo = {};

    asyncDo.todos = function (_doSeries) {
        return new todos(_doSeries);
    }

    function todos(_doSeries) {
        this.doSeries = _doSeries;
        this.dones = {};
    }
    // 单个任务完成后调用
    todos.prototype.done = function (slice, doneData) {
        arrayDelete(this.doSeries, slice);
        extend(this.dones, doneData);
        // 每次调用检查是否所有的异步任务都已经完成
        if (this.doSeries.length === 0) {
            // 异步任务都执行完了，就执行最后的合并任务
            // 各异步任务所返回的数据
            this.allCallback.call(this.dones, this.dones);
        }
    }
    todos.prototype.allDone = function (_allCallback) {
        this.allCallback = _allCallback;
    }
    // 简单判断是否是原生对象
    function isPlainObject (o) {
        if (!o) return false;
        return o.__proto__.isPrototypeOf(Object);
    }
    // 合并两个对象
    // 合并from到to对象
    function extend (to, from) {
        for (var key in from) {
            if (!to[key] || !isPlainObject(to[key])) {
                to[key] = from[key];
                continue;
            }

            if (isPlainObject(from[key])) {
                extend(to[key], from[key]);
            };
        };
        return to;
    }
    // 删除数组中的一个元素
    // array, 数组
    // ele，要删除的元素
    function arrayDelete(array, ele) {
        array.splice(array.indexOf(ele), 1);
        return array;
    }

     // AMD / RequireJS
    if (typeof define !== 'undefined' && define.amd) {
        define([], function () {
            return asyncDo;
        });
    }
    // Node.js
    else if (typeof module !== 'undefined' && module.exports) {
        module.exports = asyncDo;
    }
})(this);