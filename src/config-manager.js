'use strict';

const fs = require('node:fs');

class ConfigManager {

    constructor(config, api) {
        this.api = api;
        this.config = config;
    }

    updateConfigWithAccessToken(accessToken, accessTokenExpiry, refreshToken) {
        const homebridgeConfigPath = this.api.user.configPath();
        const homebridgeConfigString = this._readFileSync(homebridgeConfigPath);

        let homebridgeConfig = JSON.parse(homebridgeConfigString);
        let accessTokenExpiryISO = null;

        if (accessTokenExpiry !== null) {
            accessTokenExpiryISO = accessTokenExpiry.toISOString();
        }

        if (this.config.rememberEmailAndPassword === false) {
            this.config.email = null;
            this.config.password = null;
        }

        this.config.accessToken = accessToken;
        this.config.accessTokenExpiry = accessTokenExpiryISO;
        this.config.refreshToken = refreshToken;

        homebridgeConfig.platforms.some(function(platformConfig, idx, platforms) {
            if (platformConfig.platform === this.config.platform) {
                platforms[idx] = this.config;

                return true;
            }
        }, this);

        const updatedConfigString = JSON.stringify(homebridgeConfig, null, 4);

        if (updatedConfigString !== homebridgeConfigString) {
            this._writeFileSync(homebridgeConfigPath, updatedConfigString);

            return true;
        }

        return false;
    }

    _readFileSync(path) {
        return fs.readFileSync(path).toString();
    }

    _writeFileSync(path, jsonString) {
        return fs.writeFileSync(path, jsonString);
    }
}

module.exports = ConfigManager;
