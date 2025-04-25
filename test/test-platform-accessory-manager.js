'use strict';

const assert = require('node:assert');
const { mock, test } = require('node:test');
const hap = require('hap-nodejs');
const MockHomebridge = require('../src/test/mock-homebridge');
const PlatformAccessoryManager = require('../src/platform-accessory-manager');
const airstage = require('../src/airstage');
const settings = require('../src/settings');

const mockHomebridge = new MockHomebridge();
const platformAccessoryManager = new PlatformAccessoryManager(
    mockHomebridge.platform
);

const deviceId = '1234';
const deviceName = 'Test Device';
const deviceModel = 'Test Model';

test('PlatformAccessoryManager#registerThermostatAccessory registers existing accessory', (context) => {
    const existingUuid = hap.uuid.generate(
        deviceId + '-thermostat'
    );
    const existingPlatformAccessory = new mockHomebridge.platform.api.platformAccessory(
        'Test Device Thermostat',
        existingUuid
    );
    mockHomebridge.platform.accessories = [existingPlatformAccessory];

    platformAccessoryManager.registerThermostatAccessory(deviceId, deviceName, deviceModel);

    const mockedMethod = mockHomebridge.platform.api.updatePlatformAccessories.mock;
    assert.strictEqual(mockedMethod.calls.length, 1);
    const mockPlatformAccessory = mockedMethod.calls[0].arguments[0][0];
    assert.strictEqual(mockPlatformAccessory, existingPlatformAccessory);
    assert.strictEqual(mockPlatformAccessory.name, 'Test Device Thermostat');
    assert.strictEqual(mockPlatformAccessory.context.airstageClient, mockHomebridge.platform.airstageClient);
    assert.strictEqual(mockPlatformAccessory.context.deviceId, deviceId);
    assert.strictEqual(mockPlatformAccessory.context.model, deviceModel);
    assert.strictEqual(mockHomebridge.platform.accessories.length, 1);
    assert.strictEqual(mockHomebridge.platform.accessories[0], mockPlatformAccessory);

    mockHomebridge.resetMocks();
});

test('PlatformAccessoryManager#registerThermostatAccessory registers new accessory', (context) => {
    platformAccessoryManager.registerThermostatAccessory(deviceId, deviceName, deviceModel);

    const mockedMethod = mockHomebridge.platform.api.registerPlatformAccessories.mock;
    assert.strictEqual(mockedMethod.calls.length, 1);
    assert.strictEqual(mockedMethod.calls[0].arguments[0], settings.PLUGIN_NAME);
    assert.strictEqual(mockedMethod.calls[0].arguments[1], settings.PLATFORM_NAME);
    const mockPlatformAccessory = mockedMethod.calls[0].arguments[2][0];
    assert.strictEqual(mockPlatformAccessory.name, 'Test Device Thermostat');
    assert.strictEqual(mockPlatformAccessory.context.airstageClient, mockHomebridge.platform.airstageClient);
    assert.strictEqual(mockPlatformAccessory.context.deviceId, deviceId);
    assert.strictEqual(mockPlatformAccessory.context.model, deviceModel);
    assert.strictEqual(mockHomebridge.platform.accessories.length, 1);
    assert.strictEqual(mockHomebridge.platform.accessories[0], mockPlatformAccessory);

    mockHomebridge.resetMocks();
});

test('PlatformAccessoryManager#registerFanAccessory registers existing accessory', (context) => {
    const existingUuid = hap.uuid.generate(
        deviceId + '-fan'
    );
    const existingPlatformAccessory = new mockHomebridge.platform.api.platformAccessory(
        'Test Device Fan',
        existingUuid
    );
    mockHomebridge.platform.accessories = [existingPlatformAccessory];

    platformAccessoryManager.registerFanAccessory(deviceId, deviceName, deviceModel);

    const mockedMethod = mockHomebridge.platform.api.updatePlatformAccessories.mock;
    assert.strictEqual(mockedMethod.calls.length, 1);
    const mockPlatformAccessory = mockedMethod.calls[0].arguments[0][0];
    assert.strictEqual(mockPlatformAccessory, existingPlatformAccessory);
    assert.strictEqual(mockPlatformAccessory.name, 'Test Device Fan');
    assert.strictEqual(mockPlatformAccessory.context.airstageClient, mockHomebridge.platform.airstageClient);
    assert.strictEqual(mockPlatformAccessory.context.deviceId, deviceId);
    assert.strictEqual(mockPlatformAccessory.context.model, deviceModel);
    assert.strictEqual(mockHomebridge.platform.accessories.length, 1);
    assert.strictEqual(mockHomebridge.platform.accessories[0], mockPlatformAccessory);

    mockHomebridge.resetMocks();
});

test('PlatformAccessoryManager#registerFanAccessory registers new accessory', (context) => {
    platformAccessoryManager.registerFanAccessory(deviceId, deviceName, deviceModel);

    const mockedMethod = mockHomebridge.platform.api.registerPlatformAccessories.mock;
    assert.strictEqual(mockedMethod.calls.length, 1);
    assert.strictEqual(mockedMethod.calls[0].arguments[0], settings.PLUGIN_NAME);
    assert.strictEqual(mockedMethod.calls[0].arguments[1], settings.PLATFORM_NAME);
    const mockPlatformAccessory = mockedMethod.calls[0].arguments[2][0];
    assert.strictEqual(mockPlatformAccessory.name, 'Test Device Fan');
    assert.strictEqual(mockPlatformAccessory.context.airstageClient, mockHomebridge.platform.airstageClient);
    assert.strictEqual(mockPlatformAccessory.context.deviceId, deviceId);
    assert.strictEqual(mockPlatformAccessory.context.model, deviceModel);
    assert.strictEqual(mockHomebridge.platform.accessories.length, 1);
    assert.strictEqual(mockHomebridge.platform.accessories[0], mockPlatformAccessory);

    mockHomebridge.resetMocks();
});

