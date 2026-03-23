'use strict';

const assert = require('node:assert');
const { mock, test } = require('node:test');
const MockHomebridge = require('../src/test/mock-homebridge');
const Platform = require('../src/platform');

const mockHomebridge = new MockHomebridge();

test('Platform#constructor initializes local mode when connectionMode is local', async (context) => {
    const platformConfig = {
        'connectionMode': 'local',
        'localDevice': {
            'name': 'Test Device',
            'ipAddress': '192.168.1.100',
            'deviceId': 'A0B1C2D3E4F5',
            'deviceSubId': 0
        },
        'enableThermostat': true
    };

    // Mock LocalConfigValidator
    const LocalConfigValidator = require('../src/utils/local-config-validator');
    const origValidate = LocalConfigValidator.validateDeviceConfig;
    const origNormalize = LocalConfigValidator.normalizeDeviceId;
    const origIsValid = LocalConfigValidator.isValidDeviceIdFormat;
    const origIsValidIpv4 = LocalConfigValidator.isValidIpv4Format;
    const origCheckHttp = LocalConfigValidator.checkHttpConnectivity;

    LocalConfigValidator.normalizeDeviceId = (id) => id.toUpperCase().replace(/:/g, '');
    LocalConfigValidator.isValidDeviceIdFormat = () => true;
    LocalConfigValidator.isValidIpv4Format = () => true;
    LocalConfigValidator.checkHttpConnectivity = async () => ({ success: true, statusCode: 200 });
    LocalConfigValidator.validateDeviceConfig = async () => ({ success: true });

    const platform = new Platform(
        mockHomebridge.platform.log,
        platformConfig,
        mockHomebridge.platform.api,
        false
    );

    // Wait for async initialization
    await new Promise(resolve => setTimeout(resolve, 100));

    assert.strictEqual(platform.connectionMode, 'local');
    assert.ok(platform.airstageClient);
    assert.ok(platform.airstageClient.devices);
    assert.strictEqual(platform.airstageClient.devices.size, 1);
    assert.ok(platform.airstageClient.devices.has('A0B1C2D3E4F5'));

    LocalConfigValidator.validateDeviceConfig = origValidate;
    LocalConfigValidator.normalizeDeviceId = origNormalize;
    LocalConfigValidator.isValidDeviceIdFormat = origIsValid;
    LocalConfigValidator.isValidIpv4Format = origIsValidIpv4;
    LocalConfigValidator.checkHttpConnectivity = origCheckHttp;

    mockHomebridge.resetMocks();
});

test('Platform#constructor initializes local mode with device config', async (context) => {
    const platformConfig = {
        'connectionMode': 'local',
        'localDevice': {
            'name': 'Test Device',
            'ipAddress': '192.168.1.100',
            'deviceId': 'A0B1C2D3E4F5',
            'deviceSubId': 0
        },
        'enableThermostat': true
    };

    // Mock LocalConfigValidator
    const LocalConfigValidator = require('../src/utils/local-config-validator');
    const origValidate = LocalConfigValidator.validateDeviceConfig;
    const origNormalize = LocalConfigValidator.normalizeDeviceId;
    const origIsValid = LocalConfigValidator.isValidDeviceIdFormat;
    const origIsValidIpv4 = LocalConfigValidator.isValidIpv4Format;
    const origCheckHttp = LocalConfigValidator.checkHttpConnectivity;

    LocalConfigValidator.normalizeDeviceId = (id) => id.toUpperCase().replace(/:/g, '');
    LocalConfigValidator.isValidDeviceIdFormat = () => true;
    LocalConfigValidator.isValidIpv4Format = () => true;
    LocalConfigValidator.checkHttpConnectivity = async () => ({ success: true, statusCode: 200 });
    LocalConfigValidator.validateDeviceConfig = async () => ({ success: true });

    const platform = new Platform(
        mockHomebridge.platform.log,
        platformConfig,
        mockHomebridge.platform.api,
        false
    );

    // Wait for async initialization
    await new Promise(resolve => setTimeout(resolve, 100));

    assert.strictEqual(platform.connectionMode, 'local');
    assert.ok(platform.airstageClient);
    assert.ok(platform.airstageClient.devices);
    assert.strictEqual(platform.airstageClient.devices.size, 1);
    assert.ok(platform.airstageClient.devices.has('A0B1C2D3E4F5'));

    LocalConfigValidator.validateDeviceConfig = origValidate;
    LocalConfigValidator.normalizeDeviceId = origNormalize;
    LocalConfigValidator.isValidDeviceIdFormat = origIsValid;
    LocalConfigValidator.isValidIpv4Format = origIsValidIpv4;
    LocalConfigValidator.checkHttpConnectivity = origCheckHttp;

    mockHomebridge.resetMocks();
});

