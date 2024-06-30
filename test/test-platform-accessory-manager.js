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
