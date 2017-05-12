/*
 *@description: js
 *@author: <%= author %>
 *@email: <%= email %>
 *@time: <%= time %>
 */

import CONF from './conf';

let Service = {
  demo() {
    console.log(CONF.shareUrl);
  }
};

export default Service;