test('Platform#constructor defaults to cloud mode when connectionMode not specified', (context) => {
    const platformConfig = {
        'region': 'us',
        'country': 'United States',
        'language': 'en',
        'email': 'test@example.com',
        'password': 'test1234'
    };

    const platform = new Platform(
        mockHomebridge.platform.log,
        platformConfig,
        mockHomebridge.platform.api,
        false
    );

    assert.strictEqual(platform.connectionMode, 'cloud');
    assert.ok(platform.airstageClient);
    assert.strictEqual(platform.airstageClient.email, 'test@example.com');

    mockHomebridge.resetMocks();
});

test('Platform#constructor initializes cloud mode when connectionMode is cloud', (context) => {
    const platformConfig = {
        'connectionMode': 'cloud',
        'region': 'us',
        'country': 'United States',
        'language': 'en',
        'email': 'test@example.com',
        'password': 'test1234'
    };

    const platform = new Platform(
        mockHomebridge.platform.log,
        platformConfig,
        mockHomebridge.platform.api,
        false
    );

    assert.strictEqual(platform.connectionMode, 'cloud');
    assert.ok(platform.airstageClient);
    assert.strictEqual(platform.airstageClient.email, 'test@example.com');

    mockHomebridge.resetMocks();
});

test('Platform#_initLocalMode auto-detects device ID when not provided', async (context) => {
    const platformConfig = {
        'connectionMode': 'local',
        'localDevice': {
            'name': 'Test Device',
            'ipAddress': '192.168.1.100',
            'deviceSubId': 0
        }
    };

    // Mock LocalConfigValidator
    const LocalConfigValidator = require('../src/utils/local-config-validator');
    const origDetect = LocalConfigValidator.detectDeviceId;
    const origValidate = LocalConfigValidator.validateDeviceConfig;
    const origIsValidIpv4 = LocalConfigValidator.isValidIpv4Format;
    const origCheckHttp = LocalConfigValidator.checkHttpConnectivity;

    LocalConfigValidator.detectDeviceId = async () => ({ success: true, deviceId: 'A0B1C2D3E4F5' });
    LocalConfigValidator.validateDeviceConfig = async () => ({ success: true });
    LocalConfigValidator.isValidIpv4Format = () => true;
    LocalConfigValidator.checkHttpConnectivity = async () => ({ success: true, statusCode: 200 });

    const platform = new Platform(
        mockHomebridge.platform.log,
        platformConfig,
        mockHomebridge.platform.api,
        false
    );

    // Wait for async initialization
    await new Promise(resolve => setTimeout(resolve, 100));

    assert.strictEqual(platform.connectionMode, 'local');
    assert.ok(platform.airstageClient);
    assert.ok(platform.airstageClient.devices.has('A0B1C2D3E4F5'));

    LocalConfigValidator.detectDeviceId = origDetect;
    LocalConfigValidator.validateDeviceConfig = origValidate;
    LocalConfigValidator.isValidIpv4Format = origIsValidIpv4;
    LocalConfigValidator.checkHttpConnectivity = origCheckHttp;

    mockHomebridge.resetMocks();
});

