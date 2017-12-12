/*
 *@description: Utils
 *@author: <%= author %>
 *@email: <%= email %>
 *@time: <%= time %>
 */

let fs = require('fs'),
  os = require('os'),
  path = require('path'),
  _ = require('lodash');

exports.getIp = function() {

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
};

exports.getBrowser = function() {

  let browser = '';

  if (os.platform() === 'linux') {
    browser = 'google-chrome';
  } else if (os.platform() === 'darwin') {
    browser = 'google chrome';
  } else if (os.platform() === 'win32') {
    browser = 'chrome';
  }

  return browser;
};

exports.removeComments = function(str) {

  //let lineComments = /(?<![":])\/\/.*/g; //负向零宽断言

  let blockComments = /\/\*[\s\S]*?\*\//g;

  return str.replace(blockComments, '');
};

exports.getEvnSetting = function(obj, evn) {

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
};

exports.readSetting = function(src) {
  return new Promise(function(resolve, reject) {
    fs.readFile(src, 'utf-8', function(err, data) {
      if (err) {
        reject(new Error(err));
      } else {
        resolve(JSON.parse(exports.removeComments(data)));
      }
    })
  });
};

exports.writeSetting = function(src, data) {

  return new Promise(function(resolve, reject) {
    fs.writeFile(src, data, 'utf-8', function(err) {
      if (err) {
        reject(new Error(err));
      } else {
        resolve(true);
      }
    })
  });
};
