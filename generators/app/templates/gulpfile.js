/*
 *@description: <%= name %>
 *@author: <%= author %>
 *@email: <%= email %>
 *@time: <%= time %>
 */

let fs = require('fs'),
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
    _ = require('lodash'),
    ws = require('ws-helper');


let argv = yargs
    .option('evn', {
        alias: 'e',
        demand: true,
        default: 'dev',
        describe: 'dev、pre or prd?',
        type: 'string'
    })
    .usage('Usage: gulp [options]')
    .example('gulp dev')
    .help('h')
    .alias('h', 'help')
    .locale('en').argv;

let ROOT_PATH = path.resolve(__dirname),
    APP_PATH = path.resolve(ROOT_PATH, 'app'),
    DIST_PATH = path.resolve(ROOT_PATH, 'dist'),
    port = 8081,
    baseUrl = 'http://' + ws.getIPAdress(),
    resourceUri = {
        dev: baseUrl + ':' + port,
        pre: '',
        prd: ''
    },
    evn = argv.evn,
    taskList;

// 提取环境配置
function getEvnSetting(obj, evn) {

    return _.reduce(obj, function (result, value, key) {

        if (!ws.isObject(value)) {


            result[key] = value;
        } else {

            if (typeof value[evn] !== 'undefined') {

                result[key] = value[evn];
            } else {

                result[key] = {};
                _.forOwn(value, function (val, k) {

                    result[key][k] = val[evn];
                })
            }
        }

        return result;
    }, {})
}

// 读取配置文件
function readSetting(src) {
    let p = new Promise(function (resolve, reject) {

        fs.readFile(src, 'utf-8', function (err, data) {

            if (err) {
                reject(new Error(err));
            } else {

                resolve(JSON.parse(data));
            }
        })
    });

    return p;
}

// 写入配置文件
function writeSetting(src, data) {

    let p = new Promise(function (resolve, reject) {

        fs.writeFile(src, data, 'utf-8', function (err) {

            if (err) {
                reject(new Error(err));
            } else {
                resolve(true);
            }
        })
    });
    return p;
}

// 获取需要打包的js
function getJs() {

    let fileName,
        fileNameReg = /\/([^/]+)\.js/i; //g匹配第二次会失败？？

    return glob.sync('./app/javascript/*.js', {nodir: true})
        .reduce(function (memo, current) {

            fileName = fileNameReg.exec(current)[1];
            memo[fileName] = './app/javascript/' + fileName + '.js';

            return memo;
        }, {});
}

// Connect服务
gulp.task('connect', function () {

    connect.server({
        root: ROOT_PATH,
        port: port,
        base: baseUrl,
        livereload: true
    });
});

// 打开浏览器
gulp.task('open', function () {

    let browser = ws.getBrowser(),
        openConf = {
            app: browser,
            uri: baseUrl + ':' + port + '/'
        };

    !browser && delete openConf.app;

    gulp.src(__filename)
        .pipe(open(openConf));
});

// 打包js
gulp.task('clean:js', function () {

    return del(path.resolve(DIST_PATH, 'assets/temp'));
});

gulp.task('webpack', ['clean:js',], function (cb) {

    readSetting(path.resolve(ROOT_PATH, 'app.conf.json'))
        .then(function (data) {

            let src = path.resolve(APP_PATH, 'javascript/commons/conf.js'),
                d = 'const CONF = ' + JSON.stringify(getEvnSetting(data, evn)) + ';export default CONF;';

            return writeSetting(src, d);
        })
        .then(function (data) {

            if (data === true) {

                gutil.log(gutil.colors.green('Write Setting Done'));

                let dev = new Object(require('./webpack.config'));

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
            } else {
                gutil.log(gutil.colors.red('Write Setting Fail'));
            }
        });
});

