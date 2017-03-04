/*
 *@description: <%= name %>
 *@author: <%= author %>
 *@email: <%= email %>
 *@time: <%= time %>
 */

var fs = require('fs'),
    os = require('os'),
    path = require('path'),
    gulp = require('gulp'),
    runSequence = require('run-sequence'),
    glob = require('glob'),
    webpack = require("webpack"),
    connect = require('gulp-connect'),
    open = require('gulp-open'),
    gulpif = require('gulp-if'),
    yargs = require('yargs'),
    gutil = require('gulp-util'),
    plumber = require('gulp-plumber'),
    postcss = require('gulp-postcss'),
    precss = require('precss'),
    autoprefixer = require('autoprefixer'),
    assets = require('postcss-assets'),
    rev = require('gulp-rev'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    del = require('del'),
    inject = require('gulp-inject'),
    config = require('./webpack.config');


var argv =
    yargs.option('evn', {
        alias: 'e',
        demand: true,
        default: 'dev',
        describe: 'dev or prd?',
        type: 'string'
    })
        .usage('Usage: gulp [options]')
        .example('gulp dev')
        .help('h')
        .alias('h', 'help')
        .locale('en').argv;

var evn = argv.evn,
    taskList;

if (evn === 'dev') {
    taskList = ['cp', 'js', 'css', 'connect', 'watch', 'open'];
} else {
    taskList = ['build'];
}

// 获取IP
function getIPAdress() {

    var interfaces = os.networkInterfaces(),
        devName,
        iface,
        alias,
        i;

    for (devName in interfaces) {
        iface = interfaces[devName];
        for (i = 0; i < iface.length; i++) {
            alias = iface[i];
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                return alias.address;
            }
        }
    }
}

// 获取浏览器alias
function getBrowser() {

    var browser = '';

    if (os.platform() === 'linux') {
        browser = 'google-chrome';
    } else if (os.platform() === 'darwin') {
        browser = 'google chrome';
    } else if (os.platform() === 'win32') {
        browser = 'chrome';
    }

    return browser;
}

// 获取需要打包的js
function getJs() {

    var fileName,
        fileNameReg = /\/([^/]+)\.js/i; //g匹配第二次会失败？？

    return glob.sync('./app/javascript/*.js', {nodir: true})
        .reduce(function (memo, current) {

            fileName = fileNameReg.exec(current)[1];
            memo[fileName] = './app/javascript/' + fileName + '.js';

            return memo;
        }, {});
}

var ROOT_PATH = path.resolve(__dirname),
    APP_PATH = path.resolve(ROOT_PATH, 'app'),
    DIST_PATH = path.resolve(ROOT_PATH, 'dist'),
    port = 8081,
    baseUrl = 'http://' + getIPAdress();

// Connect服务
gulp.task('connect', function () {
    connect.server({
        root: DIST_PATH,
        port: port,
        base: baseUrl,
        livereload: true
    });
});

// 打开浏览器
gulp.task('open', function () {

    var browser = getBrowser(),
        openConf = {
            app: browser,
            uri: baseUrl + ':' + port + '/'
        };

    !browser && delete openConf.app;

    gulp.src(__filename)
        .pipe(open(openConf));
});

// 打包js
gulp.task('cleanTmp', function () {
    return del(path.resolve(DIST_PATH, 'assets/temp'));
});
gulp.task('webpack', ['cleanTmp'], function (cb) {

    var dev = new Object(config);

    dev.output.path = path.resolve(DIST_PATH, 'assets/temp');

    dev.entry = Object.assign({}, dev.entry, getJs());

    webpack(dev, function (err, stats) {
        if (err) {
            throw new gutil.PluginError("webpack", err);

            return;
        }
        gutil.log("[webpack]", stats.toString({

            colors: true
        }));

        cb();
    });
    /*return gulp.src(__filename)
     .pipe(gulpif(evn === 'dev', plumber()))
     .pipe(webpack(dev))
     .pipe(concat('all.js'))
     .pipe(gulpif(evn !== 'dev', uglify()))
     .pipe(gulpif(evn !== 'dev', rev()))
     .pipe(gulp.dest(path.resolve(DIST_PATH, 'assets')))
     .pipe(gulpif(evn === 'dev', connect.reload()));*/
});

