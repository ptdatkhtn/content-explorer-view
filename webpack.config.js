const path = require('path');

module.exports = {
    //...
    resolve: {
      // configuration options
      alias: {
             "styled-components": path.resolve('./node_modules/styled-components', "node_modules", "styled-components")
         }
    }
  };
  