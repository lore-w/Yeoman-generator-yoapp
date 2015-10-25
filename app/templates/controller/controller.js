/*
 *@description: 控制器文件
 *@author: <%= author%>
 *@email: <%= email%>
 *@time: <%= time%>
 */

exports.index = function (req, res) {
    res.render('index', { title: 'demo' });
};