test('Platform#_initLocalMode fails when device missing IP address', async (context) => {
    const platformConfig = {
        'connectionMode': 'local',
        'localDevice': {
            'name': 'Test Device',
            'deviceId': 'A0B1C2D3E4F5'
            // Missing ipAddress
        }
    };

    // Mock LocalConfigValidator to prevent any rejections
    const LocalConfigValidator = require('../src/utils/local-config-validator');
    const origValidate = LocalConfigValidator.validateDeviceConfig;

    LocalConfigValidator.validateDeviceConfig = async () => ({ success: true });

    const platform = new Platform(
        mockHomebridge.platform.log,
        platformConfig,
        mockHomebridge.platform.api,
        false
    );

    // Wait for async initialization
    await new Promise(resolve => setTimeout(resolve, 150));

    assert.strictEqual(platform.connectionMode, 'local');
    // Should not have initialized client due to missing IP address
    assert.ok(!platform.airstageClient);

    LocalConfigValidator.validateDeviceConfig = origValidate;

    mockHomebridge.resetMocks();
});

test('Platform#_initLocalMode fails when device validation fails', async (context) => {
    const platformConfig = {
        'connectionMode': 'local',
        'localDevice': {
            'name': 'Test Device',
            'ipAddress': '192.168.1.100',
            'deviceId': 'A0B1C2D3E4F5',
            'deviceSubId': 0
        }
    };

    // Mock LocalConfigValidator
    const LocalConfigValidator = require('../src/utils/local-config-validator');
    const origValidate = LocalConfigValidator.validateDeviceConfig;
    const origNormalize = LocalConfigValidator.normalizeDeviceId;
    const origIsValid = LocalConfigValidator.isValidDeviceIdFormat;
    const origIsValidIpv4 = LocalConfigValidator.isValidIpv4Format;
    const origCheckHttp = LocalConfigValidator.checkHttpConnectivity;

    LocalConfigValidator.normalizeDeviceId = (id) => id.toUpperCase();
    LocalConfigValidator.isValidDeviceIdFormat = () => true;
    LocalConfigValidator.isValidIpv4Format = () => true;
    LocalConfigValidator.checkHttpConnectivity = async () => ({ success: true, statusCode: 200 });
    LocalConfigValidator.validateDeviceConfig = async () => ({
        success: false,
        error: 'Device offline'
    });

    const platform = new Platform(
        mockHomebridge.platform.log,
        platformConfig,
        mockHomebridge.platform.api,
        false
    );

    // Wait for async initialization
    await new Promise(resolve => setTimeout(resolve, 100));

    assert.strictEqual(platform.connectionMode, 'local');
    // Should not have initialized client due to validation failure
    assert.ok(!platform.airstageClient);

    LocalConfigValidator.validateDeviceConfig = origValidate;
    LocalConfigValidator.normalizeDeviceId = origNormalize;
    LocalConfigValidator.isValidDeviceIdFormat = origIsValid;
    LocalConfigValidator.isValidIpv4Format = origIsValidIpv4;
    LocalConfigValidator.checkHttpConnectivity = origCheckHttp;

    mockHomebridge.resetMocks();
});

test('Platform#discoverDevices calls _discoverLocalDevices in local mode', async (context) => {
    const platformConfig = {
        'connectionMode': 'local',
        'localDevice': {
            'name': 'Test Device',
            'ipAddress': '192.168.1.100',
            'deviceId': 'A0B1C2D3E4F5',
            'deviceSubId': 0
        }
    };

    // Mock LocalConfigValidator
    const LocalConfigValidator = require('../src/utils/local-config-validator');
    const origValidate = LocalConfigValidator.validateDeviceConfig;
    const origNormalize = LocalConfigValidator.normalizeDeviceId;
    const origIsValid = LocalConfigValidator.isValidDeviceIdFormat;
    const origIsValidIpv4 = LocalConfigValidator.isValidIpv4Format;
    const origCheckHttp = LocalConfigValidator.checkHttpConnectivity;

    LocalConfigValidator.normalizeDeviceId = (id) => id.toUpperCase().replace(/:/g, '');
    LocalConfigValidator.isValidDeviceIdFormat = () => true;
    LocalConfigValidator.isValidIpv4Format = () => true;
    LocalConfigValidator.checkHttpConnectivity = async () => ({ success: true, statusCode: 200 });
    LocalConfigValidator.validateDeviceConfig = async () => ({ success: true });

    const platform = new Platform(
        mockHomebridge.platform.log,
        platformConfig,
        mockHomebridge.platform.api,
        false
    );

    // Wait for async initialization
    await new Promise(resolve => setTimeout(resolve, 100));

    // Use promise-based test instead of callback
    await new Promise((resolve, reject) => {
        platform.discoverDevices((error) => {
            try {
                assert.strictEqual(error, null);
                assert.strictEqual(platform.connectionMode, 'local');
                resolve();
            } catch (err) {
                reject(err);
            }
        });
    });

    LocalConfigValidator.validateDeviceConfig = origValidate;
    LocalConfigValidator.normalizeDeviceId = origNormalize;
    LocalConfigValidator.isValidDeviceIdFormat = origIsValid;
    LocalConfigValidator.isValidIpv4Format = origIsValidIpv4;
    LocalConfigValidator.checkHttpConnectivity = origCheckHttp;
    LocalConfigValidator.checkHttpConnectivity = origCheckHttp;

    mockHomebridge.resetMocks();
});

