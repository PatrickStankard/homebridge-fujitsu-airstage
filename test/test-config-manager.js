'use strict';

const assert = require('node:assert');
const { mock, test } = require('node:test');
const ConfigManager = require('../src/config-manager');

const mockApi = {
    'user': {
        'configPath': mock.fn(() => {
            return '/test/path';
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