test('PlatformAccessoryManager#registerVerticalAirflowDirectionAccessory registers existing accessory', (context) => {
    const existingUuid = hap.uuid.generate(
        deviceId + '-vertical-airflow-direction'
    );
    const existingPlatformAccessory = new mockHomebridge.platform.api.platformAccessory(
        'Test Device Vertical Airflow Direction',
        existingUuid
    );
    mockHomebridge.platform.accessories = [existingPlatformAccessory];

    platformAccessoryManager.registerVerticalAirflowDirectionAccessory(deviceId, deviceName, deviceModel);

    const mockedMethod = mockHomebridge.platform.api.updatePlatformAccessories.mock;
    assert.strictEqual(mockedMethod.calls.length, 1);
    const mockPlatformAccessory = mockedMethod.calls[0].arguments[0][0];
    assert.strictEqual(mockPlatformAccessory, existingPlatformAccessory);
    assert.strictEqual(mockPlatformAccessory.name, 'Test Device Vertical Airflow Direction');
    assert.strictEqual(mockPlatformAccessory.context.airstageClient, mockHomebridge.platform.airstageClient);
    assert.strictEqual(mockPlatformAccessory.context.deviceId, deviceId);
    assert.strictEqual(mockPlatformAccessory.context.model, deviceModel);
    assert.strictEqual(mockHomebridge.platform.accessories.length, 1);
    assert.strictEqual(mockHomebridge.platform.accessories[0], mockPlatformAccessory);

    mockHomebridge.resetMocks();
});

test('PlatformAccessoryManager#registerVerticalAirflowDirectionAccessory registers new accessory', (context) => {
    platformAccessoryManager.registerVerticalAirflowDirectionAccessory(deviceId, deviceName, deviceModel);

    const mockedMethod = mockHomebridge.platform.api.registerPlatformAccessories.mock;
    assert.strictEqual(mockedMethod.calls.length, 1);
    assert.strictEqual(mockedMethod.calls[0].arguments[0], settings.PLUGIN_NAME);
    assert.strictEqual(mockedMethod.calls[0].arguments[1], settings.PLATFORM_NAME);
    const mockPlatformAccessory = mockedMethod.calls[0].arguments[2][0];
    assert.strictEqual(mockPlatformAccessory.name, 'Test Device Vertical Airflow Direction');
    assert.strictEqual(mockPlatformAccessory.context.airstageClient, mockHomebridge.platform.airstageClient);
    assert.strictEqual(mockPlatformAccessory.context.deviceId, deviceId);
    assert.strictEqual(mockPlatformAccessory.context.model, deviceModel);
    assert.strictEqual(mockHomebridge.platform.accessories.length, 1);
    assert.strictEqual(mockHomebridge.platform.accessories[0], mockPlatformAccessory);

    mockHomebridge.resetMocks();
});

test('PlatformAccessoryManager#registerDryModeSwitchAccessory registers existing accessory', (context) => {
    const existingUuid = hap.uuid.generate(
        deviceId + '-dry-mode-switch'
    );
    const existingPlatformAccessory = new mockHomebridge.platform.api.platformAccessory(
        'Test Device Dry Mode Switch',
        existingUuid
    );
    mockHomebridge.platform.accessories = [existingPlatformAccessory];

    platformAccessoryManager.registerDryModeSwitchAccessory(deviceId, deviceName, deviceModel);

    const mockedMethod = mockHomebridge.platform.api.updatePlatformAccessories.mock;
    assert.strictEqual(mockedMethod.calls.length, 1);
    const mockPlatformAccessory = mockedMethod.calls[0].arguments[0][0];
    assert.strictEqual(mockPlatformAccessory, existingPlatformAccessory);
    assert.strictEqual(mockPlatformAccessory.name, 'Test Device Dry Mode Switch');
    assert.strictEqual(mockPlatformAccessory.context.airstageClient, mockHomebridge.platform.airstageClient);
    assert.strictEqual(mockPlatformAccessory.context.deviceId, deviceId);
    assert.strictEqual(mockPlatformAccessory.context.model, deviceModel);
    assert.strictEqual(mockHomebridge.platform.accessories.length, 1);
    assert.strictEqual(mockHomebridge.platform.accessories[0], mockPlatformAccessory);

    mockHomebridge.resetMocks();
});

test('PlatformAccessoryManager#registerDryModeSwitchAccessory registers new accessory', (context) => {
    platformAccessoryManager.registerDryModeSwitchAccessory(deviceId, deviceName, deviceModel);

    const mockedMethod = mockHomebridge.platform.api.registerPlatformAccessories.mock;
    assert.strictEqual(mockedMethod.calls.length, 1);
    assert.strictEqual(mockedMethod.calls[0].arguments[0], settings.PLUGIN_NAME);
    assert.strictEqual(mockedMethod.calls[0].arguments[1], settings.PLATFORM_NAME);
    const mockPlatformAccessory = mockedMethod.calls[0].arguments[2][0];
    assert.strictEqual(mockPlatformAccessory.name, 'Test Device Dry Mode Switch');
    assert.strictEqual(mockPlatformAccessory.context.airstageClient, mockHomebridge.platform.airstageClient);
    assert.strictEqual(mockPlatformAccessory.context.deviceId, deviceId);
    assert.strictEqual(mockPlatformAccessory.context.model, deviceModel);
    assert.strictEqual(mockHomebridge.platform.accessories.length, 1);
    assert.strictEqual(mockHomebridge.platform.accessories[0], mockPlatformAccessory);

    mockHomebridge.resetMocks();
});

