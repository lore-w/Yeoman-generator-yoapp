/*
 *@description: 首页js
 *@author: <%= author %>
 *@email: <%= email %>
 *@time: <%= time %>
 */

import Service from '../commons/service';
<% if (jquery) { %>
require("imports-loader?$=jquery!../lib/jquery.plugin.demo.js");
$('#demo').sayHello();
<% } %>
Service.demo();
