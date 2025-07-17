'use strict';

const fs = require('node:fs')
const path = require('node:path');

class ConfigManager {

    constructor(config, api) {
        this.api = api;
        this.config = config;
        this.persistFile = path.join(this.api.user.persistPath(), 'airstage-tokens.json');
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
}

module.exports = ConfigManager;
