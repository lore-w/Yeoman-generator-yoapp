/*
 *@description: gulp
 *@author: <%= author%>
 *@email: <%= email%>
 *@time: <%= time%>
 */

var fs = require('fs'),
    exec = require('child_process').exec,
    gulp = require('gulp'),
    ftp = require('gulp-ftp'),
    gutil = require('gulp-util'),
    concat = require('gulp-concat'),
    compass = require('gulp-compass'),
    uglify = require('gulp-uglify'),
    Package = require('father').SpmPackage,
    transport = require('gulp-spm'),
    server = require('gulp-develop-server');

var config = JSON.parse(fs.readFileSync('./package.json').toString());
var assets_dir = 'dist/' + config.name + '/assets';
var dist_dir = {
    js: 'dist/' + config.name + '/' + config.version,
    css: 'dist/' + config.name + '/' + config.version,
    image: assets_dir + '/images',
    font: assets_dir + '/fonts'
};

var ftpConfig = {host: '', user: '', pass: ''};

// 本地运行时
gulp.task('default', ['server', 'server:restart', 'compass-watch', 'compass']);

// Node服务
gulp.task('server', function () {
    server.listen({
        path: 'app.js'
    });
});

// 重启Node服务
gulp.task('server:restart', function () {
    gulp.watch(['app.js', 'controller/*.js', 'router/*.js', 'views/**/*.html'], server.restart);
});

// compass监控
gulp.task('compass-watch', function () {
    gulp.watch('public/sass/**/*.scss', ['compass']);
});
// compass编译
gulp.task('compass', function () {
    gulp.src('public/sass/**/*.scss')
        .pipe(
        compass({
            config_file: 'config.rb',
            css: 'public/css',
            sass: 'public/sass'
        })
    )
});

// 发布到CND
gulp.task('dist', function () {
    var ftpstream = ftp(ftpConfig);
    return gulp.src('dist/**/')
        .pipe(ftpstream)
        .pipe(gutil.noop());
});

//STEP1:拷贝fonts+images到发布目录
gulp.task('assets', function () {
    gulp.src('public/img/**')
        .pipe(gulp.dest(dist_dir.image));
    gulp.src('public/fonts/*')
        .pipe(gulp.dest(dist_dir.font));
});

//STEP2:compass整合所有css到index，发布到发布目录
gulp.task('compass-production', function () {
    gulp.src('public/sass/index.scss')
        .pipe(compass({
            css: dist_dir.css,
            sass: 'public/sass',
            image: dist_dir.image,
            font: dist_dir.font,
            http_path: '/',
            style: 'compressed'
        })).on('error', function (error) {
            console.log(error);
            this.emit('end');
        });
});

//STEP3: build
gulp.task('build', function () {
    var pkg = new Package(__dirname);
    return gulp.src(pkg.main)
        .pipe(transport({
            pkg: pkg
        }))
        .pipe(concat('index-debug.js'))
        .pipe(gulp.dest(dist_dir.js))
        .pipe(uglify())
        .pipe(concat('index.js'))
        .pipe(gulp.dest(dist_dir.js));
});