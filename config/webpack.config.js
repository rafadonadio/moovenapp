var path = require('path');
var defaultConfig = require('@ionic/app-scripts/config/webpack.config.js');

var env = process.env.IONIC_ENV;

var devWebPackConfig = defaultConfig.dev;
devWebPackConfig.resolve.alias = {
  "@app/env": path.resolve('./src/environments/environment.' + env + '.ts')
};

var prodWebPackConfig = defaultConfig.prod;
prodWebPackConfig.resolve.alias = {
  "@app/env": path.resolve('./src/environments/environment.' + env + '.ts')
};

module.exports = {
  dev: devWebPackConfig,
  prod: prodWebPackConfig
};