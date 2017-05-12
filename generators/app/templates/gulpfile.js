/*
 *@description: <%= name %>
 *@author: <%= author %>
 *@email: <%= email %>
 *@time: <%= time %>
 */
"use strict";
const fs = require('fs'),
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
  nestcss = require('precss'),
  autoprefixer = require('autoprefixer'),
  assets = require('postcss-assets'),
  cssnano = require('gulp-cssnano'),
  toRem = require('2rem'),
  sourcemap = require('gulp-sourcemaps'),
  rev = require('gulp-rev'),
  del = require('del'),
  inject = require('gulp-inject'),
  _ = require('lodash'),
  merge = require('webpack-merge'),
  Utils = require('./build/utils'),
  buildConf = require('./conf');

const argv = yargs.option('evn', {
  alias: 'e',
  demand: true,
  default: 'dev',
  describe: '["dev", "pre", "prd"]',
  type: 'string'
}).usage('Usage: gulp [options]').example('gulp --evn=dev').help('h').alias('h', 'help').locale('en').argv;


const ROOT_PATH = path.resolve(__dirname),
  SRC_PATH = path.resolve(ROOT_PATH, 'src'),
  DIST_PATH = path.resolve(ROOT_PATH, 'dist'),
  PORT = buildConf.dev.port,
  BASE_URL = 'http://' + Utils.getIp(),
  EVN = argv.evn,
  RESOURCEURI = buildConf[EVN].resourceUri;

let taskList;


// Connect Server
gulp.task('connect', function() {
  connect.server({
    port: PORT,
    root: ROOT_PATH,
    base: BASE_URL,
    livereload: true
  });
});

// Open Browser
gulp.task('open', function() {
  let browser = Utils.getBrowser(),
    browserConf = {
      app: browser,
      uri: BASE_URL + ':' + PORT + '/dist/index.html'
    };
  !browser && delete browserConf.app;
  gulp.src(__filename).pipe(open(browserConf));
});

// JS
gulp.task('webpack', function(cb) {

  Utils.readSetting(path.resolve(SRC_PATH, 'app.conf.json')).then(function(data) {

    let src = path.resolve(SRC_PATH, 'javascript/commons/conf.js'),
      d = 'const CONF = ' + JSON.stringify(Utils.getEvnSetting(data, EVN)) + ';export default CONF;';

    return Utils.writeSetting(src, d);
  }).then(function(data) {

    if (data === true) {

      gutil.log(gutil.colors.green('WRITE SETTING DONE'));

      let webpackConf = EVN === 'dev' ? require('./build/webpack.dev.conf') : require('./build/webpack.prod.conf');

      webpack(merge(webpackConf, {
        output: {
          path: path.resolve(DIST_PATH, 'assets')
        }
      }), function(err, stats) {
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

  return gulp.src([path.resolve(DIST_PATH, 'assets/*.js')])
    .pipe(gulpif(EVN === 'dev', connect.reload()));
});

// css
gulp.task('css', function() {

  let taskArr = [
    nestcss,
    autoprefixer({
      remove: false
    }),
    assets({
      cachebuster: true,
      relative: SRC_PATH,
      loadPaths: [path.resolve(SRC_PATH, 'images')]
    }),
    toRem
  ];

  return gulp.src(path.resolve(SRC_PATH, 'style/index.css'))
    .pipe(gulpif(EVN === 'dev', sourcemap.init()))
    .pipe(postcss(taskArr))
    .pipe(gulpif(EVN !== 'dev', rev()))
    .pipe(gulpif(EVN !== 'dev', cssnano()))
    .pipe(gulpif(EVN === 'dev', sourcemap.write()))
    .pipe(gulp.dest(path.resolve(DIST_PATH, 'assets')))
    .pipe(gulpif(EVN === 'dev', connect.reload()));
});

gulp.task('cp:fonts', function() {

  return gulp.src([path.resolve(SRC_PATH, 'fonts/*')])
    .pipe(gulp.dest(path.resolve(DIST_PATH, 'assets/fonts')))
    .pipe(connect.reload());
});
gulp.task('cp:images', function() {

  return gulp.src([path.resolve(SRC_PATH, 'images/**')])
    .pipe(gulp.dest(path.resolve(DIST_PATH, 'assets/images')))
    .pipe(connect.reload());
});

gulp.task('cp', ['cp:fonts', 'cp:images']);

// html
gulp.task('html', function() {

  let target = gulp.src(path.resolve(SRC_PATH, '*.html')),
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
        return '<script src="' + RESOURCEURI + filepath + '"></script>';
      }
    })).pipe(inject(sources, {
      transform: function(filepath) {

        let pathSplit = filepath.split('.'),
          extension = pathSplit[pathSplit.length - 1];

        if (extension === 'js') {
          return '<script src="' + RESOURCEURI + filepath + '"></script>';
        } else if (extension === 'css') {
          return '<link rel="stylesheet" href="' + RESOURCEURI + filepath + '">';
        } else {
          gutil.log(gutil.colors.red('Match Error'));
        }
      }
    })).pipe(gulp.dest(DIST_PATH))
    .pipe(connect.reload());
});

// del
gulp.task('del:dist', function() {

  return del(DIST_PATH);
});

//dev
gulp.task('dev', function() {

  runSequence('del:dist', ['js', 'css', 'cp'], 'html', ['connect', 'watch', 'open']);
});
// build
gulp.task('build', function() {

  runSequence('del:dist', ['js', 'css', 'cp'], 'html');
});

// watch
gulp.task('watch', function() {
  gulp.watch(['./src/style/**/*.css'], ['css']);
  gulp.watch(['./src/javascript/**/*.js', './src/app.conf.json'], ['js']);
  gulp.watch(['./src/*.html'], ['html']);
  gulp.watch(['./src/fonts/**/*.*'], ['cp:fonts']);
  gulp.watch(['./src/images/**/*.*'], ['cp:images']);
});

taskList = EVN === 'dev' ? ['dev'] : ['build'];
gulp.task('default', taskList);
