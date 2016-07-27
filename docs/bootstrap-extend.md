联结项目扩展bootstrap使用指南
=============================

[TOC]

## 栅栏 grid
### 左右等高栅栏
使用 `.row` 和 `[class=^col]` 进行布局的时候，在 `.row` 上添加以下类可以使栅栏等高
	1.  `.row-equal-sm`
	2.  `.row-equal-xs`
	3.  `.row-equal-md`
	4.  `.row-equal-lg`
具体情况按实际开发需要，请参考bs的栅栏布局

<iframe width="100%" height="300" src="//jsfiddle.net/cdt5y0bb/1/embedded/html,css,result/" allowfullscreen="allowfullscreen" frameborder="0"></iframe>

## 表格 table
### 扩展表格
如同 `.table-collapsed`，增加 `.table-extended`，可以增加表格的行间距
<iframe width="100%" height="300" src="//jsfiddle.net/umcgnr3s/2/embedded/html,css,result/" allowfullscreen="allowfullscreen" frameborder="0"></iframe>

### 响应收缩表格
在表格的父容器中，添加 `.table-collapse`，可使表格在尺寸小的设备下放弃 `table` 布局，并保留所需结果

<iframe width="100%" height="300" src="//jsfiddle.net/qo40wgwm/3/embedded/html,css,result/" allowfullscreen="allowfullscreen" frameborder="0"></iframe>

## 表单 forms

### 下划线输入框
在 `.form-group`上加上 `.form-group-underline` ，或者在 `.input-group` 上加上 `.input-group-underline`，或者在 `.form-control` 加上 `.form-control-underline`
可使输入框变成只有下边框的输入框

<iframe width="100%" height="300" src="//jsfiddle.net/kpo8h3ky/embedded/html,css,result/" allowfullscreen="allowfullscreen" frameborder="0"></iframe>

## 按钮 button
### 描边按钮
在 `.btn`上加上 `.btn-outline` ，可使按钮变为透明描边按钮

### 圆角按钮
在 `.btn`上加上 `.btn-round` ，可使按钮变为左右圆角

<iframe width="100%" height="300" src="//jsfiddle.net/bftjbaxt/1/embedded/html,css,result/" allowfullscreen="allowfullscreen" frameborder="0"></iframe>

## 导航 navs
### 顶部图标导航
在 `.nav`上加上 `.nav-icon-top` ，并且在图标上加上`.icon`，可使导航变为顶部图标的导航

## 导航条 navbar
### 顶部图标导航条
在 `.navbar`上加上 `.navbar-icon-top` ，并且在图标上加上`.icon`，可使导航条变为顶部图标的导航条

## 标签 label
### 描边标签
在 `.label`上加上 `.label-outline` ，可使标签变为透明描边标签

### 圆角标签
在 `.label`上加上 `.label-round` ，可使标签变为左右圆角

## 列表组 list-group
### 列表组中可以使用媒体

## 面板
### 无边面板
在 `.panel`上加上 `.panel-no-border` ，可使面板变为没有边框的面板


## 泡泡 buble


## 媒体 media
### 在媒体添加泡泡