test('PlatformAccessoryManager#registerEconomySwitchAccessory registers existing accessory', (context) => {
    const existingUuid = hap.uuid.generate(
        deviceId + '-economy-switch'
    );
    const existingPlatformAccessory = new mockHomebridge.platform.api.platformAccessory(
        'Test Device Economy Switch',
        existingUuid
    );
    mockHomebridge.platform.accessories = [existingPlatformAccessory];

    platformAccessoryManager.registerEconomySwitchAccessory(deviceId, deviceName, deviceModel);

    const mockedMethod = mockHomebridge.platform.api.updatePlatformAccessories.mock;
    assert.strictEqual(mockedMethod.calls.length, 1);
    const mockPlatformAccessory = mockedMethod.calls[0].arguments[0][0];
    assert.strictEqual(mockPlatformAccessory, existingPlatformAccessory);
    assert.strictEqual(mockPlatformAccessory.name, 'Test Device Economy Switch');
    assert.strictEqual(mockPlatformAccessory.context.airstageClient, mockHomebridge.platform.airstageClient);
    assert.strictEqual(mockPlatformAccessory.context.deviceId, deviceId);
    assert.strictEqual(mockPlatformAccessory.context.model, deviceModel);
    assert.strictEqual(mockHomebridge.platform.accessories.length, 1);
    assert.strictEqual(mockHomebridge.platform.accessories[0], mockPlatformAccessory);

    mockHomebridge.resetMocks();
});

test('PlatformAccessoryManager#registerEconomySwitchAccessory registers new accessory', (context) => {
    platformAccessoryManager.registerEconomySwitchAccessory(deviceId, deviceName, deviceModel);

    const mockedMethod = mockHomebridge.platform.api.registerPlatformAccessories.mock;
    assert.strictEqual(mockedMethod.calls.length, 1);
    assert.strictEqual(mockedMethod.calls[0].arguments[0], settings.PLUGIN_NAME);
    assert.strictEqual(mockedMethod.calls[0].arguments[1], settings.PLATFORM_NAME);
    const mockPlatformAccessory = mockedMethod.calls[0].arguments[2][0];
    assert.strictEqual(mockPlatformAccessory.name, 'Test Device Economy Switch');
    assert.strictEqual(mockPlatformAccessory.context.airstageClient, mockHomebridge.platform.airstageClient);
    assert.strictEqual(mockPlatformAccessory.context.deviceId, deviceId);
    assert.strictEqual(mockPlatformAccessory.context.model, deviceModel);
    assert.strictEqual(mockHomebridge.platform.accessories.length, 1);
    assert.strictEqual(mockHomebridge.platform.accessories[0], mockPlatformAccessory);

    mockHomebridge.resetMocks();
});

test('PlatformAccessoryManager#registerEnergySavingFanSwitchAccessory registers existing accessory', (context) => {
    const existingUuid = hap.uuid.generate(
        deviceId + '-energy-saving-fan-switch'
    );
    const existingPlatformAccessory = new mockHomebridge.platform.api.platformAccessory(
        'Test Device Energy Saving Fan Switch',
        existingUuid
    );
    mockHomebridge.platform.accessories = [existingPlatformAccessory];

    platformAccessoryManager.registerEnergySavingFanSwitchAccessory(deviceId, deviceName, deviceModel);

    const mockedMethod = mockHomebridge.platform.api.updatePlatformAccessories.mock;
    assert.strictEqual(mockedMethod.calls.length, 1);
    const mockPlatformAccessory = mockedMethod.calls[0].arguments[0][0];
    assert.strictEqual(mockPlatformAccessory, existingPlatformAccessory);
    assert.strictEqual(mockPlatformAccessory.name, 'Test Device Energy Saving Fan Switch');
    assert.strictEqual(mockPlatformAccessory.context.airstageClient, mockHomebridge.platform.airstageClient);
    assert.strictEqual(mockPlatformAccessory.context.deviceId, deviceId);
    assert.strictEqual(mockPlatformAccessory.context.model, deviceModel);
    assert.strictEqual(mockHomebridge.platform.accessories.length, 1);
    assert.strictEqual(mockHomebridge.platform.accessories[0], mockPlatformAccessory);

    mockHomebridge.resetMocks();
});

test('PlatformAccessoryManager#registerEnergySavingFanSwitchAccessory registers new accessory', (context) => {
    platformAccessoryManager.registerEnergySavingFanSwitchAccessory(deviceId, deviceName, deviceModel);

    const mockedMethod = mockHomebridge.platform.api.registerPlatformAccessories.mock;
    assert.strictEqual(mockedMethod.calls.length, 1);
    assert.strictEqual(mockedMethod.calls[0].arguments[0], settings.PLUGIN_NAME);
    assert.strictEqual(mockedMethod.calls[0].arguments[1], settings.PLATFORM_NAME);
    const mockPlatformAccessory = mockedMethod.calls[0].arguments[2][0];
    assert.strictEqual(mockPlatformAccessory.name, 'Test Device Energy Saving Fan Switch');
    assert.strictEqual(mockPlatformAccessory.context.airstageClient, mockHomebridge.platform.airstageClient);
    assert.strictEqual(mockPlatformAccessory.context.deviceId, deviceId);
    assert.strictEqual(mockPlatformAccessory.context.model, deviceModel);
    assert.strictEqual(mockHomebridge.platform.accessories.length, 1);
    assert.strictEqual(mockHomebridge.platform.accessories[0], mockPlatformAccessory);

    mockHomebridge.resetMocks();
});

