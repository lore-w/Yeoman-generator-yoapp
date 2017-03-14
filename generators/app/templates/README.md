## <%= name %>

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
$gulp --evn=prd
```
prd mode

```
$ gulp -h
```
show help

### POSTCSS EXAMPLE
支持如下：
+ base64`background: inline('demo.png')`
+ 获取图片宽高`width('demo.png')` or `width('demo.png', 2)`
+ for`@for $i from 1 to 3 {}`
+ each`@each $icon in (foo, bar, baz) {}`
+ 嵌套
+ 变量`$blue: #056ef0`
+ mixin
+ 动态图片路径(hash)`background: resolve('demo.png')`
+ 浏览器兼容性前缀
+ 图片精灵//TODO
+ @at-root
+ Property Lookup`.heading {margin: 20px;padding: @margin;}`
+ &

### Tips
+ *如果是移动APP REM的计算在index.html的页头（基数50）*
+ *项目的配置文件全部在`app.conf.json`中，gulp会根据当前环境（dev\pre\sit\prd）在`app/javascript/commons`文件夹中写入该环境下的配置*
+ *在gulpfile.js中配置resourceUri变量，可根据当前环境替换html中的静态资源地址，如果是生产环境会以文件的md5值命名文件*


### Other
`app.conf.json` *中的嵌套不要超过三层，如果超过请考虑你的数据格式是否合理*

### POSTCSS DOCUMENTS
+ [POSTCSS](https://www.npmjs.com/package/postcss)
+ [PRECSS](https://www.npmjs.com/package/precss)
+ [AUTOPREFIXER](https://www.npmjs.com/package/autoprefixer)
+ [POSTCSS-ASSETS](https://www.npmjs.com/package/postcss-assets)
