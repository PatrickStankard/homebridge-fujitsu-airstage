'use strict';

const fs = require('node:fs');
const path = require('node:path');

class ConfigManager {
    constructor(config, api) {
        this.api = api;
        this.config = config;
        this.persistFile = path.join(this.api.user.persistPath(), 'airstage-tokens.json');
    }

    // Save tokens and password to persistPath (secure, not exposed in UI)
    saveTokensToPersistPath(accessToken, accessTokenExpiry, refreshToken, password = null) {
        const tokens = {
            accessToken,
            accessTokenExpiry: accessTokenExpiry ? accessTokenExpiry.toISOString() : null,
            refreshToken
        };
        // Only persist password if rememberEmailAndPassword is true
        if (this.config.rememberEmailAndPassword && password) {
            tokens.password = password;
        }
        try {
            fs.writeFileSync(this.persistFile, JSON.stringify(tokens, null, 2), { mode: 0o600 });
        } catch (err) {
            if (this.api && this.api.logger) {
                this.api.logger.error('Failed to write Airstage tokens to persistPath:', err.message);
            }
        }
    }

    // Retrieve tokens and password from persistPath
    getTokensFromPersistPath() {
        try {
            if (fs.existsSync(this.persistFile)) {
                const data = fs.readFileSync(this.persistFile, 'utf8');
                const tokens = JSON.parse(data);
                return {
                    accessToken: tokens.accessToken || null,
                    accessTokenExpiry: tokens.accessTokenExpiry ? new Date(tokens.accessTokenExpiry) : null,
                    refreshToken: tokens.refreshToken || null,
                    password: tokens.password || null
                };
            }
        } catch (err) {
            if (this.api && this.api.logger) {
                this.api.logger.error('Failed to read Airstage tokens from persistPath:', err.message);
            }
        }
        return { accessToken: null, accessTokenExpiry: null, refreshToken: null, password: null };
    }

    // Save tokens (main entry point)
    async saveTokens(accessToken, accessTokenExpiry, refreshToken, password = null) {
        this.saveTokensToPersistPath(accessToken, accessTokenExpiry, refreshToken, password);
    }

    // Retrieve tokens (main entry point)
    async getTokens() {
        // Try persistPath first
        const tokens = this.getTokensFromPersistPath();
        if (tokens.accessToken || tokens.refreshToken) {
            return tokens;
        }
        // Fallback: migrate from config if present
        const accessToken = this.config.accessToken || null;
        const accessTokenExpiry = this.config.accessTokenExpiry ? new Date(this.config.accessTokenExpiry) : null;
        const refreshToken = this.config.refreshToken || null;
        let password = null;
        if (this.config.rememberEmailAndPassword && this.config.password) {
            password = this.config.password;
        }
        if (accessToken || refreshToken) {
            // Migrate to persistPath
            this.saveTokensToPersistPath(accessToken, accessTokenExpiry, refreshToken, password);
            return { accessToken, accessTokenExpiry, refreshToken, password };
        }
        return { accessToken: null, accessTokenExpiry: null, refreshToken: null, password: null };
    }

    // Deprecated: Only for legacy Homebridge v1 fallback
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

    // Deprecated: No longer used in Homebridge v2+
    _readFileSync(path) {
        return fs.readFileSync(path).toString();
    }

    _writeFileSync(path, jsonString) {
        return fs.writeFileSync(path, jsonString);
    }
}

module.exports = ConfigManager;
