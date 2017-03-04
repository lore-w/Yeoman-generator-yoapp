/*
 *@Description: Yeoman generator
 *@Author: Lore-w
 *@Email: metro-cpu@hotmail.com
 */
var util = require('util'),
    path = require('path'),
    yosay = require('yosay'),
    chalk = require('chalk'),
    dir = require('check-dir'),
    whoami = require('who-ami'),
    dateformat = require('dateformat'),
    mkdirp = require('mkdirp'),
    Generator = require('yeoman-generator');

module.exports = Generator.extend({

    constructor: function () {
        Generator.apply(this, arguments);

        this.option('skip-welcome-message', {
            desc: 'Skips the welcome message',
            type: Boolean
        });

        this.option('skip-install-message', {
            desc: 'Skips the message after the installation of dependencies',
            type: Boolean
        });
    },

    checkDir: function () {

        if (dir.checkDirSync(process.cwd())) {
            this.log(chalk.red('NOT EMPTY FOLDER!!'));
            this.notEmpty = true;
        }
    },

    askUser: function () {

        if (this.notEmpty) {

            return;
        }
        if (!this.options['skip-welcome-message']) {
            this.log(yosay(chalk.green('\'Hello~\' I include Wepack、PostCss and a gulpfile to build your app')));
        }

        var userInput = [{
            name: 'name',
            message: 'Name:',
            default: path.basename(process.cwd())
        }, {
            name: 'author',
            message: 'Author:',
            default: whoami.name
        }, {
            name: 'email',
            message: 'Email:',
            default: whoami.email
        }, {
            name: 'version',
            message: 'Version:',
            default: '0.0.1'
        }, {
            type: 'confirm',
            name: 'isMobile',
            message: 'This is a mobile app?',
            default: true
        }];

        return this.prompt(userInput).then(function (answers) {

            this.name = answers.name;
            this.author = answers.author;
            this.email = answers.email;
            this.version = answers.version;
            this.time = dateformat(new Date(), "fullDate");
            this.isMobile = answers.isMobile;

        }.bind(this));
    },
    duplicate: function () {

        if (this.notEmpty) {

            return;
        }

        this.fs.copyTpl(
            this.templatePath('html/index.html'),
            this.destinationPath('app/index.html'),
            this
        );
        this.fs.copyTpl(
            this.templatePath('gulpfile.js'),
            this.destinationPath('gulpfile.js'),
            this
        );
        this.fs.copyTpl(
            this.templatePath('package.json'),
            this.destinationPath('package.json'),
            this
        );
        this.fs.copyTpl(
            this.templatePath('webpack.config.js'),
            this.destinationPath('webpack.config.js'),
            this
        );
        this.fs.copy(
            this.templatePath('babelrc'),
            this.destinationPath('.babelrc')
        );
        this.fs.copyTpl(
            this.templatePath('README.md'),
            this.destinationPath('README.md'),
            this
        );
        this.fs.copy(
            this.templatePath('gitignore'),
            this.destinationPath('.gitignore')
        );
        this.fs.copy(
            this.templatePath('editorconfig'),
            this.destinationPath('.editorconfig')
        );

        this.sourceRoot(path.join(__dirname, 'templates', 'assets'));
        this.fs.copyTpl(
            this.templatePath('.'),
            this.destinationPath('app'),
            this
        );
        mkdirp('app/javascript/lib');
        mkdirp('app/images');
        mkdirp('app/fonts');
    },
    end: function () {

        if (this.notEmpty) {

            return;
        }

        this.log(chalk.green("YOAPP INIT DONE") + '\n');
    }
});
