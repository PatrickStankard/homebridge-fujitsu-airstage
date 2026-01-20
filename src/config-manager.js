'use strict';

const fs = require('node:fs')
const path = require('node:path');

class ConfigManager {

    constructor(config, api) {
        this.api = api;
        this.config = config;
        this.persistFile = path.join(this.api.user.persistPath(), 'airstage-tokens.json');
        this.temperatureScaleFile = path.join(this.api.user.persistPath(), 'airstage-temperature-scales.json');
    }

    // Persists the access token, access token expiry, and refresh token to storage
    saveTokens(accessToken, accessTokenExpiry, refreshToken) {
        try {
            const tokens = {
                accessToken,
                accessTokenExpiry: accessTokenExpiry ? accessTokenExpiry.toISOString() : null,
                refreshToken
            };
            fs.writeFileSync(this.persistFile, JSON.stringify(tokens, null, 2), { mode: 0o600 });
        } catch (err) {
            if (this.api && this.api.logger) {
                this.api.logger.error('Failed to write Airstage tokens to persistPath:', err.message);
            }
        }
    }

    // Retrieves the access token, access token expiry, and refresh token from storage
    getTokens() {
        let tokens = { accessToken: null, accessTokenExpiry: null, refreshToken: null };

        try {
            if (fs.existsSync(this.persistFile)) {
                const data = fs.readFileSync(this.persistFile, 'utf8');
                const tokensData = JSON.parse(data);
                tokens.accessToken = tokensData?.accessToken || null;
                tokens.accessTokenExpiry = tokensData?.accessTokenExpiry ? new Date(tokensData.accessTokenExpiry) : null;
                tokens.refreshToken = tokensData?.refreshToken || null;
            } else {
                tokens = this.migrateTokensFromConfig();
            }
        } catch (err) {
            if (this.api && this.api.logger) {
                this.api.logger.error('Failed to read Airstage tokens from persistPath:', err.message);
            }
        }

        return tokens;
    }

    // Migrates tokens from the Homebridge config to the new storage location
    migrateTokensFromConfig() {
        // Backwards compatibility: Get tokens from Homebridge config
        const tokens = {
            accessToken: this.config.accessToken || null,
            accessTokenExpiry: this.config.accessTokenExpiry ? new Date(this.config.accessTokenExpiry) : null,
            refreshToken: this.config.refreshToken || null
        };

        // Store tokens in new appropriate location
        this.saveTokens(tokens.accessToken, tokens.accessTokenExpiry, tokens.refreshToken);

        return tokens;
    }

    // Persists temperature scale preference for a specific device
    saveTemperatureScale(deviceId, scale) {
        try {
            const scales = this.getTemperatureScales();
            scales[deviceId] = scale;
            fs.writeFileSync(this.temperatureScaleFile, JSON.stringify(scales, null, 2), { mode: 0o600 });
        } catch (err) {
            if (this.api && this.api.logger) {
                this.api.logger.error('Failed to write temperature scales to persistPath:', err.message);
            }
        }
    }

    // Retrieves all saved temperature scale preferences
    getTemperatureScales() {
        try {
            if (fs.existsSync(this.temperatureScaleFile)) {
                const data = fs.readFileSync(this.temperatureScaleFile, 'utf8');
                return JSON.parse(data);
            }
        } catch (err) {
            if (this.api && this.api.logger) {
                this.api.logger.error('Failed to read temperature scales from persistPath:', err.message);
            }
        }
        return {};
    }

    // Retrieves temperature scale for a specific device (returns null if not set)
    getTemperatureScale(deviceId) {
        const scales = this.getTemperatureScales();
        return scales[deviceId] || null;
    }
}

module.exports = ConfigManager;
