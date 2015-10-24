/*
 * @description: 控制器文件
 * @author: lore-w
 * @time: 2015/10/1
 */

exports.home = function (req, res) {
    res.renderPjax('index', { title: 'Pjax' });
};

exports.page = function (req, res) {
    console.log(req);
    res.renderPjax('page', { page: req.params.id });
};