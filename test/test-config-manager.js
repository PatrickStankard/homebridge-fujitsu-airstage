'use strict';

const assert = require('node:assert');
const { mock, test } = require('node:test');
const ConfigManager = require('../src/config-manager');

const mockApi = {
    'user': {
        'configPath': mock.fn(() => {
            return '/test/path';
        }),
        'persistPath': mock.fn(() => {
            // Use a temp directory for persistPath in tests
            return '/tmp';
        })
    }
};

test('ConfigManager#updateConfigWithAccessToken updates the config with new access token, and does not persist Airstage email and password', (context) => {
    let platformConfig = {
        'email': 'test@example.com',
        'password': 'test1234',
        'rememberEmailAndPassword': false,
        'accessToken': null,
        'accessTokenExpiry': null,
        'refreshToken': null
    };
    let homebridgeConfig = {
        'platforms': [
            platformConfig
        ]
    };
    const accessToken = 'testAccessToken';
    const accessTokenExpiry = new Date();
    const refreshToken = 'testRefreshToken';
    const configManager = new ConfigManager(platformConfig, mockApi);
    context.mock.method(
        configManager,
        '_readFileSync',
        (path) => {
            return JSON.stringify(homebridgeConfig, null, 4);
        }
    );
    context.mock.method(
        configManager,
        '_writeFileSync',
        (path, jsonString) => {}
    );

    const result = configManager.updateConfigWithAccessToken(
        accessToken,
        accessTokenExpiry,
        refreshToken
    );

    const expectedHomebridgeConfig = JSON.stringify(homebridgeConfig, null, 4);
    assert.strictEqual(result, true);
    assert.strictEqual(platformConfig.email, null);
    assert.strictEqual(platformConfig.password, null);
    assert.strictEqual(platformConfig.accessToken, accessToken);
    assert.strictEqual(platformConfig.accessTokenExpiry, accessTokenExpiry.toISOString());
    assert.strictEqual(platformConfig.refreshToken, refreshToken);
    assert.strictEqual(configManager._readFileSync.mock.calls.length, 1);
    assert.strictEqual(configManager._readFileSync.mock.calls[0].arguments[0], '/test/path');
    assert.strictEqual(configManager._writeFileSync.mock.calls.length, 1);
    assert.strictEqual(configManager._writeFileSync.mock.calls[0].arguments[0], '/test/path');
    assert.strictEqual(configManager._writeFileSync.mock.calls[0].arguments[1], expectedHomebridgeConfig);
});

test('ConfigManager#updateConfigWithAccessToken updates the config with new access token, and persists Airstage email and password', (context) => {
    let platformConfig = {
        'email': 'test@example.com',
        'password': 'test1234',
        'rememberEmailAndPassword': true,
        'accessToken': null,
        'accessTokenExpiry': null,
        'refreshToken': null
    };
    let homebridgeConfig = {
        'platforms': [
            platformConfig
        ]
    };
    const accessToken = 'testAccessToken';
    const accessTokenExpiry = new Date();
    const refreshToken = 'testRefreshToken';
    const configManager = new ConfigManager(platformConfig, mockApi);
    context.mock.method(
        configManager,
        '_readFileSync',
        (path) => {
            return JSON.stringify(homebridgeConfig, null, 4);
        }
    );
    context.mock.method(
        configManager,
        '_writeFileSync',
        (path, jsonString) => {}
    );

    const result = configManager.updateConfigWithAccessToken(
        accessToken,
        accessTokenExpiry,
        refreshToken
    );

    const expectedHomebridgeConfig = JSON.stringify(homebridgeConfig, null, 4);
    assert.strictEqual(result, true);
    assert.strictEqual(platformConfig.email, 'test@example.com');
    assert.strictEqual(platformConfig.password, 'test1234');
    assert.strictEqual(platformConfig.accessToken, accessToken);
    assert.strictEqual(platformConfig.accessTokenExpiry, accessTokenExpiry.toISOString());
    assert.strictEqual(platformConfig.refreshToken, refreshToken);
    assert.strictEqual(configManager._readFileSync.mock.calls.length, 1);
    assert.strictEqual(configManager._readFileSync.mock.calls[0].arguments[0], '/test/path');
    assert.strictEqual(configManager._writeFileSync.mock.calls.length, 1);
    assert.strictEqual(configManager._writeFileSync.mock.calls[0].arguments[0], '/test/path');
    assert.strictEqual(configManager._writeFileSync.mock.calls[0].arguments[1], expectedHomebridgeConfig);
});

