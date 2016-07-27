/**
 * @tofishes js的四则精确运算方法
 * http://www.cnblogs.com/junjieok/p/3306155.html
 * 例如：
 * 268.34 + 0.83
 * 268.34 - 0.86
 * 0.3 - 0.2
 * 0.33 * 10
 * 33.3 / 10
 */


;(function (global) {

    function getDigits(num) {
        var digits = 0
        ,   parts = num.toString().split(".");

        if (parts.length === 2) {
            digits = parts[1].length;
        }

        return digits;
    }

    function toFixed(num, digits) {
        if (typeof digits == 'undefined') {
            return num;
        }

        return Number(num).toFixed(digits);
    }

    var MathKit = {
        /*
        函数，加法函数，用来得到精确的加法结果
        说明：javascript的加法结果会有误差，在两个浮点数相加的时候会比较明显。这个函数返回较为精确的加法结果。
        参数：arg1：第一个加数；arg2第二个加数；d要保留的小数位数（可以不传此参数，如果不传则不处理小数位数）
        调用：MathKit.Add(arg1,arg2,d)
        返回值：两数相加的结果
        */
        add: function (arg1, arg2, digits) {
            arg1 = arg1.toString(), arg2 = arg2.toString();

            var maxLen = Math.max(getDigits(arg1), getDigits(arg2))
            ,   m = Math.pow(10, maxLen)
            ,   result = Number(((arg1 * m + arg2 * m) / m).toFixed(maxLen));

            return toFixed(result, digits);
        },
        /*
        函数：减法函数，用来得到精确的减法结果
        说明：函数返回较为精确的减法结果。
        参数：arg1：第一个加数；arg2第二个加数；d要保留的小数位数（可以不传此参数，如果不传则不处理小数位数
        调用：MathKit.Sub(arg1,arg2)
        返回值：两数相减的结果
        */
        sub: function (arg1, arg2, digits) {
            return MathKit.Add(arg1, -Number(arg2), digits);
        },
        /*
        函数：乘法函数，用来得到精确的乘法结果
        说明：函数返回较为精确的乘法结果。
        参数：arg1：第一个乘数；arg2第二个乘数；d要保留的小数位数（可以不传此参数，如果不传则不处理小数位数)
        调用：MathKit.Mul(arg1,arg2)
        返回值：两数相乘的结果
        */
        mul: function (arg1, arg2, digits) {
            // 数字化
            var num1 = parseFloat(arg1).toString()
            ,   num2 = parseFloat(arg2).toString()
            ,   m = getDigits(num1) + getDigits(num2)

            ,   result = num1.replace(".", "") * num2.replace(".", "") / Math.pow(10, m);

            return toFixed(result, digits);
        },
        /*
        函数：除法函数，用来得到精确的除法结果
        说明：函数返回较为精确的除法结果。
        参数：arg1：除数；arg2被除数；d要保留的小数位数（可以不传此参数，如果不传则不处理小数位数)
        调用：MathKit.Div(arg1,arg2)
        返回值：arg1除于arg2的结果
        */
        div: function (arg1, arg2, digits) {
            // 数字化
            var num1 = parseFloat(arg1).toString()
            ,   num2 = parseFloat(arg2).toString()

            ,   t1 = getDigits(num1)
            ,   t2 = getDigits(num2)

            ,   result =  num1.replace(".", "") / num2.replace(".", "") * Math.pow(10, t2 - t1)

            return toFixed(result, digits);
        }
    };

    // AMD / RequireJS
    if (typeof define !== 'undefined' && define.amd) {
        define(function () {
            return MathKit;
        });
        return;
    };
    // Node.js
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = MathKit;
        return;
    };

    global.MathKit = MathKit;
})(this);