// concat all js but not include vendors.js
gulp.task('js:all', ['webpack'], function () {

    return gulp.src([path.resolve(DIST_PATH, 'assets/temp/*.js'),
        '!' + path.resolve(DIST_PATH, 'assets/temp/vendors.js')])
        .pipe(concat('all.js'))
        .pipe(gulpif(evn !== 'dev', uglify()))
        .pipe(gulpif(evn !== 'dev', rev()))
        .pipe(gulp.dest(path.resolve(DIST_PATH, 'assets')))
        .pipe(gulpif(evn === 'dev', connect.reload()));
});
gulp.task('js:vendors', ['webpack'], function () {

    return gulp.src([path.resolve(DIST_PATH, 'assets/temp/vendors.js')])
        .pipe(gulpif(evn !== 'dev', uglify()))
        .pipe(gulpif(evn !== 'dev', rev()))
        .pipe(gulp.dest(path.resolve(DIST_PATH, 'assets')))
        .pipe(gulpif(evn === 'dev', connect.reload()));
});

gulp.task('js', ['js:vendors', 'js:all']);
// 打包js end

// css
gulp.task('postcss', function () {

    let processors = [
        precss,
        autoprefixer({remove: false}),
        assets({
            cachebuster: true,
            relative: APP_PATH,
            loadPaths: [path.resolve(APP_PATH, 'images')]
        })];

    return gulp.src(path.resolve(APP_PATH, 'style/index.css'))
        .pipe(gulpif(evn === 'dev', plumber()))
        .pipe(postcss(processors))
        .pipe(gulpif(evn !== 'dev', rev()))
        .pipe(gulp.dest(path.resolve(DIST_PATH, 'assets')))
        .pipe(gulpif(evn === 'dev', connect.reload()));
});

gulp.task('css', ['postcss'], function () {

    return gulp.src([path.resolve(DIST_PATH, 'index.css')])
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

    let target = gulp.src(path.resolve(DIST_PATH, '*.html')),
        sources = gulp.src([
            path.resolve(DIST_PATH, 'assets/all*.js'),
            path.resolve(DIST_PATH, 'assets/index*.css')
        ], {read: false}),
        vendors = gulp.src([
            path.resolve(DIST_PATH, 'assets/vendors*.js')
        ], {read: false});

    return target.pipe(inject(vendors, {

            starttag: '<!-- inject:vendors:{{ext}} -->',
            transform: function (filepath) {

                return '<script src="' + resourceUri[evn] + filepath + '"></script>';
            }
        }
    )).pipe(inject(sources, {

            transform: function (filepath) {

                let pathSplit = filepath.split('.'),
                    extension = pathSplit[pathSplit.length - 1];

                if (extension === 'js') {

                    return '<script src="' + resourceUri[evn] + filepath + '"></script>';

                } else if (extension === 'css') {

                    return '<link rel="stylesheet" href="' + resourceUri[evn] + filepath + '">';

                } else {

                    gutil.log(gutil.colors.red('Match Error'));
                }
            }
        }
    )).pipe(gulp.dest(DIST_PATH));
});

// html change
gulp.task('html', function () {

    runSequence('cp:html', 'replace');
});

// del
gulp.task('clean:dist', function () {

    return del(DIST_PATH);
});

//dev
gulp.task('dev', function () {

    runSequence('clean:dist', ['js', 'css', 'cp'], 'replace', ['connect', 'watch', 'open']);
});
// build
gulp.task('build', function () {

    runSequence('clean:dist', ['js', 'css', 'cp'], 'replace', 'clean:js');
});

// watch
gulp.task('watch', function () {
    gulp.watch(['./app/style/**/*.css'], ['css']);
    gulp.watch(['./app/javascript/**/*.js', './app.conf.json'], ['js']);
    gulp.watch(['./app/*.html'], ['html']);
    gulp.watch(['./app/fonts/**/*.*'], ['cp:fonts']);
    gulp.watch(['./app/images/**/*.*'], ['cp:images']);
});

if (evn === 'dev') {
    taskList = ['dev'];
} else {
    taskList = ['build'];
}

gulp.task('default', taskList);