test('ConfigManager#updateConfigWithAccessToken does not update the config with existing access token', (context) => {
    let platformConfig = {
        'email': null,
        'password': null,
        'rememberEmailAndPassword': false,
        'accessToken': 'testAccessToken',
        'accessTokenExpiry': '2024-06-12T17:29:20.553Z',
        'refreshToken': 'testRefreshToken'
    };
    let homebridgeConfig = {
        'platforms': [
            platformConfig
        ]
    };
    const accessToken = 'testAccessToken';
    const accessTokenExpiry = new Date('2024-06-12T17:29:20.553Z');
    const refreshToken = 'testRefreshToken';
    const configManager = new ConfigManager(platformConfig, mockApi);
    context.mock.method(
        configManager,
        '_readFileSync',
        (path) => {
            return JSON.stringify(homebridgeConfig, null, 4);
        }
    );
    context.mock.method(
        configManager,
        '_writeFileSync',
        (path, jsonString) => {}
    );

    const result = configManager.updateConfigWithAccessToken(
        accessToken,
        accessTokenExpiry,
        refreshToken
    );

    assert.strictEqual(result, false);
    assert.strictEqual(platformConfig.email, null);
    assert.strictEqual(platformConfig.password, null);
    assert.strictEqual(platformConfig.accessToken, accessToken);
    assert.strictEqual(platformConfig.accessTokenExpiry, accessTokenExpiry.toISOString());
    assert.strictEqual(platformConfig.refreshToken, refreshToken);
    assert.strictEqual(configManager._readFileSync.mock.calls.length, 1);
    assert.strictEqual(configManager._readFileSync.mock.calls[0].arguments[0], '/test/path');
    assert.strictEqual(configManager._writeFileSync.mock.calls.length, 0);
});

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const settings = require('../src/settings');

// Directly import helpers for coverage
const _ConfigManager = require('../src/config-manager');
const _src = require('../src/config-manager.js');
const { 
    getSetupID, getEncryptionKey, encrypt, decrypt 
} = (function() {
    // Extract helpers from the file
    const m = require('../src/config-manager');
    return {
        getSetupID: m.__getSetupID || require('../src/config-manager').getSetupID || (function() { try { return eval('getSetupID'); } catch { return undefined; } })(),
        getEncryptionKey: m.__getEncryptionKey || require('../src/config-manager').getEncryptionKey || (function() { try { return eval('getEncryptionKey'); } catch { return undefined; } })(),
        encrypt: m.__encrypt || require('../src/config-manager').encrypt || (function() { try { return eval('encrypt'); } catch { return undefined; } })(),
        decrypt: m.__decrypt || require('../src/config-manager').decrypt || (function() { try { return eval('decrypt'); } catch { return undefined; } })(),
    };
})();

// Helper to mock fs
function withTempFile(content, cb) {
    const tmpFile = path.join('/tmp', 'airstage-tokens-test-' + Date.now() + Math.random());
    fs.writeFileSync(tmpFile, content);
    try {
        return cb(tmpFile);
    } finally {
        fs.unlinkSync(tmpFile);
    }
}

test('getSetupID returns empty string if api is missing', () => {
    assert.strictEqual(getSetupID(undefined), '');
    assert.strictEqual(getSetupID({}), '');
});

test('getSetupID returns setupId from api.user.getSetupId', () => {
    const api = { user: { getSetupId: () => 'ABC123' } };
    assert.strictEqual(getSetupID(api), 'ABC123');
});

test('getSetupID returns setupID from config file (Homebridge v1 fallback)', () => {
    const configObj = { bridge: { setupID: 'XYZ789' } };
    withTempFile(JSON.stringify(configObj), (tmpFile) => {
        const api = { user: { getSetupId: undefined, configPath: () => tmpFile } };
        assert.strictEqual(getSetupID(api), 'XYZ789');
    });
});