test('PlatformAccessoryManager#registerFanModeSwitchAccessory registers existing accessory', (context) => {
    const existingUuid = hap.uuid.generate(
        deviceId + '-fan-mode-switch'
    );
    const existingPlatformAccessory = new mockHomebridge.platform.api.platformAccessory(
        'Test Device Fan Mode Switch',
        existingUuid
    );
    mockHomebridge.platform.accessories = [existingPlatformAccessory];

    platformAccessoryManager.registerFanModeSwitchAccessory(deviceId, deviceName, deviceModel);

    const mockedMethod = mockHomebridge.platform.api.updatePlatformAccessories.mock;
    assert.strictEqual(mockedMethod.calls.length, 1);
    const mockPlatformAccessory = mockedMethod.calls[0].arguments[0][0];
    assert.strictEqual(mockPlatformAccessory, existingPlatformAccessory);
    assert.strictEqual(mockPlatformAccessory.name, 'Test Device Fan Mode Switch');
    assert.strictEqual(mockPlatformAccessory.context.airstageClient, mockHomebridge.platform.airstageClient);
    assert.strictEqual(mockPlatformAccessory.context.deviceId, deviceId);
    assert.strictEqual(mockPlatformAccessory.context.model, deviceModel);
    assert.strictEqual(mockHomebridge.platform.accessories.length, 1);
    assert.strictEqual(mockHomebridge.platform.accessories[0], mockPlatformAccessory);

    mockHomebridge.resetMocks();
});

test('PlatformAccessoryManager#registerFanModeSwitchAccessory registers new accessory', (context) => {
    platformAccessoryManager.registerFanModeSwitchAccessory(deviceId, deviceName, deviceModel);

    const mockedMethod = mockHomebridge.platform.api.registerPlatformAccessories.mock;
    assert.strictEqual(mockedMethod.calls.length, 1);
    assert.strictEqual(mockedMethod.calls[0].arguments[0], settings.PLUGIN_NAME);
    assert.strictEqual(mockedMethod.calls[0].arguments[1], settings.PLATFORM_NAME);
    const mockPlatformAccessory = mockedMethod.calls[0].arguments[2][0];
    assert.strictEqual(mockPlatformAccessory.name, 'Test Device Fan Mode Switch');
    assert.strictEqual(mockPlatformAccessory.context.airstageClient, mockHomebridge.platform.airstageClient);
    assert.strictEqual(mockPlatformAccessory.context.deviceId, deviceId);
    assert.strictEqual(mockPlatformAccessory.context.model, deviceModel);
    assert.strictEqual(mockHomebridge.platform.accessories.length, 1);
    assert.strictEqual(mockHomebridge.platform.accessories[0], mockPlatformAccessory);

    mockHomebridge.resetMocks();
});

test('PlatformAccessoryManager#registerMinimumHeatModeSwitchAccessory registers existing accessory', (context) => {
    const existingUuid = hap.uuid.generate(
        deviceId + '-minimum-heat-mode-switch'
    );
    const existingPlatformAccessory = new mockHomebridge.platform.api.platformAccessory(
        'Test Device Minimum Heat Mode Switch',
        existingUuid
    );
    mockHomebridge.platform.accessories = [existingPlatformAccessory];

    platformAccessoryManager.registerMinimumHeatModeSwitchAccessory(deviceId, deviceName, deviceModel);

    const mockedMethod = mockHomebridge.platform.api.updatePlatformAccessories.mock;
    assert.strictEqual(mockedMethod.calls.length, 1);
    const mockPlatformAccessory = mockedMethod.calls[0].arguments[0][0];
    assert.strictEqual(mockPlatformAccessory, existingPlatformAccessory);
    assert.strictEqual(mockPlatformAccessory.name, 'Test Device Minimum Heat Mode Switch');
    assert.strictEqual(mockPlatformAccessory.context.airstageClient, mockHomebridge.platform.airstageClient);
    assert.strictEqual(mockPlatformAccessory.context.deviceId, deviceId);
    assert.strictEqual(mockPlatformAccessory.context.model, deviceModel);
    assert.strictEqual(mockHomebridge.platform.accessories.length, 1);
    assert.strictEqual(mockHomebridge.platform.accessories[0], mockPlatformAccessory);

    mockHomebridge.resetMocks();
});

