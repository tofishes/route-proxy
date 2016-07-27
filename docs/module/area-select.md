# aera-select 地区选择组件使用说明

## 在你的页面引入
`var areaSelect = require('../../component/area-select/index.js');`
> path: src/js/component/area-select/index.js

## 有2种方式可以调用组件
1. jquery插件方式调用 `$('#area-select-wrap').areaSelect(options)`
2. 函数调用 `areaSelect(options)`

> #### 注意
> jquery插件方式调用时不需要出入 `ele` 参数
> blockLevel 的值必须是 2 或 3

## options 参数如下
| 参数名       | 类型   | 默认值| 描述   |
| -------------| ------ | ----- | ------  |
| `ele`        | string | '#area-select-wrap'|  DOM容器    |
| `cityCode`   | array  | [] |  默认的地区代码，会根据此代码显示默认的地区，传入的数组的长度必须与`blockLevel` 相等   |
| `blockLevel` | number | 2 | 选择的级，可选 2 、3 ，2级表示省，市，3级表示省、市、区   |

## 列子
#### jquery插件方式
```js
$('#resource-area-select').areaSelect({
  cityCode: ['440000','440100', '440106'],
  blockLevel: 2
});
```
#### 函数方式
```js
areaSelect({
  ele: '#project-area-select',
  blockLevel: 3
});
```



