## Yeoman generators

基于Yeoman初始化项目的脚手架文件和相关配置，使用Webpack、gulp、PostCss

+ Basic
+ Node //TODO
+ Vue //TODO
+ Weex //TODO
+ React //TODO
+ React Native //TODO

### install

```bash
$ npm install -g yo generator-yoapp
```

### usage

```bash
$ yo yoapp
```
完成项目的初始化
```bash
$ gulp
```
以开发模式启动项目服务

### 可配置选项
+ `--skip-welcome-message` 跳过项目初始化前的大胡子欢迎信息
+ `--skip-install` 只初始化项目，跳过npm package安装

+ Name 项目名称，默认读取当前的文件夹名命名
+ Author 项目的作者，如果本机有安装git默认读取git的user.name
+ Email 作者的邮箱，如果本机有安装git默认读取git的user.email
+ Version 项目的版本号，默认1.0.0
+ This is a mobile app? 是否是移动app默认是，是移动app会在`<head></head>`中加入计算rem的js代码
+ You want to install? 提供4个包（jquery、hammerjs、lodash、mustache）供选择安装，jquery默认安装，可通过上下方向键和空格取消和选定

### 特性
+ 使用webpack编译es6代码和包管理
+ 使用gulp控制项目的构建流程
+ 使用PostCSS做css的预处理和后处理
+ 支持es6 Promise写法，无需引入第三方文件
+ 已经对jquery和jquery插件的支持做兼容，选择使用jquery包即可生成相关的配置文件和使用示例
+ 当选择使用jquery、hammerjs、lodash、mustache在打包文件时默认提取相关代码到`vendors.js`中
+ 项目的配置文件推荐全部放到`app.conf.json`中，gulp会根据当前的环境在`app/javascript/commons`文件夹中写入该环境下的配置
+ 在gulpfile.js中配置resourceUri变量，可根据当前环境替换html中的静态资源地址，如果是生产环境会以文件的md5值命名文件
+ 修改html、js、css、img、font自动刷新浏览器

### 关于PostCSS的补充
支持如下：
+ base64
+ 获取图片宽高
+ for、each（只支持一维数组）
+ 嵌套
+ 变量
+ mixin
+ 图片hash缓存
+ 动态图片路径
+ 浏览器兼容性前缀
+ 雪碧图//TODO

### PostCSS插件列表及相关文档
+ [PostCSS](https://www.npmjs.com/package/postcss)
+ [PreCSS](https://www.npmjs.com/package/precss)
+ [autoprefixer](https://www.npmjs.com/package/autoprefixer)
+ [postcss-assets](https://www.npmjs.com/package/postcss-assets)