test('PlatformAccessoryManager#registerMinimumHeatModeSwitchAccessory registers new accessory', (context) => {
    platformAccessoryManager.registerMinimumHeatModeSwitchAccessory(deviceId, deviceName, deviceModel);

    const mockedMethod = mockHomebridge.platform.api.registerPlatformAccessories.mock;
    assert.strictEqual(mockedMethod.calls.length, 1);
    assert.strictEqual(mockedMethod.calls[0].arguments[0], settings.PLUGIN_NAME);
    assert.strictEqual(mockedMethod.calls[0].arguments[1], settings.PLATFORM_NAME);
    const mockPlatformAccessory = mockedMethod.calls[0].arguments[2][0];
    assert.strictEqual(mockPlatformAccessory.name, 'Test Device Minimum Heat Mode Switch');
    assert.strictEqual(mockPlatformAccessory.context.airstageClient, mockHomebridge.platform.airstageClient);
    assert.strictEqual(mockPlatformAccessory.context.deviceId, deviceId);
    assert.strictEqual(mockPlatformAccessory.context.model, deviceModel);
    assert.strictEqual(mockHomebridge.platform.accessories.length, 1);
    assert.strictEqual(mockHomebridge.platform.accessories[0], mockPlatformAccessory);

    mockHomebridge.resetMocks();
});

test('PlatformAccessoryManager#registerPowerfulSwitchAccessory registers existing accessory', (context) => {
    const existingUuid = hap.uuid.generate(
        deviceId + '-powerful-switch'
    );
    const existingPlatformAccessory = new mockHomebridge.platform.api.platformAccessory(
        'Test Device Powerful Switch',
        existingUuid
    );
    mockHomebridge.platform.accessories = [existingPlatformAccessory];

    platformAccessoryManager.registerPowerfulSwitchAccessory(deviceId, deviceName, deviceModel);

    const mockedMethod = mockHomebridge.platform.api.updatePlatformAccessories.mock;
    assert.strictEqual(mockedMethod.calls.length, 1);
    const mockPlatformAccessory = mockedMethod.calls[0].arguments[0][0];
    assert.strictEqual(mockPlatformAccessory, existingPlatformAccessory);
    assert.strictEqual(mockPlatformAccessory.name, 'Test Device Powerful Switch');
    assert.strictEqual(mockPlatformAccessory.context.airstageClient, mockHomebridge.platform.airstageClient);
    assert.strictEqual(mockPlatformAccessory.context.deviceId, deviceId);
    assert.strictEqual(mockPlatformAccessory.context.model, deviceModel);
    assert.strictEqual(mockHomebridge.platform.accessories.length, 1);
    assert.strictEqual(mockHomebridge.platform.accessories[0], mockPlatformAccessory);

    mockHomebridge.resetMocks();
});

test('PlatformAccessoryManager#registerPowerfulSwitchAccessory registers new accessory', (context) => {
    platformAccessoryManager.registerPowerfulSwitchAccessory(deviceId, deviceName, deviceModel);

    const mockedMethod = mockHomebridge.platform.api.registerPlatformAccessories.mock;
    assert.strictEqual(mockedMethod.calls.length, 1);
    assert.strictEqual(mockedMethod.calls[0].arguments[0], settings.PLUGIN_NAME);
    assert.strictEqual(mockedMethod.calls[0].arguments[1], settings.PLATFORM_NAME);
    const mockPlatformAccessory = mockedMethod.calls[0].arguments[2][0];
    assert.strictEqual(mockPlatformAccessory.name, 'Test Device Powerful Switch');
    assert.strictEqual(mockPlatformAccessory.context.airstageClient, mockHomebridge.platform.airstageClient);
    assert.strictEqual(mockPlatformAccessory.context.deviceId, deviceId);
    assert.strictEqual(mockPlatformAccessory.context.model, deviceModel);
    assert.strictEqual(mockHomebridge.platform.accessories.length, 1);
    assert.strictEqual(mockHomebridge.platform.accessories[0], mockPlatformAccessory);

    mockHomebridge.resetMocks();
});

test('PlatformAccessoryManager#unregisterThermostatAccessory unregisters existing accessory', (context) => {
    const existingUuid = hap.uuid.generate(
        deviceId + '-thermostat'
    );
    const existingPlatformAccessory = new mockHomebridge.platform.api.platformAccessory(
        'Test Device Thermostat',
        existingUuid
    );
    mockHomebridge.platform.accessories = [existingPlatformAccessory];

    platformAccessoryManager.unregisterThermostatAccessory(deviceId, deviceName);

    const mockedMethod = mockHomebridge.platform.api.unregisterPlatformAccessories.mock;
    assert.strictEqual(mockedMethod.calls.length, 1);
    assert.strictEqual(mockedMethod.calls[0].arguments[0], settings.PLUGIN_NAME);
    assert.strictEqual(mockedMethod.calls[0].arguments[1], settings.PLATFORM_NAME);
    const mockPlatformAccessory = mockedMethod.calls[0].arguments[2][0];
    assert.strictEqual(mockPlatformAccessory, existingPlatformAccessory);

    mockHomebridge.resetMocks();
});

test('PlatformAccessoryManager#unregisterFanAccessory unregisters existing accessory', (context) => {
    const existingUuid = hap.uuid.generate(
        deviceId + '-fan'
    );
    const existingPlatformAccessory = new mockHomebridge.platform.api.platformAccessory(
        'Test Device Fan',
        existingUuid
    );
    mockHomebridge.platform.accessories = [existingPlatformAccessory];

    platformAccessoryManager.unregisterFanAccessory(deviceId, deviceName);

    const mockedMethod = mockHomebridge.platform.api.unregisterPlatformAccessories.mock;
    assert.strictEqual(mockedMethod.calls.length, 1);
    assert.strictEqual(mockedMethod.calls[0].arguments[0], settings.PLUGIN_NAME);
    assert.strictEqual(mockedMethod.calls[0].arguments[1], settings.PLATFORM_NAME);
    const mockPlatformAccessory = mockedMethod.calls[0].arguments[2][0];
    assert.strictEqual(mockPlatformAccessory, existingPlatformAccessory);

    mockHomebridge.resetMocks();
});

