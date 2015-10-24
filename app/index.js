var util = require('util');
var path = require('path');
var yosay = require('yosay');
var yeoman = require('yeoman-generator');

module.exports = Yoapp;

function Yoapp(args, options, config) {
    yeoman.generators.Base.apply(this, arguments);
    this.version = args[0] || '1.0';
    this.cwd = options.env.cwd;
    this.componentName = path.basename(this.cwd);

    this.on('end', function () {
        this.installDependencies({
            bower: false
        });
        console.log("依赖安装完成");
    })
}

util.inherits(Yoapp, yeoman.generators.Base);

var app = Yoapp.prototype;


/*
 *@Description: 显示欢迎信息
 *@Tip: askFor非内置函数，名字可以自定义，代码会按顺序依次执行
 */
app.askFor = function () {
    console.log(yosay('Hello Yoapp'));
};

app.askAuthor = function () {

    var cb = this.async();

    var authorAnswer = [
        {name: 'author', message: 'Your Name?', default: ''},
        {name: 'email', message: 'Your Email?', default: ''},
        {
            type: 'checkbox',
            name: 'spm',
            message: 'You want to install?',
            choices: [
                {name: 'zepto', value: 'zepto', checked: true},
                {name: 'swiper', value: 'swiper', checked: false},
                {name: 'hammer', value: 'hammer', checked: false},
                {name: 'jquery', value: 'jquery', checked: false},
                {name: 'handlerbars', value: 'handlerbars', checked: false}
            ]
        }
    ];

    this.prompt(authorAnswer, function (props) {

        var spm = props.spm;

        function hasPkg(val) {
            return spm.join().indexOf(val) !== -1;
        }

        this.author = props.author;
        this.email = props.email;

        this.zepto = hasPkg('zepto');
        this.swiper = hasPkg('swiper');
        this.hammer = hasPkg('hammer');
        this.jquery = hasPkg('jquery');
        this.handlerbars = hasPkg('handlerbars');

        cb();

    }.bind(this));
};

//拷贝文件
app.duplicate = function () {
    this.template('controller/', 'controller/');
    this.template('public/', 'public/');
    this.template('router/', 'router/');
    this.template('views/', 'views/');
    this.template('_.gitignore', '.gitignore');
    this.template('_package.json', 'package.json');
    this.template('app.js', 'app.js');
    this.template('README.md', 'README.md');
};

//安装依赖

app.install = function () {

    var installArr = [];

    if (this.zepto) {
        installArr.push('spm-zepto');
    }
    if (this.swiper) {
        installArr.push('spm-swiper');
    }
    if (this.hammer) {
        installArr.push('spm-hammer');
    }
    if (this.jquery) {
        installArr.push('jquery@1.8.3');
    }
    if (this.handlerbars) {
        installArr.push('spm-handlerbars');
    }

    if (installArr.length > 0) {

        var args = ['install', '--save'].concat(installArr);

        this.spawnCommand('spm', args, {
            stdio: 'ignore'
        });

        //install dev dependencies
        this.spawnCommand('spm', ['install', 'expect.js'], {
            stdio: 'ignore'
        });
    }
};

