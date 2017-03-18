## Yeoman generators

![](http://wwww.lore-w.com/images/2017/app-animation.gif)
基于Yeoman初始化项目的脚手架文件和相关配置，使用Webpack、gulp、PostCss

+ Basic
+ Node //TODO
+ Vue //TODO
+ Weex //TODO
+ React //TODO
+ React Native //TODO

### Install

```bash
$ npm install -g yo generator-yoapp
```

### Usage

```bash
$ yo yoapp
```
Project init

```bash
$ gulp
```
dev mode

```
$ gulp --evn=prd
```
prd mode

```
$ gulp -h
```
show help

### Options
+ `--skip-welcome-message` 跳过项目初始化前的大胡子欢迎信息
+ `--skip-install` 只初始化项目，跳过npm package安装

### Feature
+ *使用webpack编译es6代码和包管理*
+ *使用gulp控制项目的构建流程*
+ *使用POSTCSS*
+ *支持es6 Promise*
+ *已经对jquery和jquery插件的支持做兼容，选择使用jquery包即可生成相关的配置文件和使用示例*
+ *当选择使用jquery、hammerjs、lodash、mustache在打包文件时默认提取公共代码到`vendors.js`中*
+ LiveReload

### POSTCSS EXAMPLE
+ base64 `background: inline('demo.png')`
+ 获取图片宽高 `width('demo.png')` or `width('demo.png', 2)`
+ for `@for $i from 1 to 3 {}`
+ each `@each $icon in (foo, bar, baz) {}`
+ 嵌套
+ 变量 `$blue: #056ef0`
+ mixin
+ 动态图片路径(hash) `background: resolve('demo.png')`
+ 浏览器兼容性前缀
+ 图片精灵//TODO
+ @at-root
+ Property Lookup `.heading {margin: 20px;padding: @margin;}`
+ &

### POSTCSS DOCUMENTS
+ [POSTCSS](https://www.npmjs.com/package/postcss)
+ [PRECSS](https://www.npmjs.com/package/precss)
+ [AUTOPREFIXER](https://www.npmjs.com/package/autoprefixer)
+ [POSTCSS-ASSETS](https://www.npmjs.com/package/postcss-assets)