test('PlatformAccessoryManager#unregisterVerticalSlatsAccessory unregisters existing accessory', (context) => {
    const existingUuid = hap.uuid.generate(
        deviceId + '-vertical-slats'
    );
    const existingPlatformAccessory = new mockHomebridge.platform.api.platformAccessory(
        'Test Device Vertical Slats',
        existingUuid
    );
    mockHomebridge.platform.accessories = [existingPlatformAccessory];

    platformAccessoryManager.unregisterVerticalSlatsAccessory(deviceId, deviceName);

    const mockedMethod = mockHomebridge.platform.api.unregisterPlatformAccessories.mock;
    assert.strictEqual(mockedMethod.calls.length, 1);
    assert.strictEqual(mockedMethod.calls[0].arguments[0], settings.PLUGIN_NAME);
    assert.strictEqual(mockedMethod.calls[0].arguments[1], settings.PLATFORM_NAME);
    const mockPlatformAccessory = mockedMethod.calls[0].arguments[2][0];
    assert.strictEqual(mockPlatformAccessory, existingPlatformAccessory);

    mockHomebridge.resetMocks();
});

test('PlatformAccessoryManager#unregisterVerticalAirflowDirectionAccessory unregisters existing accessory', (context) => {
    const existingUuid = hap.uuid.generate(
        deviceId + '-vertical-airflow-direction'
    );
    const existingPlatformAccessory = new mockHomebridge.platform.api.platformAccessory(
        'Test Device Vertical Airflow Direction',
        existingUuid
    );
    mockHomebridge.platform.accessories = [existingPlatformAccessory];

    platformAccessoryManager.unregisterVerticalAirflowDirectionAccessory(deviceId, deviceName);

    const mockedMethod = mockHomebridge.platform.api.unregisterPlatformAccessories.mock;
    assert.strictEqual(mockedMethod.calls.length, 1);
    assert.strictEqual(mockedMethod.calls[0].arguments[0], settings.PLUGIN_NAME);
    assert.strictEqual(mockedMethod.calls[0].arguments[1], settings.PLATFORM_NAME);
    const mockPlatformAccessory = mockedMethod.calls[0].arguments[2][0];
    assert.strictEqual(mockPlatformAccessory, existingPlatformAccessory);

    mockHomebridge.resetMocks();
});

test('PlatformAccessoryManager#unregisterDryModeSwitchAccessory unregisters existing accessory', (context) => {
    const existingUuid = hap.uuid.generate(
        deviceId + '-dry-mode-switch'
    );
    const existingPlatformAccessory = new mockHomebridge.platform.api.platformAccessory(
        'Test Device Dry Mode Switch',
        existingUuid
    );
    mockHomebridge.platform.accessories = [existingPlatformAccessory];

    platformAccessoryManager.unregisterDryModeSwitchAccessory(deviceId, deviceName);

    const mockedMethod = mockHomebridge.platform.api.unregisterPlatformAccessories.mock;
    assert.strictEqual(mockedMethod.calls.length, 1);
    assert.strictEqual(mockedMethod.calls[0].arguments[0], settings.PLUGIN_NAME);
    assert.strictEqual(mockedMethod.calls[0].arguments[1], settings.PLATFORM_NAME);
    const mockPlatformAccessory = mockedMethod.calls[0].arguments[2][0];
    assert.strictEqual(mockPlatformAccessory, existingPlatformAccessory);

    mockHomebridge.resetMocks();
});

test('PlatformAccessoryManager#unregisterEconomySwitchAccessory unregisters existing accessory', (context) => {
    const existingUuid = hap.uuid.generate(
        deviceId + '-economy-switch'
    );
    const existingPlatformAccessory = new mockHomebridge.platform.api.platformAccessory(
        'Test Device Economy Switch',
        existingUuid
    );
    mockHomebridge.platform.accessories = [existingPlatformAccessory];

    platformAccessoryManager.unregisterEconomySwitchAccessory(deviceId, deviceName);

    const mockedMethod = mockHomebridge.platform.api.unregisterPlatformAccessories.mock;
    assert.strictEqual(mockedMethod.calls.length, 1);
    assert.strictEqual(mockedMethod.calls[0].arguments[0], settings.PLUGIN_NAME);
    assert.strictEqual(mockedMethod.calls[0].arguments[1], settings.PLATFORM_NAME);
    const mockPlatformAccessory = mockedMethod.calls[0].arguments[2][0];
    assert.strictEqual(mockPlatformAccessory, existingPlatformAccessory);

    mockHomebridge.resetMocks();
});

test('PlatformAccessoryManager#unregisterEnergySavingFanSwitchAccessory unregisters existing accessory', (context) => {
    const existingUuid = hap.uuid.generate(
        deviceId + '-energy-saving-fan-switch'
    );
    const existingPlatformAccessory = new mockHomebridge.platform.api.platformAccessory(
        'Test Device Energy Saving Fan Switch',
        existingUuid
    );
    mockHomebridge.platform.accessories = [existingPlatformAccessory];

    platformAccessoryManager.unregisterEnergySavingFanSwitchAccessory(deviceId, deviceName);

    const mockedMethod = mockHomebridge.platform.api.unregisterPlatformAccessories.mock;
    assert.strictEqual(mockedMethod.calls.length, 1);
    assert.strictEqual(mockedMethod.calls[0].arguments[0], settings.PLUGIN_NAME);
    assert.strictEqual(mockedMethod.calls[0].arguments[1], settings.PLATFORM_NAME);
    const mockPlatformAccessory = mockedMethod.calls[0].arguments[2][0];
    assert.strictEqual(mockPlatformAccessory, existingPlatformAccessory);

    mockHomebridge.resetMocks();
});

