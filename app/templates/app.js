/*
 *@description: 服务端入口文件
 *@author: <%= author%>
 *@email: <%= email%>
 *@time: <%= time%>
 */

var express = require('express'),
    path = require('path'),
    favicon = require('serve-favicon'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    hbs = require('hbs');

var app = express();

var router = require('./router/router');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');

app.engine('html', hbs.__express);
hbs.registerPartials(__dirname + '/views/partials');

//uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//router
router(app);

//server
app.listen(3000, function () {
    console.log('server start');
});

module.exports = app;
