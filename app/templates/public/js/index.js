
var $ = require('jquery');
require('spm-pjax');

$(function () {
    $(document).pjax('a', '#pjax-container');
});

//$('a').pjax('#pjax-container');