#事件发射器`$.EventEmitter`
一个事件发射器，可以拥有如下方法
1. `.on(eventTypes, callback)` 可以为这个对象绑定一个事件
2. `.off(eventTypes, [callback])` 为这个对象取消绑定事件，或者事件的回调
3. `.emit(eventTypes, [args])` 触发这个对象的某个事件
4. `.trigger(eventTypes, [args])` 同上

## 默认行为和onevent function和事件
1. 也可以通过 onevent 的方式来绑定某个事件的回调，例如 `this.oninput = function(){}`
2. 当事件没有被阻止时，会触发事件发射器上的对应方法，假如 `this.trigger('click')`，则会触发 `this._click` 方法或者 `this.click` 方法，优先前者
3. 事件对象会使用`$.Event`来构造，所以你可以无缝对接jQuery的`jQuery.fn.on`等，具体参考jQuery官方文档
4. 阻止默认行为，也参考jQuery官方文档


## `new $.EventEmitter()`
新建一个事件触发器对象

```javascript
var em = new $.EventEmitter();
em.on('alert', function(str){
  alert(str);
});
em.trigger('alert', ['foobar'])
```

## `$.EventEmitter([obj{Object}])`
往一个对象注入一个事件发射器

| 参数名       | 类型   | 默认值| 描述   |
| -------------| ------ | ----- | ------  |
| `obj`        | object | undefined|  需要注入的对象    |

```javascript
var em = $.EventEmitter({
  alert: function(str){
    alert(str)
  }
});
em.trigger('alert', ['foobar'])
```

## 方法
提供`.on`、`.off`、`.emit`、`.trigger`四个方法，具体使用方式，与`jQuery.fn`上的同名方法一致，具体参考jQuery官方文档

## `$.EventEmitter.extend([constructor], [prototypeMixin])`

返回一个继承`$.EventEmitter`的类(构造器)

`extend`方法只是`$.factory`的一个引用，具体查看`$.factory`使用方法

```javascript
var MyComponent = $.EventEmitter.extend({
  _init: function(input){
    //初始化组件
    this.input = $(input);
  },
  val: function(val){
    this.trigger('change', [val])
  },
  _change: function(val){
    this.input.val(val)
  }
})

var c = new MyComponent($('#my-input'));
c.on('change', function(){
  alert('change!');
  // 你也可以通过阻止事件来达到取消默认行为
  // return false
})
c.val(1)

```