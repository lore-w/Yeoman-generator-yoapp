/*
 *@description: 路由处理文件
 *@author: <%= author%>
 *@email: <%= email%>
 *@time: <%= time%>
 */

var controller = require('../controller/controller');

module.exports = function (app) {
  // 首页
  app.get('/', controller.home);
};