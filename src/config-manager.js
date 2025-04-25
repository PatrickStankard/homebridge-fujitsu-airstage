'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const settings = require('./settings');

// Helper: get Homebridge setup ID (returns string or empty if not available)
function getSetupID(api) {
    try {
        if (api && api.user && typeof api.user.getSetupId === 'function') {
            return api.user.getSetupId() || '';
        }
        // Homebridge v1 fallback: try configPath file
        if (api && api.user && typeof api.user.configPath === 'function') {
            const configPath = api.user.configPath();
            if (fs.existsSync(configPath)) {
                const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
                if (config.bridge && config.bridge.setupID) {
                    return config.bridge.setupID;
                }
            }
        }
    } catch (e) {}
    return '';
}

// Helper: derive encryption key from persistPath, plugin name, and setup ID
function getEncryptionKey(persistPath, api) {
    const setupId = getSetupID(api);
    const hash = crypto.createHash('sha256');
    hash.update(settings.PLUGIN_NAME);
    hash.update(persistPath);
    hash.update(setupId);
    const salt = hash.digest();
    const persistPathBuf = Buffer.from(persistPath, 'utf8');
    // PBKDF2: 100,000 iterations, 32 bytes, SHA-512
    return crypto.pbkdf2Sync(persistPathBuf, salt, 100000, 32, 'sha512');
}

// Helper: encrypt Buffer using AES-256-GCM
function encrypt(data, persistPath, api) {
    const key = getEncryptionKey(persistPath, api);
    const iv = crypto.randomBytes(12); // 12 bytes for GCM
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    const ciphertext = Buffer.concat([cipher.update(data), cipher.final()]);
    const authTag = cipher.getAuthTag();
    // Store: IV (12) + AuthTag (16) + Ciphertext
    return Buffer.concat([iv, authTag, ciphertext]);
}

// Helper: decrypt Buffer using AES-256-GCM
function decrypt(encData, persistPath, api) {
    if (!Buffer.isBuffer(encData)) encData = Buffer.from(encData);
    if (encData.length < 12 + 16) throw new Error('Encrypted data too short');
    const key = getEncryptionKey(persistPath, api);
    const iv = encData.slice(0, 12);
    const authTag = encData.slice(12, 28);
    const ciphertext = encData.slice(28);
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
}

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
        if (this.config.rememberEmailAndPassword && password) {
            tokens.password = password;
        }
        try {
            const persistPath = this.api.user.persistPath();
            const data = Buffer.from(JSON.stringify(tokens), 'utf8');
            const encrypted = encrypt(data, persistPath, this.api);
            fs.writeFileSync(this.persistFile, encrypted, { mode: 0o600 });
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
                const persistPath = this.api.user.persistPath();
                const encData = fs.readFileSync(this.persistFile);
                let tokens = {};
                try {
                    const decrypted = decrypt(encData, persistPath, this.api);
                    tokens = JSON.parse(decrypted.toString('utf8'));
                } catch (err) {
                    if (this.api && this.api.logger) {
                        this.api.logger.error('Failed to decrypt Airstage tokens:', err.message);
                    }
                    return { accessToken: null, accessTokenExpiry: null, refreshToken: null, password: null };
                }
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