test('getSetupID returns empty string if config file missing or invalid', () => {
    const api = { user: { getSetupId: undefined, configPath: () => '/tmp/does-not-exist' } };
    assert.strictEqual(getSetupID(api), '');
});

test('getEncryptionKey returns a Buffer of length 32', () => {
    const api = { user: { getSetupId: () => 'SETUPID' } };
    const key = getEncryptionKey('/tmp', api);
    assert(Buffer.isBuffer(key));
    assert.strictEqual(key.length, 32);
});

test('encrypt and decrypt roundtrip returns original data', () => {
    const api = { user: { getSetupId: () => 'SETUPID' } };
    const data = Buffer.from('secret-data', 'utf8');
    const encrypted = encrypt(data, '/tmp', api);
    const decrypted = decrypt(encrypted, '/tmp', api);
    assert.strictEqual(decrypted.toString('utf8'), 'secret-data');
});

test('decrypt throws on invalid data', () => {
    const api = { user: { getSetupId: () => 'SETUPID' } };
    assert.throws(() => decrypt(Buffer.from('short'), '/tmp', api), /Encrypted data too short/);
});

test('ConfigManager#saveTokensToPersistPath and getTokensFromPersistPath roundtrip', () => {
    const api = {
        user: {
            persistPath: () => '/tmp',
        },
        logger: { error: mock.fn() }
    };
    const config = { rememberEmailAndPassword: true };
    const mgr = new _ConfigManager(config, api);
    const accessToken = 'tok';
    const accessTokenExpiry = new Date();
    const refreshToken = 'ref';
    const password = 'pw';
    mgr.saveTokensToPersistPath(accessToken, accessTokenExpiry, refreshToken, password);
    const tokens = mgr.getTokensFromPersistPath();
    assert.strictEqual(tokens.accessToken, accessToken);
    assert.strictEqual(tokens.refreshToken, refreshToken);
    assert.strictEqual(tokens.password, password);
    assert(tokens.accessTokenExpiry instanceof Date);
    // Clean up
    fs.unlinkSync(mgr.persistFile);
});

test('ConfigManager#getTokensFromPersistPath handles decrypt error', () => {
    const api = {
        user: { persistPath: () => '/tmp' },
        logger: { error: mock.fn() }
    };
    const config = {};
    const mgr = new _ConfigManager(config, api);
    fs.writeFileSync(mgr.persistFile, Buffer.from('invaliddata'));
    const tokens = mgr.getTokensFromPersistPath();
    assert.deepStrictEqual(tokens, { accessToken: null, accessTokenExpiry: null, refreshToken: null, password: null });
    fs.unlinkSync(mgr.persistFile);
});

test('ConfigManager#getTokensFromPersistPath returns nulls if file does not exist', () => {
    const api = { user: { persistPath: () => '/tmp' } };
    const config = {};
    const mgr = new _ConfigManager(config, api);
    if (fs.existsSync(mgr.persistFile)) fs.unlinkSync(mgr.persistFile);
    const tokens = mgr.getTokensFromPersistPath();
    assert.deepStrictEqual(tokens, { accessToken: null, accessTokenExpiry: null, refreshToken: null, password: null });
});

test('ConfigManager#saveTokens calls saveTokensToPersistPath', async () => {
    const api = { user: { persistPath: () => '/tmp' } };
    const config = {};
    const mgr = new _ConfigManager(config, api);
    let called = false;
    mgr.saveTokensToPersistPath = () => { called = true; };
    await mgr.saveTokens('a', new Date(), 'b', 'pw');
    assert(called);
});

test('ConfigManager#getTokens migrates from config if persistPath empty', async () => {
    const api = { user: { persistPath: () => '/tmp' } };
    const config = { accessToken: 'a', accessTokenExpiry: new Date().toISOString(), refreshToken: 'b', rememberEmailAndPassword: true, password: 'pw' };
    const mgr = new _ConfigManager(config, api);
    if (fs.existsSync(mgr.persistFile)) fs.unlinkSync(mgr.persistFile);
    const tokens = await mgr.getTokens();
    assert.strictEqual(tokens.accessToken, 'a');
    assert.strictEqual(tokens.refreshToken, 'b');
    assert.strictEqual(tokens.password, 'pw');
    assert(tokens.accessTokenExpiry instanceof Date);
    fs.unlinkSync(mgr.persistFile);
});

