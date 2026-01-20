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
            return '/test/path';
        })
    }
};

test('ConfigManager#saveTokens writes file with correct data', () => {
    const api = { user: mockApi.user };
    const configManager = new ConfigManager({}, api);
    let written = null;
    configManager.persistFile = '/tmp/test-airstage-tokens.json';
    const origWriteFileSync = require('node:fs').writeFileSync;
    require('node:fs').writeFileSync = (file, data, opts) => { written = { file, data, opts }; };
    const expiry = new Date('2025-04-27T12:00:00Z');
    configManager.saveTokens('token', expiry, 'refresh');
    assert.strictEqual(written.file, '/tmp/test-airstage-tokens.json');
    const parsed = JSON.parse(written.data);
    assert.strictEqual(parsed.accessToken, 'token');
    assert.strictEqual(parsed.accessTokenExpiry, expiry.toISOString());
    assert.strictEqual(parsed.refreshToken, 'refresh');
    require('node:fs').writeFileSync = origWriteFileSync;
});

test('ConfigManager#saveTokens logs error on write failure', () => {
    let errorLogged = false;
    const api = { user: mockApi.user, logger: { error: () => { errorLogged = true; } } };
    const configManager = new ConfigManager({}, api);
    configManager.persistFile = '/tmp/test-airstage-tokens.json';
    const origWriteFileSync = require('node:fs').writeFileSync;
    require('node:fs').writeFileSync = () => { throw new Error('fail'); };
    configManager.saveTokens('token', new Date(), 'refresh');
    assert.ok(errorLogged);
    require('node:fs').writeFileSync = origWriteFileSync;
});

test('ConfigManager#getTokens reads and parses file', async () => {
    const api = { user: mockApi.user };
    const configManager = new ConfigManager({}, api);
    configManager.persistFile = '/tmp/test-airstage-tokens.json';
    const expiry = new Date('2025-04-27T12:00:00Z');
    const fs = require('node:fs');
    const origExistsSync = fs.existsSync;
    const origReadFileSync = fs.readFileSync;
    fs.existsSync = () => true;
    fs.readFileSync = () => JSON.stringify({
        accessToken: 'token',
        accessTokenExpiry: expiry.toISOString(),
        refreshToken: 'refresh'
    });
    const tokens = await configManager.getTokens();
    assert.strictEqual(tokens.accessToken, 'token');
    assert.strictEqual(tokens.accessTokenExpiry.toISOString(), expiry.toISOString());
    assert.strictEqual(tokens.refreshToken, 'refresh');
    fs.existsSync = origExistsSync;
    fs.readFileSync = origReadFileSync;
});

test('ConfigManager#getTokens returns all nulls if file does not exist', async () => {
    const api = { user: mockApi.user };
    const configManager = new ConfigManager({}, api);
    configManager.persistFile = '/tmp/test-airstage-tokens.json';
    const fs = require('node:fs');
    const origExistsSync = fs.existsSync;
    fs.existsSync = () => false;
    const tokens = await configManager.getTokens();
    assert.strictEqual(tokens.accessToken, null);
    assert.strictEqual(tokens.accessTokenExpiry, null);
    assert.strictEqual(tokens.refreshToken, null);
    fs.existsSync = origExistsSync;
});

test('ConfigManager#getTokens logs error on read failure', async () => {
    let errorLogged = false;
    const api = { user: mockApi.user, logger: { error: () => { errorLogged = true; } } };
    const configManager = new ConfigManager({}, api);
    configManager.persistFile = '/tmp/test-airstage-tokens.json';
    const fs = require('node:fs');
    const origExistsSync = fs.existsSync;
    const origReadFileSync = fs.readFileSync;
    fs.existsSync = () => true;
    fs.readFileSync = () => { throw new Error('fail'); };
    const tokens = await configManager.getTokens();
    assert.strictEqual(tokens.accessToken, null);
    assert.strictEqual(tokens.accessTokenExpiry, null);
    assert.strictEqual(tokens.refreshToken, null);
    assert.ok(errorLogged);
    fs.existsSync = origExistsSync;
    fs.readFileSync = origReadFileSync;
});

test('ConfigManager#getTokens migrates from config if no tokens file', async () => {
    const expiry = new Date('2025-04-27T12:00:00Z');
    const config = {
        accessToken: 'token',
        accessTokenExpiry: expiry.toISOString(),
        refreshToken: 'refresh'
    };
    const api = { user: mockApi.user };
    const configManager = new ConfigManager(config, api);
    configManager.persistFile = '/tmp/test-airstage-tokens.json';
    const fs = require('node:fs');
    const origExistsSync = fs.existsSync;
    fs.existsSync = () => false;
    let saved = null;
    configManager.saveTokens = async (a, b, c) => { saved = [a, b, c]; };
    const tokens = await configManager.getTokens();
    assert.strictEqual(tokens.accessToken, 'token');
    assert.strictEqual(tokens.accessTokenExpiry.toISOString(), expiry.toISOString());
    assert.strictEqual(tokens.refreshToken, 'refresh');
    assert.ok(saved);
    assert.strictEqual(saved[0], 'token');
    assert.strictEqual(saved[1].toISOString(), expiry.toISOString());
    assert.strictEqual(saved[2], 'refresh');
    fs.existsSync = origExistsSync;
});
