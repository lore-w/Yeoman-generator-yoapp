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
  constructor: function() {
    Generator.apply(this, arguments);
    this.option('skip-welcome-message', {
      desc: 'Skip the welcome message',
      type: Boolean
    });
    this.option('skip-install', {
      desc: 'Skip install the dependencies',
      type: Boolean
    });
  },

  checkDir: function() {
    if (dir.checkDirSync(process.cwd())) {
      this.log(chalk.red('NEED EMPTY FOLDER'));
      this.notEmpty = true;
    }
  },

  askUser: function() {
    if (this.notEmpty) return;
    if (!this.options['skip-welcome-message']) {
      this.log(yosay(chalk.green('START')));
    }

    var regDetection = new RegExp("[\\u4E00-\\u9FFF]+", "g"),
      floderName = path.basename(process.cwd());

    var userInput = [{
      name: 'name',
      message: 'Name:',
      default: regDetection.test(floderName) ? 'demo' : floderName.toLowerCase()
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
      default: '1.0.0'
    }, {
      type: 'confirm',
      name: 'isMobile',
      message: 'This is a mobile app?',
      default: true
    }, {
      type: 'checkbox',
      name: 'lib',
      message: 'You want to install?',
      choices: [{
        name: 'jquery',
        value: 'jquery',
        checked: true
      }, {
        name: 'lodash',
        value: 'lodash',
        checked: false
      }, {
        name: 'mustache',
        value: 'mustache',
        checked: false
      }]
    }];

    return this.prompt(userInput).then(function(answers) {

      var lib = answers.lib,
        selectList = ['jquery', 'lodash', 'mustache'],
        listLen = selectList.length,
        i;

      function hasLib(name) {
        return lib.join().indexOf(name) !== -1;
      }
      this.name = answers.name;
      this.author = answers.author;
      this.email = answers.email;
      this.version = answers.version;
      this.time = dateformat(new Date(), "yyyy/mm/dd HH:MM:ss");
      this.isMobile = answers.isMobile;

      this.jquery = hasLib('jquery');
      this.lodash = hasLib('lodash');
      this.mustache = hasLib('mustache');
      this.hasLibs = false;

      for (i = 0; i < listLen; i++) {
        if (hasLib(selectList[i])) {
          this.hasLibs = true;
        }
      }
    }.bind(this));
  },

  duplicate: function() {
    if (this.notEmpty) return;

    this.fs.copy(this.templatePath('babelrc'), this.destinationPath('.babelrc'));
    this.fs.copy(this.templatePath('gitignore'), this.destinationPath('.gitignore'));
    this.fs.copy(this.templatePath('editorconfig'), this.destinationPath('.editorconfig'));

    this.fs.copyTpl(this.templatePath('README.md'), this.destinationPath('package.json'), this);
    this.fs.copyTpl(this.templatePath('gulpfile.js'), this.destinationPath('gulpfile.js'), this);
    this.fs.copyTpl(this.templatePath('package.json'), this.destinationPath('package.json'), this);

    this.sourceRoot(path.join(__dirname, 'templates', 'assets'));
    this.fs.copyTpl(this.templatePath('.'), this.destinationPath('src'), this);

    this.sourceRoot(path.join(__dirname, 'templates', 'build'));
    this.fs.copyTpl(
      this.templatePath('utils.js'),
      this.destinationPath('build/utils.js'),
      this
    );
    this.fs.copyTpl(
      this.templatePath('webpack.base.conf.html'),
      this.destinationPath('build/webpack.base.conf.js'),
      this
    );
    this.fs.copyTpl(
      this.templatePath('webpack.dev.conf.html'),
      this.destinationPath('build/webpack.dev.conf.js'),
      this
    );
    this.fs.copyTpl(
      this.templatePath('webpack.prod.conf.html'),
      this.destinationPath('build/webpack.prod.conf.js'),
      this
    );

    this.sourceRoot(path.join(__dirname, 'templates', 'conf'));
    this.fs.copyTpl(this.templatePath('.'), this.destinationPath('conf'), this);

    this.sourceRoot(path.join(__dirname, 'templates', 'src'));
    this.fs.copyTpl(this.templatePath('.'), this.destinationPath('src'), this);

    mkdirp('src/fonts');
    mkdirp('src/images');
  },
  install: function() {

    var _this = this;
    if (_this.notEmpty) return;
    if (!this.options['skip-install']) {
      this.installDependencies({
        bower: false,
        npm: true,
        callback: function() {
          _this.log(chalk.green("NPM INSTALL SUCCESS") + '\n');
        }
      });
    }
  },
  end: function() {
    if (this.notEmpty) return;
    this.log(chalk.green('############'));
    this.log(chalk.green('INIT DONE'));
    this.log(chalk.green('############'));
  }
});
