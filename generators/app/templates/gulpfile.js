/*
 *@description: <%= name %>
 *@author: <%= author %>
 *@email: <%= email %>
 *@time: <%= time %>
 */
"use strict";
let fs = require('fs'),
    os = require('os'),
    path = require('path'),
    gulp = require('gulp'),
    runSequence = require('run-sequence'),
    webpack = require("webpack"),
    connect = require('gulp-connect'),
    open = require('gulp-open'),
    gulpif = require('gulp-if'),
    yargs = require('yargs'),
    gutil = require('gulp-util'),
    postcss = require('gulp-postcss'),
    precss = require('precss'),
    autoprefixer = require('autoprefixer'),
    assets = require('postcss-assets'),
    cssnano = require('gulp-cssnano'),
    toRem = require('2rem'),
    sourcemap = require('gulp-sourcemaps'),
    rev = require('gulp-rev'),
    del = require('del'),
    inject = require('gulp-inject'),
    _ = require('lodash');

let utils = {

    //获取IP
    getIPAdress() {
        let interfaces = os.networkInterfaces(),
            ip;

        _.forOwn(interfaces, function(value, key) {

            _.forEach(value, function(val, k) {

                if (val.family.toLowerCase() === 'ipv4' && val.address !== '127.0.0.1' && !val.internal) {

                    ip = val.address;
                }
            });
        });

        return ip;
    },

    //获取chrome在不同系统下的别名
    getBrowser() {
        let browser = '';

        if (os.platform() === 'linux') {
            browser = 'google-chrome';
        } else if (os.platform() === 'darwin') {
            browser = 'google chrome';
        } else if (os.platform() === 'win32') {
            browser = 'chrome';
        }

        return browser;
    },

    //移除字符串中的注释（目前只支持块注释，node环境负向零宽断言TODO）
    removeComments(str) {

        //let lineComments = /(?<![":])\/\/.*/g; //负向零宽断言

        let blockComments = /\/\*[\s\S]*?\*\//g;

        return str.replace(blockComments, '');
    },

    // 获取当前环境下的配置
    getEvnSetting(obj, evn) {

        let resObj = _.cloneDeep(obj);

        function recursion(oObj, nObj) {
            _.forOwn(oObj, function(value, key) {

                if (_.isObject(value) && !_.isArray(value)) {

                    if (_.isUndefined(value[evn])) {

                        recursion(value, nObj[key]);
                    } else {

                        nObj[key] = value[evn];
                    }
                } else {

                    nObj[key] = value;
                }
            })
        }

        recursion(obj, resObj);

        return resObj;
    },

    //读取配置文件
    readSetting(src) {
        return new Promise(function(resolve, reject) {

            fs.readFile(src, 'utf-8', function(err, data) {

                if (err) {
                    reject(new Error(err));
                } else {

                    resolve(JSON.parse(utils.removeComments(data)));
                }
            })
        });
    },

    //写入配置文件
    writeSetting(src, data) {

        return new Promise(function(resolve, reject) {

            fs.writeFile(src, data, 'utf-8', function(err) {

                if (err) {
                    reject(new Error(err));
                } else {
                    resolve(true);
                }
            })
        });
    }
};

let argv = yargs.option('evn', {
    alias: 'e',
    demand: true,
    default: 'dev',
    describe: 'dev、pre or prd?',
    type: 'string'
}).usage('Usage: gulp [options]').example('gulp dev').help('h').alias('h', 'help').locale('en').argv;

let ROOT_PATH = path.resolve(__dirname),
    APP_PATH = path.resolve(ROOT_PATH, 'app'),
    DIST_PATH = path.resolve(ROOT_PATH, 'dist'),
    port = 8081,
    baseUrl = 'http://' + utils.getIPAdress(),
    resourceUri = {
        dev: baseUrl + ':' + port,
        pre: '',
        prd: ''
    },
    evn = argv.evn,
    taskList;

// Connect服务
gulp.task('connect', function() {

    connect.server({
        root: ROOT_PATH,
        port: port,
        base: baseUrl,
        livereload: true
    });
});

// 打开浏览器
gulp.task('open', function() {

    let browser = utils.getBrowser(),
        openConf = {
            app: browser,
            uri: baseUrl + ':' + port + '/dist/index.html'
        };

    !browser && delete openConf.app;

    gulp.src(__filename)
        .pipe(open(openConf));
});

// 打包js
gulp.task('clean:js', function() {

    return del(path.resolve(DIST_PATH, 'assets/temp'));
});

