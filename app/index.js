/*
 *@Description: Yeoman生成器
 *@Author: lore-w
 *@Email: metro-cpu@hotmail.com
 */
var util = require('util');
var path = require('path');
var yosay = require('yosay');
var chalk = require('chalk');
var dir = require('check-dir');
var whoami = require('whoami');
var yeoman = require('yeoman-generator');

module.exports = Yoapp;

function Yoapp(args, options, config) {
    yeoman.generators.Base.apply(this, arguments);

    //this.cwd = options.env.cwd;

    this.on('end', function () {

        if (!this.isEmpt) {
            this.installDependencies({
                bower: false,
                skipMessage: true
            });
            console.log(
                    chalk.red("-------------")+'\n'+
                    chalk.red("Yoapp创建完成")+'\n'+
                    chalk.red("-------------")+'\n'
            );
        }
    })
}

util.inherits(Yoapp, yeoman.generators.Base);

var app = Yoapp.prototype;


/*
 *@Description: 显示欢迎信息
 *@Tip: checkDir非内置函数，名字可以自定义，代码会按顺序依次执行
 */
app.checkDir = function () {

    if (dir.checkDirSync(process.cwd())) {
        console.log(chalk.red('文件夹非空'));
        this.isEmpt = true;
    }
};

app.askFor = function () {

    if (this.isEmpt) {
        return;
    }

    console.log(yosay(chalk.white('创建一个Yoapp')));
};

app.askAuthor = function () {

    if (this.isEmpt) {
        return;
    }

    var cb = this.async();

    var authorAnswer = [
        {name: 'name', message: 'name:', default: path.basename(process.cwd())},
        {name: 'author', message: 'author:', default: whoami},
        {name: 'version', message: 'version:', default: '0.0.1'},
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

        this.name = props.name;
        this.author = props.author;
        this.version = props.version;

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

    if (this.isEmpt) {
        return;
    }

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

    if (this.isEmpt) {
        return;
    }

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