test('PlatformAccessoryManager#unregisterFanModeSwitchAccessory unregisters existing accessory', (context) => {
    const existingUuid = hap.uuid.generate(
        deviceId + '-fan-mode-switch'
    );
    const existingPlatformAccessory = new mockHomebridge.platform.api.platformAccessory(
        'Test Device Fan Mode Switch',
        existingUuid
    );
    mockHomebridge.platform.accessories = [existingPlatformAccessory];

    platformAccessoryManager.unregisterFanModeSwitchAccessory(deviceId, deviceName);

    const mockedMethod = mockHomebridge.platform.api.unregisterPlatformAccessories.mock;
    assert.strictEqual(mockedMethod.calls.length, 1);
    assert.strictEqual(mockedMethod.calls[0].arguments[0], settings.PLUGIN_NAME);
    assert.strictEqual(mockedMethod.calls[0].arguments[1], settings.PLATFORM_NAME);
    const mockPlatformAccessory = mockedMethod.calls[0].arguments[2][0];
    assert.strictEqual(mockPlatformAccessory, existingPlatformAccessory);

    mockHomebridge.resetMocks();
});

test('PlatformAccessoryManager#unregisterMinimumHeatModeSwitchAccessory unregisters existing accessory', (context) => {
    const existingUuid = hap.uuid.generate(
        deviceId + '-minimum-heat-mode-switch'
    );
    const existingPlatformAccessory = new mockHomebridge.platform.api.platformAccessory(
        'Test Device Minimum Heat Mode Switch',
        existingUuid
    );
    mockHomebridge.platform.accessories = [existingPlatformAccessory];

    platformAccessoryManager.unregisterMinimumHeatModeSwitchAccessory(deviceId, deviceName);

    const mockedMethod = mockHomebridge.platform.api.unregisterPlatformAccessories.mock;
    assert.strictEqual(mockedMethod.calls.length, 1);
    assert.strictEqual(mockedMethod.calls[0].arguments[0], settings.PLUGIN_NAME);
    assert.strictEqual(mockedMethod.calls[0].arguments[1], settings.PLATFORM_NAME);
    const mockPlatformAccessory = mockedMethod.calls[0].arguments[2][0];
    assert.strictEqual(mockPlatformAccessory, existingPlatformAccessory);

    mockHomebridge.resetMocks();
});

test('PlatformAccessoryManager#unregisterPowerfulSwitchAccessory unregisters existing accessory', (context) => {
    const existingUuid = hap.uuid.generate(
        deviceId + '-powerful-switch'
    );
    const existingPlatformAccessory = new mockHomebridge.platform.api.platformAccessory(
        'Test Device Powerful Switch',
        existingUuid
    );
    mockHomebridge.platform.accessories = [existingPlatformAccessory];

    platformAccessoryManager.unregisterPowerfulSwitchAccessory(deviceId, deviceName);

    const mockedMethod = mockHomebridge.platform.api.unregisterPlatformAccessories.mock;
    assert.strictEqual(mockedMethod.calls.length, 1);
    assert.strictEqual(mockedMethod.calls[0].arguments[0], settings.PLUGIN_NAME);
    assert.strictEqual(mockedMethod.calls[0].arguments[1], settings.PLATFORM_NAME);
    const mockPlatformAccessory = mockedMethod.calls[0].arguments[2][0];
    assert.strictEqual(mockPlatformAccessory, existingPlatformAccessory);

    mockHomebridge.resetMocks();
});

test('PlatformAccessoryManager#unregisterVerticalSlatsAccessory with log=false', () => {
    const deviceId = 'id';
    const deviceName = 'Name';
    // Should not throw or log
    platformAccessoryManager._unregisterAccessory = mock.fn();
    platformAccessoryManager.unregisterVerticalSlatsAccessory(deviceId, deviceName);
    // log=false disables log, so _unregisterAccessory should be called with log=false
    assert.strictEqual(platformAccessoryManager._unregisterAccessory.mock.calls[0].arguments[3], false);
});

test('PlatformAccessoryManager#_refreshAccessoryCharacteristics returns false if no service', () => {
    const accessory = { services: [] };
    const result = platformAccessoryManager._refreshAccessoryCharacteristics(accessory, [123]);
    assert.strictEqual(result, false);
});

test('PlatformAccessoryManager#_getExistingAccessory returns null if not found', () => {
    const result = platformAccessoryManager._getExistingAccessory('notfound', 'suffix');
    assert.strictEqual(result, null);
});

test('PlatformAccessoryManager#_getAccessoryName handles unusual suffix', () => {
    const name = platformAccessoryManager._getAccessoryName('Device', 'foo-bar-baz');
    assert.strictEqual(name, 'Device Foo Bar Baz');
});

