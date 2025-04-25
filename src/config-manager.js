'use strict';

const fs = require('node:fs');

class ConfigManager {

    constructor(config, api) {
        this.api = api;
        this.config = config;
    }

    updateConfigWithAccessToken(accessToken, accessTokenExpiry, refreshToken) {
        // Only used for Homebridge v1 fallback
        const homebridgeConfigPath = this.api.user.configPath();
        const homebridgeConfigString = this._readFileSync(homebridgeConfigPath);
        let homebridgeConfig = JSON.parse(homebridgeConfigString);
        let accessTokenExpiryISO = null;

        if (accessTokenExpiry !== null && accessTokenExpiry !== undefined) {
            accessTokenExpiryISO = accessTokenExpiry instanceof Date ? accessTokenExpiry.toISOString() : accessTokenExpiry;
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

    // Save tokens using Homebridge v2 storage API
    async saveTokensToStorage(accessToken, accessTokenExpiry, refreshToken) {
        const tokens = {
            accessToken,
            accessTokenExpiry: accessTokenExpiry ? accessTokenExpiry.toISOString() : null,
            refreshToken
        };
        if (this.api.storage && typeof this.api.storage.setItem === 'function') {
            await this.api.storage.setItem('airstage-tokens', tokens);
        } else {
            // Homebridge v1 fallback: update config file
            this.updateConfigWithAccessToken(accessToken, accessTokenExpiry, refreshToken);
        }
    }

    // Retrieve tokens using Homebridge v2 storage API
    async getTokensFromStorage() {
        if (this.api.storage && typeof this.api.storage.getItem === 'function') {
            const tokens = await this.api.storage.getItem('airstage-tokens');
            if (!tokens) return { accessToken: null, accessTokenExpiry: null, refreshToken: null };
            return {
                accessToken: tokens.accessToken || null,
                accessTokenExpiry: tokens.accessTokenExpiry ? new Date(tokens.accessTokenExpiry) : null,
                refreshToken: tokens.refreshToken || null
            };
        } else {
            // Homebridge v1 fallback: read from config
            const accessToken = this.config.accessToken || null;
            const accessTokenExpiry = this.config.accessTokenExpiry ? new Date(this.config.accessTokenExpiry) : null;
            const refreshToken = this.config.refreshToken || null;
            return { accessToken, accessTokenExpiry, refreshToken };
        }
    }

    // Deprecated: No longer used in Homebridge v2+
    _readFileSync(path) {
        return fs.readFileSync(path).toString();
    }

    _writeFileSync(path, jsonString) {
        return fs.writeFileSync(path, jsonString);
    }
}

module.exports = ConfigManager;
