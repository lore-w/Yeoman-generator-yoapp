/*
 * @description: 路由处理文件
 * @author: lore-w
 * @time: 2015/10/1
 */

var controller = require('../controller/controller');

module.exports = function (app) {
  app.get('/', controller.home);

  app.get('/page/:id', controller.page);
};