'use strict';

const Platform = require('./platform');
const settings = require('./settings');

module.exports = (api) => {
    api.registerPlatform(settings.PLATFORM_NAME, Platform);
};