gulp.task('js', ['webpack'], function () {

    return gulp.src(path.resolve(DIST_PATH, 'assets/temp/*.js'))
        .pipe(concat('all.js'))
        .pipe(gulpif(evn !== 'dev', uglify()))
        .pipe(gulpif(evn !== 'dev', rev()))
        .pipe(gulp.dest(path.resolve(DIST_PATH, 'assets')))
        .pipe(gulpif(evn === 'dev', connect.reload()));
});

// css
gulp.task('css', function () {

    var processors = [
        precss,
        autoprefixer({remove: false}),
        assets({
            cachebuster: true,
            relative: APP_PATH,
            loadPaths: [path.resolve(APP_PATH, 'images')]
        })];

    return gulp.src(path.resolve(APP_PATH, 'css/index.css'))
        .pipe(gulpif(evn === 'dev', plumber()))
        .pipe(postcss(processors))
        .pipe(gulpif(evn !== 'dev', rev()))
        .pipe(gulp.dest(path.resolve(DIST_PATH, 'assets')))
        .pipe(gulpif(evn === 'dev', connect.reload()));
});


// html & fonts & images
gulp.task('cp:html', function () {

    return gulp.src([path.resolve(APP_PATH, '*.html')])
        .pipe(gulp.dest(path.resolve(DIST_PATH)))
        .pipe(connect.reload());
});
gulp.task('cp:fonts', function () {

    return gulp.src([path.resolve(APP_PATH, 'fonts/*')])
        .pipe(gulp.dest(path.resolve(DIST_PATH, 'assets/fonts')))
        .pipe(connect.reload());
});
gulp.task('cp:images', function () {

    return gulp.src([path.resolve(APP_PATH, 'images/**')])
        .pipe(gulp.dest(path.resolve(DIST_PATH, 'assets/images')))
        .pipe(connect.reload());
});

gulp.task('cp', ['cp:html', 'cp:fonts', 'cp:images']);

// replace
gulp.task('replace', function () {

    var target = gulp.src(path.resolve(DIST_PATH, '*.html'));
    var sources = gulp.src([
        path.resolve(DIST_PATH, 'assets/*.js'),
        path.resolve(DIST_PATH, 'assets/*.css')
    ], {read: false});

    return target.pipe(inject(sources, {relative: true}))
        .pipe(gulp.dest(DIST_PATH));
});

// del
gulp.task('del', function () {

    return del(DIST_PATH);
});

// build
gulp.task('build', function () {

    runSequence('del', ['js', 'css', 'cp'], 'replace');
});

// watch
gulp.task('watch', function () {
    gulp.watch(path.resolve(APP_PATH, 'css/**'), ['css']);
    gulp.watch(path.resolve(APP_PATH, 'javascript/**'), ['js']);
    gulp.watch(path.resolve(APP_PATH, '*.html'), ['cp:html']);
    gulp.watch(path.resolve(APP_PATH, 'fonts/**'), ['cp:fonts']);
    gulp.watch(path.resolve(APP_PATH, 'images/**'), ['cp:images']);
});

gulp.task('default', taskList);


// ES2015
/*
 * Babel把 ES6 转为 ES5,
 * 但是它没有模块管理的功能，浏览器端默认也无法识别CommonJs规范，
 * 需要模块打包工具，为我们的代码做一些包裹，让它能在浏览器端使用。
 * 比如 Browserify, Webpack。
 */

/*gulp.task('js', function () {
 return gulp.src('app/javascript/index.js')
 .pipe(babel({
 presets: ['es2015']
 }))
 .pipe(gulp.dest(conf.dist.js));
 });*/