test('PlatformAccessoryManager#refreshAllAccessoryCharacteristics returns false if no accessories', () => {
    // Remove all accessories
    mockHomebridge.platform.accessories = [];
    // All refresh methods should return false
    assert.strictEqual(platformAccessoryManager.refreshThermostatAccessoryCharacteristics('none'), false);
    assert.strictEqual(platformAccessoryManager.refreshFanAccessoryCharacteristics('none'), false);
    assert.strictEqual(platformAccessoryManager.refreshVerticalAirflowDirectionAccessoryCharacteristics('none'), false);
    assert.strictEqual(platformAccessoryManager.refreshDryModeSwitchAccessoryCharacteristics('none'), false);
    assert.strictEqual(platformAccessoryManager.refreshEconomySwitchAccessoryCharacteristics('none'), false);
    assert.strictEqual(platformAccessoryManager.refreshEnergySavingFanSwitchAccessoryCharacteristics('none'), false);
    assert.strictEqual(platformAccessoryManager.refreshFanModeSwitchAccessoryCharacteristics('none'), false);
    assert.strictEqual(platformAccessoryManager.refreshMinimumHeatModeSwitchAccessoryCharacteristics('none'), false);
    assert.strictEqual(platformAccessoryManager.refreshPowerfulSwitchAccessoryCharacteristics('none'), false);
});

test('PlatformAccessoryManager#refreshServiceCharacteristics covers success and error branches', () => {
    let debugCalled = false;
    let errorCalled = false;
    let sendEventCalled = false;
    const fakeService = {
        constructor: { name: 'FakeService' },
        getCharacteristic: function(cls) {
            return {
                constructor: { name: 'FakeChar' },
                emit: (event, cb) => {
                    // Simulate both success and error
                    cb(null, 42); // success
                    cb('fail', null); // error
                },
                sendEventNotification: (val) => {
                    sendEventCalled = true;
                }
            };
        }
    };
    const fakePlatform = {
        log: {
            debug: () => { debugCalled = true; },
            error: () => { errorCalled = true; }
        },
        api: {},
        accessories: []
    };
    const mgr = new PlatformAccessoryManager(fakePlatform);
    const result = mgr.refreshServiceCharacteristics(fakeService, [123]);
    assert.strictEqual(result, true);
    assert(debugCalled, 'debug log called');
    assert(errorCalled, 'error log called');
    assert(sendEventCalled, 'sendEventNotification called');
});

test('PlatformAccessoryManager#_unregisterAccessory with no existing accessory and log true/false', () => {
    let infoCalled = 0;
    const fakePlatform = {
        log: { info: () => { infoCalled++; } },
        api: {
            hap: { uuid: { generate: () => 'uuid' } }
        },
        accessories: [],
    };
    const mgr = new PlatformAccessoryManager(fakePlatform);
    // Should log if log=true
    mgr._unregisterAccessory('id', 'Name', 'suffix', true);
    assert.strictEqual(infoCalled, 1);
    // Should not log if log=false
    mgr._unregisterAccessory('id', 'Name', 'suffix', false);
    assert.strictEqual(infoCalled, 1);
});

test('PlatformAccessoryManager#_unregisterExistingAccessory logs and calls api', () => {
    let infoCalled = false;
    let apiCalled = false;
    const fakePlatform = {
        log: { info: () => { infoCalled = true; } },
        api: {
            unregisterPlatformAccessories: () => { apiCalled = true; }
        },
        accessories: []
    };
    const mgr = new PlatformAccessoryManager(fakePlatform);
    const fakeAccessory = { displayName: 'X' };
    mgr._unregisterExistingAccessory(fakeAccessory, true);
    assert(infoCalled, 'info log called');
    assert(apiCalled, 'api called');
    // log=false skips log
    infoCalled = false;
    mgr._unregisterExistingAccessory(fakeAccessory, false);
    assert(!infoCalled, 'info log not called');
});

test('PlatformAccessoryManager#_registerNewAccessory sets context and pushes accessory', () => {
    let infoCalled = false;
    let apiCalled = false;
    const fakePlatform = {
        log: { info: () => { infoCalled = true; } },
        api: {
            registerPlatformAccessories: () => { apiCalled = true; }
        },
        airstageClient: 123,
        accessories: []
    };
    const mgr = new PlatformAccessoryManager(fakePlatform);
    const fakeAccessory = { context: {}, displayName: 'Y' };
    mgr._registerNewAccessory(fakeAccessory, 'id', 'model');
    assert(infoCalled, 'info log called');
    assert(apiCalled, 'api called');
    assert.strictEqual(fakeAccessory.context.airstageClient, 123);
    assert.strictEqual(fakeAccessory.context.deviceId, 'id');
    assert.strictEqual(fakeAccessory.context.model, 'model');
    assert.strictEqual(fakePlatform.accessories[0], fakeAccessory);
});

test('PlatformAccessoryManager#_updateExistingAccessory sets context and calls updatePlatformAccessories', () => {
    let infoCalled = false;
    let apiCalled = false;
    const fakePlatform = {
        log: { info: () => { infoCalled = true; } },
        api: {
            updatePlatformAccessories: () => { apiCalled = true; }
        },
        airstageClient: 456
    };
    const mgr = new PlatformAccessoryManager(fakePlatform);
    const fakeAccessory = { context: {}, displayName: 'Z' };
    mgr._updateExistingAccessory(fakeAccessory, 'id', 'model');
    assert(infoCalled, 'info log called');
    assert(apiCalled, 'api called');
    assert.strictEqual(fakeAccessory.context.airstageClient, 456);
    assert.strictEqual(fakeAccessory.context.deviceId, 'id');
    assert.strictEqual(fakeAccessory.context.model, 'model');
});
