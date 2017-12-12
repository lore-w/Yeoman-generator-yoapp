/*
 *@description: app build conf
 *@author: <%= author %>
 *@email: <%= email %>
 *@time: <%= time %>
 */

module.exports = {
  DEV: {
    port: 8080,
    resourceUri: '../'
  },
  PRE: {
    resourceUri: '${resDomain}/project／cmsWeb/suning/<%= cmsMenu %>/wap/<%= name %>/',
    cmsTemplatesPath: 'cmsWeb/suning/<%= cmsMenu %>/wap/<%= name %>',
    cmsStaticPath: 'templates/<%= cmsMenu %>/wap/<%= name %>'
  },
  PRD: {
    resourceUri: '${resDomain}/project／cmsWeb/suning/<%= cmsMenu %>/wap/<%= name %>/',
    cmsTemplatesPath: 'cmsWeb/suning/<%= cmsMenu %>/wap/<%= name %>',
    cmsStaticPath: 'templates/<%= cmsMenu %>/wap/<%= name %>'
  }
};
