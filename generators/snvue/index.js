/*
 *@Description: Yeoman generator
 *@Author: Lore-w
 *@Email: metro-cpu@hotmail.com
 */
let util = require('util'),
  path = require('path'),
  chalk = require('chalk'),
  dir = require('check-dir'),
  whoami = require('who-ami'),
  dateformat = require('dateformat'),
  mkdirp = require('mkdirp'),
  Generator = require('yeoman-generator');


module.exports = class extends Generator {
  constructor(args, opts) {
    super(args, opts);

    this.option('skip-message');
    this.option('skip-install');
  }

  checkDir() {
    if (dir.checkDirSync(process.cwd())) {
      this.log(chalk.red('NEED EMPTY FOLDER'));
      this.notEmpty = true;
    }
  }

  question() {
    if (this.notEmpty) return;
    if (!this.options['skip-message']) {
      this.log(chalk.green('START'));
    }

    const REG = new RegExp("[\\u4E00-\\u9FFF]+", "g"),
      CWDNAME = path.basename(process.cwd()),
      NAME = REG.test(CWDNAME) ? 'yodemo' : CWDNAME.toLowerCase();

    let userInput = [
      {name: 'name', message: 'Name:', default: NAME},
      {name: 'author', message: 'Author:', default: whoami.name},
      {name: 'email', message: 'Email:', default: whoami.email},
      {name: 'version', message: 'Version:', default: '1.0.0'},
      {name: 'cmsMenu', message: 'Cms Menu:', default: 'o2o'},
      {
        type: 'checkbox',
        name: 'lib',
        message: 'You want to use?',
        choices: [
          {name: 'GEO', value: 'geo', checked: false},
          {name: 'SWIPER', value: 'swiper', checked: false}
        ]}
      ];

    return this.prompt(userInput).then(data => {
      let lib = data.lib;

      function hasLib(name) {
        return lib.join().indexOf(name) !== -1;
      }
      this.name = data.name;
      this.author = data.author;
      this.email = data.email;
      this.version = data.version;
      this.cmsMenu = data.cmsMenu;
      this.time = dateformat(new Date(), "yyyy/mm/dd HH:MM:ss");

      this.geo = hasLib('geo');
      this.swiper = hasLib('swiper');
    });
  }

  copy() {
    if (this.notEmpty) return;

    this.fs.copy(
      this.templatePath('babelrc'),
      this.destinationPath('.babelrc')
    );
    this.fs.copy(
      this.templatePath('gitignore'),
      this.destinationPath('.gitignore')
    );
    this.fs.copy(
      this.templatePath('editorconfig'),
      this.destinationPath('.editorconfig')
    );

    this.fs.copyTpl(
      this.templatePath('README.md'),
      this.destinationPath('README.md'),
      this
    );
    this.fs.copyTpl(
      this.templatePath('postcssrc.js'),
      this.destinationPath('.postcssrc.js'),
      this
    );
    this.fs.copyTpl(
      this.templatePath('index.html'),
      this.destinationPath('index.html'),
      this
    );
    this.fs.copyTpl(
      this.templatePath('package.json'),
      this.destinationPath('package.json'),
      this
    );

    this.sourceRoot(path.join(__dirname, 'templates', 'src'));
    this.fs.copyTpl(
      this.templatePath('.'),
      this.destinationPath('src'),
      this
    );

    this.sourceRoot(path.join(__dirname, 'templates', 'build'));
    this.fs.copyTpl(
      this.templatePath('.'),
      this.destinationPath('build'),
      this
    );

    this.sourceRoot(path.join(__dirname, 'templates', 'conf'));
    this.fs.copyTpl(
      this.templatePath('.'),
      this.destinationPath('conf'),
      this
    );

    this.sourceRoot(path.join(__dirname, 'templates', 'src'));
    this.fs.copyTpl(
      this.templatePath('.'),
      this.destinationPath('src'),
      this
    );

    this.sourceRoot(path.join(__dirname, 'templates', 'static'));
    this.fs.copy(
      this.templatePath('keep'),
      this.destinationPath('static/.keep')
    );

    mkdirp('cmsDist/cmsWeb/suning/' + this.cmsMenu + '/wap/' + this.name);
    mkdirp('cmsDist/data/' + this.cmsMenu);
    mkdirp('cmsDist/model/' + this.cmsMenu);
    mkdirp('cmsDist/templates/' + this.cmsMenu + '/wap/' + this.name);
  }

  install() {

    let _this = this;
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
  }

  end() {
    if (this.notEmpty) return;
    this.log(chalk.green('############'));
    this.log(chalk.green('INIT DONE'));
    this.log(chalk.green('############'));
  }
};