test('ConfigManager#getTokens returns nulls if nothing present', async () => {
    const api = { user: { persistPath: () => '/tmp' } };
    const config = {};
    const mgr = new _ConfigManager(config, api);
    if (fs.existsSync(mgr.persistFile)) fs.unlinkSync(mgr.persistFile);
    const tokens = await mgr.getTokens();
    assert.deepStrictEqual(tokens, { accessToken: null, accessTokenExpiry: null, refreshToken: null, password: null });
});

test('ConfigManager#saveTokensToPersistPath handles fs.writeFileSync error', () => {
    let errorLogged = false;
    const api = {
        user: { persistPath: () => '/tmp' },
        logger: { error: () => { errorLogged = true; } }
    };
    const config = { rememberEmailAndPassword: true };
    const mgr = new _ConfigManager(config, api);
    const origWrite = fs.writeFileSync;
    fs.writeFileSync = () => { throw new Error('fail write'); };
    mgr.saveTokensToPersistPath('a', new Date(), 'b', 'pw');
    fs.writeFileSync = origWrite;
    assert.strictEqual(errorLogged, true);
});

test('ConfigManager#getTokensFromPersistPath handles fs.readFileSync error', () => {
    let errorLogged = false;
    const api = {
        user: { persistPath: () => '/tmp' },
        logger: { error: () => { errorLogged = true; } }
    };
    const config = {};
    const mgr = new _ConfigManager(config, api);
    const origRead = fs.readFileSync;
    fs.readFileSync = () => { throw new Error('fail read'); };
    // Create file so existsSync is true
    fs.writeFileSync(mgr.persistFile, Buffer.from('data'));
    const tokens = mgr.getTokensFromPersistPath();
    fs.readFileSync = origRead;
    fs.unlinkSync(mgr.persistFile);
    assert.strictEqual(errorLogged, true);
    assert.deepStrictEqual(tokens, { accessToken: null, accessTokenExpiry: null, refreshToken: null, password: null });
});

test('ConfigManager#saveTokensToPersistPath omits password if rememberEmailAndPassword is false', () => {
    const api = { user: { persistPath: () => '/tmp' }, logger: { error: mock.fn() } };
    const config = { rememberEmailAndPassword: false };
    const mgr = new _ConfigManager(config, api);
    mgr.saveTokensToPersistPath('a', new Date(), 'b', 'pw');
    const tokens = mgr.getTokensFromPersistPath();
    assert.strictEqual(tokens.password, null);
    fs.unlinkSync(mgr.persistFile);
});

test('ConfigManager#saveTokensToPersistPath omits password if not provided', () => {
    const api = { user: { persistPath: () => '/tmp' }, logger: { error: mock.fn() } };
    const config = { rememberEmailAndPassword: true };
    const mgr = new _ConfigManager(config, api);
    mgr.saveTokensToPersistPath('a', new Date(), 'b');
    const tokens = mgr.getTokensFromPersistPath();
    assert.strictEqual(tokens.password, null);
    fs.unlinkSync(mgr.persistFile);
});

test('ConfigManager#getTokens migrates from config if only refreshToken present', async () => {
    const api = { user: { persistPath: () => '/tmp' } };
    const config = { refreshToken: 'b' };
    const mgr = new _ConfigManager(config, api);
    if (fs.existsSync(mgr.persistFile)) fs.unlinkSync(mgr.persistFile);
    const tokens = await mgr.getTokens();
    assert.strictEqual(tokens.refreshToken, 'b');
    fs.unlinkSync(mgr.persistFile);
});

test('ConfigManager#getTokens migrates from config if only accessToken present', async () => {
    const api = { user: { persistPath: () => '/tmp' } };
    const config = { accessToken: 'a' };
    const mgr = new _ConfigManager(config, api);
    if (fs.existsSync(mgr.persistFile)) fs.unlinkSync(mgr.persistFile);
    const tokens = await mgr.getTokens();
    assert.strictEqual(tokens.accessToken, 'a');
    fs.unlinkSync(mgr.persistFile);
});
