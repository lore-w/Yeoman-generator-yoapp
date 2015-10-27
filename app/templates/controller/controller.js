/*
 *@description: 控制器文件
 *@author: <%= author%>
 *@email: <%= email%>
 *@time: <%= time%>
 */

var data = require('../public/data/data');

exports.index = function (req, res) {

    res.render('pages/index', {
        data: data.index(),
        layout: '../views/layout/layout',
        jsPath: '["public/js/index"]'
    });

};