gulp.task('webpack', ['clean:js', ], function(cb) {

    utils.readSetting(path.resolve(ROOT_PATH, 'app.conf.json'))
        .then(function(data) {

            let src = path.resolve(APP_PATH, 'javascript/commons/conf.js'),
                d = 'const CONF = ' + JSON.stringify(utils.getEvnSetting(data, evn)) + ';export default CONF;';

            return utils.writeSetting(src, d);
        })
        .then(function(data) {

            if (data === true) {

                gutil.log(gutil.colors.green('WRITE SETTING DONE'));

                let webpackConf = new Object(require('./webpack.config'));
                let uglify = new webpack.optimize.UglifyJsPlugin({
                    compress: {
                        warnings: false
                    }
                });

                webpackConf.output.path = path.resolve(DIST_PATH, 'assets/temp');

                if (evn !== 'dev') {

                    delete webpackConf.devtool;

                    webpackConf.plugins.push(uglify);
                };

                webpack(webpackConf, function(err, stats) {
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
                gutil.log(gutil.colors.red('WRITE SETTING FAIL'));
            }
        });
});

gulp.task('js', ['webpack'], function() {

    return gulp.src([path.resolve(DIST_PATH, 'assets/temp/*.js')])
        .pipe(gulpif(evn !== 'dev', rev()))
        .pipe(gulp.dest(path.resolve(DIST_PATH, 'assets')))
        .pipe(gulpif(evn === 'dev', connect.reload()));
});

// css
gulp.task('postcss', function() {

    let processors = [
        precss,
        autoprefixer({
            remove: false
        }),
        assets({
            cachebuster: true,
            relative: APP_PATH,
            loadPaths: [path.resolve(APP_PATH, 'images')]
        }),
        toRem
    ];

    return gulp.src(path.resolve(APP_PATH, 'style/index.css'))
        .pipe(gulpif(evn === 'dev', sourcemap.init()))
        .pipe(postcss(processors))
        .pipe(gulpif(evn !== 'dev', rev()))
        .pipe(gulpif(evn !== 'dev', cssnano()))
        .pipe(gulpif(evn === 'dev', sourcemap.write()))
        .pipe(gulp.dest(path.resolve(DIST_PATH, 'assets')))
        .pipe(gulpif(evn === 'dev', connect.reload()));
});

gulp.task('css', ['postcss'], function() {

    return gulp.src([path.resolve(DIST_PATH, 'index.css')])
        .pipe(gulpif(evn === 'dev', connect.reload()));
});


// html & fonts & images
gulp.task('cp:html', function() {

    return gulp.src([path.resolve(APP_PATH, '*.html')])
        .pipe(gulp.dest(path.resolve(DIST_PATH)));
});
gulp.task('cp:fonts', function() {

    return gulp.src([path.resolve(APP_PATH, 'fonts/*')])
        .pipe(gulp.dest(path.resolve(DIST_PATH, 'assets/fonts')))
        .pipe(connect.reload());
});
gulp.task('cp:images', function() {

    return gulp.src([path.resolve(APP_PATH, 'images/**')])
        .pipe(gulp.dest(path.resolve(DIST_PATH, 'assets/images')))
        .pipe(connect.reload());
});

gulp.task('cp', ['cp:html', 'cp:fonts', 'cp:images']);

// reject
gulp.task('replace', function() {

    let target = gulp.src(path.resolve(DIST_PATH, '*.html')),
        sources = gulp.src([
            path.resolve(DIST_PATH, 'assets/all*.js'),
            path.resolve(DIST_PATH, 'assets/index*.css')
        ], {
            read: false
        }),
        vendors = gulp.src([
            path.resolve(DIST_PATH, 'assets/vendors*.js')
        ], {
            read: false
        });

    return target.pipe(inject(vendors, {

            starttag: '<!-- inject:vendors:{{ext}} -->',
            transform: function(filepath) {

                return '<script src="' + resourceUri[evn] + filepath + '"></script>';
            }
        })).pipe(inject(sources, {

            transform: function(filepath) {

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
        })).pipe(gulp.dest(DIST_PATH))
        .pipe(connect.reload());
});

// html change
gulp.task('html', function() {

    runSequence('cp:html', 'replace');
});

// del
gulp.task('clean:dist', function() {

    return del(DIST_PATH);
});

//dev
gulp.task('dev', function() {

    runSequence('clean:dist', ['js', 'css', 'cp'], 'replace', ['connect', 'watch', 'open']);
});
// build
gulp.task('build', function() {

    runSequence('clean:dist', ['js', 'css', 'cp'], 'replace', 'clean:js');
});

// watch
gulp.task('watch', function() {
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