/*
 *@description: app build conf
 *@author: <%= author %>
 *@email: <%= email %>
 *@time: <%= time %>
 */

module.exports = {
  dev: {
    port: 8080,
    server: true,
    resourceUri: '../'
  },
  pre: {
    port: 8080,
    server: false,
    resourceUri: ''
  },
  prd: {
    port: 8080,
    server: false,
    resourceUri: ''
  },
};