test('Platform#discoverDevices calls _discoverCloudDevices in cloud mode', (context, done) => {
    const platformConfig = {
        'connectionMode': 'cloud',
        'region': 'us',
        'country': 'United States',
        'language': 'en',
        'email': 'test@example.com',
        'password': 'test1234'
    };

    const platform = new Platform(
        mockHomebridge.platform.log,
        platformConfig,
        mockHomebridge.platform.api,
        false
    );

    context.mock.method(
        platform.airstageClient,
        'refreshTokenOrAuthenticate',
        (callback) => {
            callback('refreshTokenOrAuthenticate error');
        }
    );

    platform.discoverDevices((error) => {
        assert.strictEqual(error, 'refreshTokenOrAuthenticate error');
        assert.strictEqual(platform.connectionMode, 'cloud');

        mockHomebridge.resetMocks();
        done();
    });
});

test('Platform#_initLocalMode normalizes device IDs to uppercase', async (context) => {
    const platformConfig = {
        'connectionMode': 'local',
        'localDevice': {
            'name': 'Test Device',
            'ipAddress': '192.168.1.100',
            'deviceId': 'a0:b1:c2:d3:e4:f5',  // lowercase with colons
            'deviceSubId': 0
        }
    };

    // Mock LocalConfigValidator
    const LocalConfigValidator = require('../src/utils/local-config-validator');
    const origValidate = LocalConfigValidator.validateDeviceConfig;
    const origNormalize = LocalConfigValidator.normalizeDeviceId;
    const origIsValid = LocalConfigValidator.isValidDeviceIdFormat;
    const origIsValidIpv4 = LocalConfigValidator.isValidIpv4Format;
    const origCheckHttp = LocalConfigValidator.checkHttpConnectivity;

    LocalConfigValidator.normalizeDeviceId = (id) => id.toUpperCase().replace(/:/g, '');
    LocalConfigValidator.isValidDeviceIdFormat = () => true;
    LocalConfigValidator.isValidIpv4Format = () => true;
    LocalConfigValidator.checkHttpConnectivity = async () => ({ success: true, statusCode: 200 });
    LocalConfigValidator.validateDeviceConfig = async (ip, id) => {
        // Should receive uppercase ID without colons
        assert.strictEqual(id, 'A0B1C2D3E4F5');
        return { success: true };
    };

    const platform = new Platform(
        mockHomebridge.platform.log,
        platformConfig,
        mockHomebridge.platform.api,
        false
    );

    // Wait for async initialization
    await new Promise(resolve => setTimeout(resolve, 100));

    assert.strictEqual(platform.connectionMode, 'local');
    assert.ok(platform.airstageClient);
    // Verify device is stored with uppercase ID
    assert.ok(platform.airstageClient.devices.has('A0B1C2D3E4F5'));
    assert.ok(!platform.airstageClient.devices.has('a0b1c2d3e4f5'));

    LocalConfigValidator.validateDeviceConfig = origValidate;
    LocalConfigValidator.normalizeDeviceId = origNormalize;
    LocalConfigValidator.isValidDeviceIdFormat = origIsValid;
    LocalConfigValidator.isValidIpv4Format = origIsValidIpv4;
    LocalConfigValidator.checkHttpConnectivity = origCheckHttp;

    mockHomebridge.resetMocks();
});
