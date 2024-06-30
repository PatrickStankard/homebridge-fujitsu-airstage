'use strict';

const assert = require('node:assert');
const { mock, test } = require('node:test');
const hap = require('hap-nodejs');
const PlatformAccessoryManager = require('../src/platform-accessory-manager');
const airstage = require('../src/airstage');
const settings = require('../src/settings');

const airstageClient = new airstage.Client(
    'us',
    'United States',
    'en'
);

const mockCharacteristic = {
    'on': mock.fn(
        (event, listener) => {
            return mockCharacteristic;
        }
    )
};

const mockService = {
    'setCharacteristic': mock.fn(
        (name, value) => {
            return mockService;
        }
    ),
    'getCharacteristic': mock.fn(
        (name) => {
            return mockCharacteristic;
        }
    )
};

class MockPlatformAccessory {
    context = {};

    constructor(name, uuid) {
        this.name = name;
        this.uuid = uuid;
        this.UUID = uuid;
    }

    getService(name) {
        return mockService;
    }
}

const mockPlatform = {
    'Characteristic': hap.Characteristic,
    'Service': hap.Service,
    'airstageClient': airstageClient,
    'accessories': [],
    'api': {
        'hap': hap,
        'platformAccessory': MockPlatformAccessory,
        'updatePlatformAccessories': mock.fn(
            (accessories) => {}
        ),
        'registerPlatformAccessories': mock.fn(
            (pluginName, platformName, accessories) => {}
        ),
        'unregisterPlatformAccessories': mock.fn(
            (pluginName, platformName, accessories) => {}
        ),
    },
    'log': {
        'debug': mock.fn(() => {}),
        'error': mock.fn(() => {}),
        'info': mock.fn(() => {}),
    }
};

const platformAccessoryManager = new PlatformAccessoryManager(mockPlatform);

const deviceId = '1234';
const deviceName = 'Test Device';
const deviceModel = 'Test Model';

function resetMocks() {
    mockCharacteristic.on.mock.resetCalls();
    mockService.setCharacteristic.mock.resetCalls();
    mockService.setCharacteristic.mock.resetCalls();
    mockPlatform.api.updatePlatformAccessories.mock.resetCalls();
    mockPlatform.api.registerPlatformAccessories.mock.resetCalls();
    mockPlatform.api.unregisterPlatformAccessories.mock.resetCalls();
    mockPlatform.log.debug.mock.resetCalls();
    mockPlatform.log.error.mock.resetCalls();
    mockPlatform.log.info.mock.resetCalls();
    mockPlatform.accessories = [];
}

test('PlatformAccessoryManager#registerThermostatAccessory registers existing accessory', (context) => {
    const existingUuid = hap.uuid.generate(
        deviceId + '-thermostat'
    );
    const existingPlatformAccessory = new MockPlatformAccessory(
        'Test Device Thermostat',
        existingUuid
    );
    mockPlatform.accessories = [existingPlatformAccessory];

    platformAccessoryManager.registerThermostatAccessory(deviceId, deviceName, deviceModel);

    const mockedMethod = mockPlatform.api.updatePlatformAccessories.mock;
    assert.strictEqual(mockedMethod.calls.length, 1);
    const mockPlatformAccessory = mockedMethod.calls[0].arguments[0][0];
    assert.strictEqual(mockPlatformAccessory, existingPlatformAccessory);
    assert.strictEqual(mockPlatformAccessory.name, 'Test Device Thermostat');
    assert.strictEqual(mockPlatformAccessory.context.airstageClient, airstageClient);
    assert.strictEqual(mockPlatformAccessory.context.deviceId, deviceId);
    assert.strictEqual(mockPlatformAccessory.context.model, deviceModel);
    assert.strictEqual(mockPlatform.accessories.length, 1);
    assert.strictEqual(mockPlatform.accessories[0], mockPlatformAccessory);

    resetMocks();
});

test('PlatformAccessoryManager#registerThermostatAccessory registers new accessory', (context) => {
    platformAccessoryManager.registerThermostatAccessory(deviceId, deviceName, deviceModel);

    const mockedMethod = mockPlatform.api.registerPlatformAccessories.mock;
    assert.strictEqual(mockedMethod.calls.length, 1);
    assert.strictEqual(mockedMethod.calls[0].arguments[0], settings.PLUGIN_NAME);
    assert.strictEqual(mockedMethod.calls[0].arguments[1], settings.PLATFORM_NAME);
    const mockPlatformAccessory = mockedMethod.calls[0].arguments[2][0];
    assert.strictEqual(mockPlatformAccessory.name, 'Test Device Thermostat');
    assert.strictEqual(mockPlatformAccessory.context.airstageClient, airstageClient);
    assert.strictEqual(mockPlatformAccessory.context.deviceId, deviceId);
    assert.strictEqual(mockPlatformAccessory.context.model, deviceModel);
    assert.strictEqual(mockPlatform.accessories.length, 1);
    assert.strictEqual(mockPlatform.accessories[0], mockPlatformAccessory);

    resetMocks();
});

test('PlatformAccessoryManager#registerFanAccessory registers existing accessory', (context) => {
    const existingUuid = hap.uuid.generate(
        deviceId + '-fan'
    );
    const existingPlatformAccessory = new MockPlatformAccessory(
        'Test Device Fan',
        existingUuid
    );
    mockPlatform.accessories = [existingPlatformAccessory];

    platformAccessoryManager.registerFanAccessory(deviceId, deviceName, deviceModel);

    const mockedMethod = mockPlatform.api.updatePlatformAccessories.mock;
    assert.strictEqual(mockedMethod.calls.length, 1);
    const mockPlatformAccessory = mockedMethod.calls[0].arguments[0][0];
    assert.strictEqual(mockPlatformAccessory, existingPlatformAccessory);
    assert.strictEqual(mockPlatformAccessory.name, 'Test Device Fan');
    assert.strictEqual(mockPlatformAccessory.context.airstageClient, airstageClient);
    assert.strictEqual(mockPlatformAccessory.context.deviceId, deviceId);
    assert.strictEqual(mockPlatformAccessory.context.model, deviceModel);
    assert.strictEqual(mockPlatform.accessories.length, 1);
    assert.strictEqual(mockPlatform.accessories[0], mockPlatformAccessory);

    resetMocks();
});

test('PlatformAccessoryManager#registerFanAccessory registers new accessory', (context) => {
    platformAccessoryManager.registerFanAccessory(deviceId, deviceName, deviceModel);

    const mockedMethod = mockPlatform.api.registerPlatformAccessories.mock;
    assert.strictEqual(mockedMethod.calls.length, 1);
    assert.strictEqual(mockedMethod.calls[0].arguments[0], settings.PLUGIN_NAME);
    assert.strictEqual(mockedMethod.calls[0].arguments[1], settings.PLATFORM_NAME);
    const mockPlatformAccessory = mockedMethod.calls[0].arguments[2][0];
    assert.strictEqual(mockPlatformAccessory.name, 'Test Device Fan');
    assert.strictEqual(mockPlatformAccessory.context.airstageClient, airstageClient);
    assert.strictEqual(mockPlatformAccessory.context.deviceId, deviceId);
    assert.strictEqual(mockPlatformAccessory.context.model, deviceModel);
    assert.strictEqual(mockPlatform.accessories.length, 1);
    assert.strictEqual(mockPlatform.accessories[0], mockPlatformAccessory);

    resetMocks();
});

test('PlatformAccessoryManager#registerVerticalAirflowDirectionAccessory registers existing accessory', (context) => {
    const existingUuid = hap.uuid.generate(
        deviceId + '-vertical-airflow-direction'
    );
    const existingPlatformAccessory = new MockPlatformAccessory(
        'Test Device Vertical Airflow Direction',
        existingUuid
    );
    mockPlatform.accessories = [existingPlatformAccessory];

    platformAccessoryManager.registerVerticalAirflowDirectionAccessory(deviceId, deviceName, deviceModel);

    const mockedMethod = mockPlatform.api.updatePlatformAccessories.mock;
    assert.strictEqual(mockedMethod.calls.length, 1);
    const mockPlatformAccessory = mockedMethod.calls[0].arguments[0][0];
    assert.strictEqual(mockPlatformAccessory, existingPlatformAccessory);
    assert.strictEqual(mockPlatformAccessory.name, 'Test Device Vertical Airflow Direction');
    assert.strictEqual(mockPlatformAccessory.context.airstageClient, airstageClient);
    assert.strictEqual(mockPlatformAccessory.context.deviceId, deviceId);
    assert.strictEqual(mockPlatformAccessory.context.model, deviceModel);
    assert.strictEqual(mockPlatform.accessories.length, 1);
    assert.strictEqual(mockPlatform.accessories[0], mockPlatformAccessory);

    resetMocks();
});

test('PlatformAccessoryManager#registerVerticalAirflowDirectionAccessory registers new accessory', (context) => {
    platformAccessoryManager.registerVerticalAirflowDirectionAccessory(deviceId, deviceName, deviceModel);

    const mockedMethod = mockPlatform.api.registerPlatformAccessories.mock;
    assert.strictEqual(mockedMethod.calls.length, 1);
    assert.strictEqual(mockedMethod.calls[0].arguments[0], settings.PLUGIN_NAME);
    assert.strictEqual(mockedMethod.calls[0].arguments[1], settings.PLATFORM_NAME);
    const mockPlatformAccessory = mockedMethod.calls[0].arguments[2][0];
    assert.strictEqual(mockPlatformAccessory.name, 'Test Device Vertical Airflow Direction');
    assert.strictEqual(mockPlatformAccessory.context.airstageClient, airstageClient);
    assert.strictEqual(mockPlatformAccessory.context.deviceId, deviceId);
    assert.strictEqual(mockPlatformAccessory.context.model, deviceModel);
    assert.strictEqual(mockPlatform.accessories.length, 1);
    assert.strictEqual(mockPlatform.accessories[0], mockPlatformAccessory);

    resetMocks();
});

test('PlatformAccessoryManager#registerDryModeSwitchAccessory registers existing accessory', (context) => {
    const existingUuid = hap.uuid.generate(
        deviceId + '-dry-mode-switch'
    );
    const existingPlatformAccessory = new MockPlatformAccessory(
        'Test Device Dry Mode Switch',
        existingUuid
    );
    mockPlatform.accessories = [existingPlatformAccessory];

    platformAccessoryManager.registerDryModeSwitchAccessory(deviceId, deviceName, deviceModel);

    const mockedMethod = mockPlatform.api.updatePlatformAccessories.mock;
    assert.strictEqual(mockedMethod.calls.length, 1);
    const mockPlatformAccessory = mockedMethod.calls[0].arguments[0][0];
    assert.strictEqual(mockPlatformAccessory, existingPlatformAccessory);
    assert.strictEqual(mockPlatformAccessory.name, 'Test Device Dry Mode Switch');
    assert.strictEqual(mockPlatformAccessory.context.airstageClient, airstageClient);
    assert.strictEqual(mockPlatformAccessory.context.deviceId, deviceId);
    assert.strictEqual(mockPlatformAccessory.context.model, deviceModel);
    assert.strictEqual(mockPlatform.accessories.length, 1);
    assert.strictEqual(mockPlatform.accessories[0], mockPlatformAccessory);

    resetMocks();
});

test('PlatformAccessoryManager#registerDryModeSwitchAccessory registers new accessory', (context) => {
    platformAccessoryManager.registerDryModeSwitchAccessory(deviceId, deviceName, deviceModel);

    const mockedMethod = mockPlatform.api.registerPlatformAccessories.mock;
    assert.strictEqual(mockedMethod.calls.length, 1);
    assert.strictEqual(mockedMethod.calls[0].arguments[0], settings.PLUGIN_NAME);
    assert.strictEqual(mockedMethod.calls[0].arguments[1], settings.PLATFORM_NAME);
    const mockPlatformAccessory = mockedMethod.calls[0].arguments[2][0];
    assert.strictEqual(mockPlatformAccessory.name, 'Test Device Dry Mode Switch');
    assert.strictEqual(mockPlatformAccessory.context.airstageClient, airstageClient);
    assert.strictEqual(mockPlatformAccessory.context.deviceId, deviceId);
    assert.strictEqual(mockPlatformAccessory.context.model, deviceModel);
    assert.strictEqual(mockPlatform.accessories.length, 1);
    assert.strictEqual(mockPlatform.accessories[0], mockPlatformAccessory);

    resetMocks();
});

test('PlatformAccessoryManager#registerEconomySwitchAccessory registers existing accessory', (context) => {
    const existingUuid = hap.uuid.generate(
        deviceId + '-economy-switch'
    );
    const existingPlatformAccessory = new MockPlatformAccessory(
        'Test Device Economy Switch',
        existingUuid
    );
    mockPlatform.accessories = [existingPlatformAccessory];

    platformAccessoryManager.registerEconomySwitchAccessory(deviceId, deviceName, deviceModel);

    const mockedMethod = mockPlatform.api.updatePlatformAccessories.mock;
    assert.strictEqual(mockedMethod.calls.length, 1);
    const mockPlatformAccessory = mockedMethod.calls[0].arguments[0][0];
    assert.strictEqual(mockPlatformAccessory, existingPlatformAccessory);
    assert.strictEqual(mockPlatformAccessory.name, 'Test Device Economy Switch');
    assert.strictEqual(mockPlatformAccessory.context.airstageClient, airstageClient);
    assert.strictEqual(mockPlatformAccessory.context.deviceId, deviceId);
    assert.strictEqual(mockPlatformAccessory.context.model, deviceModel);
    assert.strictEqual(mockPlatform.accessories.length, 1);
    assert.strictEqual(mockPlatform.accessories[0], mockPlatformAccessory);

    resetMocks();
});

test('PlatformAccessoryManager#registerEconomySwitchAccessory registers new accessory', (context) => {
    platformAccessoryManager.registerEconomySwitchAccessory(deviceId, deviceName, deviceModel);

    const mockedMethod = mockPlatform.api.registerPlatformAccessories.mock;
    assert.strictEqual(mockedMethod.calls.length, 1);
    assert.strictEqual(mockedMethod.calls[0].arguments[0], settings.PLUGIN_NAME);
    assert.strictEqual(mockedMethod.calls[0].arguments[1], settings.PLATFORM_NAME);
    const mockPlatformAccessory = mockedMethod.calls[0].arguments[2][0];
    assert.strictEqual(mockPlatformAccessory.name, 'Test Device Economy Switch');
    assert.strictEqual(mockPlatformAccessory.context.airstageClient, airstageClient);
    assert.strictEqual(mockPlatformAccessory.context.deviceId, deviceId);
    assert.strictEqual(mockPlatformAccessory.context.model, deviceModel);
    assert.strictEqual(mockPlatform.accessories.length, 1);
    assert.strictEqual(mockPlatform.accessories[0], mockPlatformAccessory);

    resetMocks();
});

test('PlatformAccessoryManager#registerEnergySavingFanSwitchAccessory registers existing accessory', (context) => {
    const existingUuid = hap.uuid.generate(
        deviceId + '-energy-saving-fan-switch'
    );
    const existingPlatformAccessory = new MockPlatformAccessory(
        'Test Device Energy Saving Fan Switch',
        existingUuid
    );
    mockPlatform.accessories = [existingPlatformAccessory];

    platformAccessoryManager.registerEnergySavingFanSwitchAccessory(deviceId, deviceName, deviceModel);

    const mockedMethod = mockPlatform.api.updatePlatformAccessories.mock;
    assert.strictEqual(mockedMethod.calls.length, 1);
    const mockPlatformAccessory = mockedMethod.calls[0].arguments[0][0];
    assert.strictEqual(mockPlatformAccessory, existingPlatformAccessory);
    assert.strictEqual(mockPlatformAccessory.name, 'Test Device Energy Saving Fan Switch');
    assert.strictEqual(mockPlatformAccessory.context.airstageClient, airstageClient);
    assert.strictEqual(mockPlatformAccessory.context.deviceId, deviceId);
    assert.strictEqual(mockPlatformAccessory.context.model, deviceModel);
    assert.strictEqual(mockPlatform.accessories.length, 1);
    assert.strictEqual(mockPlatform.accessories[0], mockPlatformAccessory);

    resetMocks();
});

test('PlatformAccessoryManager#registerEnergySavingFanSwitchAccessory registers new accessory', (context) => {
    platformAccessoryManager.registerEnergySavingFanSwitchAccessory(deviceId, deviceName, deviceModel);

    const mockedMethod = mockPlatform.api.registerPlatformAccessories.mock;
    assert.strictEqual(mockedMethod.calls.length, 1);
    assert.strictEqual(mockedMethod.calls[0].arguments[0], settings.PLUGIN_NAME);
    assert.strictEqual(mockedMethod.calls[0].arguments[1], settings.PLATFORM_NAME);
    const mockPlatformAccessory = mockedMethod.calls[0].arguments[2][0];
    assert.strictEqual(mockPlatformAccessory.name, 'Test Device Energy Saving Fan Switch');
    assert.strictEqual(mockPlatformAccessory.context.airstageClient, airstageClient);
    assert.strictEqual(mockPlatformAccessory.context.deviceId, deviceId);
    assert.strictEqual(mockPlatformAccessory.context.model, deviceModel);
    assert.strictEqual(mockPlatform.accessories.length, 1);
    assert.strictEqual(mockPlatform.accessories[0], mockPlatformAccessory);

    resetMocks();
});

test('PlatformAccessoryManager#registerFanModeSwitchAccessory registers existing accessory', (context) => {
    const existingUuid = hap.uuid.generate(
        deviceId + '-fan-mode-switch'
    );
    const existingPlatformAccessory = new MockPlatformAccessory(
        'Test Device Fan Mode Switch',
        existingUuid
    );
    mockPlatform.accessories = [existingPlatformAccessory];

    platformAccessoryManager.registerFanModeSwitchAccessory(deviceId, deviceName, deviceModel);

    const mockedMethod = mockPlatform.api.updatePlatformAccessories.mock;
    assert.strictEqual(mockedMethod.calls.length, 1);
    const mockPlatformAccessory = mockedMethod.calls[0].arguments[0][0];
    assert.strictEqual(mockPlatformAccessory, existingPlatformAccessory);
    assert.strictEqual(mockPlatformAccessory.name, 'Test Device Fan Mode Switch');
    assert.strictEqual(mockPlatformAccessory.context.airstageClient, airstageClient);
    assert.strictEqual(mockPlatformAccessory.context.deviceId, deviceId);
    assert.strictEqual(mockPlatformAccessory.context.model, deviceModel);
    assert.strictEqual(mockPlatform.accessories.length, 1);
    assert.strictEqual(mockPlatform.accessories[0], mockPlatformAccessory);

    resetMocks();
});

test('PlatformAccessoryManager#registerFanModeSwitchAccessory registers new accessory', (context) => {
    platformAccessoryManager.registerFanModeSwitchAccessory(deviceId, deviceName, deviceModel);

    const mockedMethod = mockPlatform.api.registerPlatformAccessories.mock;
    assert.strictEqual(mockedMethod.calls.length, 1);
    assert.strictEqual(mockedMethod.calls[0].arguments[0], settings.PLUGIN_NAME);
    assert.strictEqual(mockedMethod.calls[0].arguments[1], settings.PLATFORM_NAME);
    const mockPlatformAccessory = mockedMethod.calls[0].arguments[2][0];
    assert.strictEqual(mockPlatformAccessory.name, 'Test Device Fan Mode Switch');
    assert.strictEqual(mockPlatformAccessory.context.airstageClient, airstageClient);
    assert.strictEqual(mockPlatformAccessory.context.deviceId, deviceId);
    assert.strictEqual(mockPlatformAccessory.context.model, deviceModel);
    assert.strictEqual(mockPlatform.accessories.length, 1);
    assert.strictEqual(mockPlatform.accessories[0], mockPlatformAccessory);

    resetMocks();
});

test('PlatformAccessoryManager#registerMinimumHeatModeSwitchAccessory registers existing accessory', (context) => {
    const existingUuid = hap.uuid.generate(
        deviceId + '-minimum-heat-mode-switch'
    );
    const existingPlatformAccessory = new MockPlatformAccessory(
        'Test Device Minimum Heat Mode Switch',
        existingUuid
    );
    mockPlatform.accessories = [existingPlatformAccessory];

    platformAccessoryManager.registerMinimumHeatModeSwitchAccessory(deviceId, deviceName, deviceModel);

    const mockedMethod = mockPlatform.api.updatePlatformAccessories.mock;
    assert.strictEqual(mockedMethod.calls.length, 1);
    const mockPlatformAccessory = mockedMethod.calls[0].arguments[0][0];
    assert.strictEqual(mockPlatformAccessory, existingPlatformAccessory);
    assert.strictEqual(mockPlatformAccessory.name, 'Test Device Minimum Heat Mode Switch');
    assert.strictEqual(mockPlatformAccessory.context.airstageClient, airstageClient);
    assert.strictEqual(mockPlatformAccessory.context.deviceId, deviceId);
    assert.strictEqual(mockPlatformAccessory.context.model, deviceModel);
    assert.strictEqual(mockPlatform.accessories.length, 1);
    assert.strictEqual(mockPlatform.accessories[0], mockPlatformAccessory);

    resetMocks();
});

test('PlatformAccessoryManager#registerMinimumHeatModeSwitchAccessory registers new accessory', (context) => {
    platformAccessoryManager.registerMinimumHeatModeSwitchAccessory(deviceId, deviceName, deviceModel);

    const mockedMethod = mockPlatform.api.registerPlatformAccessories.mock;
    assert.strictEqual(mockedMethod.calls.length, 1);
    assert.strictEqual(mockedMethod.calls[0].arguments[0], settings.PLUGIN_NAME);
    assert.strictEqual(mockedMethod.calls[0].arguments[1], settings.PLATFORM_NAME);
    const mockPlatformAccessory = mockedMethod.calls[0].arguments[2][0];
    assert.strictEqual(mockPlatformAccessory.name, 'Test Device Minimum Heat Mode Switch');
    assert.strictEqual(mockPlatformAccessory.context.airstageClient, airstageClient);
    assert.strictEqual(mockPlatformAccessory.context.deviceId, deviceId);
    assert.strictEqual(mockPlatformAccessory.context.model, deviceModel);
    assert.strictEqual(mockPlatform.accessories.length, 1);
    assert.strictEqual(mockPlatform.accessories[0], mockPlatformAccessory);

    resetMocks();
});

test('PlatformAccessoryManager#registerPowerfulSwitchAccessory registers existing accessory', (context) => {
    const existingUuid = hap.uuid.generate(
        deviceId + '-powerful-switch'
    );
    const existingPlatformAccessory = new MockPlatformAccessory(
        'Test Device Powerful Switch',
        existingUuid
    );
    mockPlatform.accessories = [existingPlatformAccessory];

    platformAccessoryManager.registerPowerfulSwitchAccessory(deviceId, deviceName, deviceModel);

    const mockedMethod = mockPlatform.api.updatePlatformAccessories.mock;
    assert.strictEqual(mockedMethod.calls.length, 1);
    const mockPlatformAccessory = mockedMethod.calls[0].arguments[0][0];
    assert.strictEqual(mockPlatformAccessory, existingPlatformAccessory);
    assert.strictEqual(mockPlatformAccessory.name, 'Test Device Powerful Switch');
    assert.strictEqual(mockPlatformAccessory.context.airstageClient, airstageClient);
    assert.strictEqual(mockPlatformAccessory.context.deviceId, deviceId);
    assert.strictEqual(mockPlatformAccessory.context.model, deviceModel);
    assert.strictEqual(mockPlatform.accessories.length, 1);
    assert.strictEqual(mockPlatform.accessories[0], mockPlatformAccessory);

    resetMocks();
});

test('PlatformAccessoryManager#registerPowerfulSwitchAccessory registers new accessory', (context) => {
    platformAccessoryManager.registerPowerfulSwitchAccessory(deviceId, deviceName, deviceModel);

    const mockedMethod = mockPlatform.api.registerPlatformAccessories.mock;
    assert.strictEqual(mockedMethod.calls.length, 1);
    assert.strictEqual(mockedMethod.calls[0].arguments[0], settings.PLUGIN_NAME);
    assert.strictEqual(mockedMethod.calls[0].arguments[1], settings.PLATFORM_NAME);
    const mockPlatformAccessory = mockedMethod.calls[0].arguments[2][0];
    assert.strictEqual(mockPlatformAccessory.name, 'Test Device Powerful Switch');
    assert.strictEqual(mockPlatformAccessory.context.airstageClient, airstageClient);
    assert.strictEqual(mockPlatformAccessory.context.deviceId, deviceId);
    assert.strictEqual(mockPlatformAccessory.context.model, deviceModel);
    assert.strictEqual(mockPlatform.accessories.length, 1);
    assert.strictEqual(mockPlatform.accessories[0], mockPlatformAccessory);

    resetMocks();
});

test('PlatformAccessoryManager#unregisterThermostatAccessory unregisters existing accessory', (context) => {
    const existingUuid = hap.uuid.generate(
        deviceId + '-thermostat'
    );
    const existingPlatformAccessory = new MockPlatformAccessory(
        'Test Device Thermostat',
        existingUuid
    );
    mockPlatform.accessories = [existingPlatformAccessory];

    platformAccessoryManager.unregisterThermostatAccessory(deviceId, deviceName);

    const mockedMethod = mockPlatform.api.unregisterPlatformAccessories.mock;
    assert.strictEqual(mockedMethod.calls.length, 1);
    assert.strictEqual(mockedMethod.calls[0].arguments[0], settings.PLUGIN_NAME);
    assert.strictEqual(mockedMethod.calls[0].arguments[1], settings.PLATFORM_NAME);
    const mockPlatformAccessory = mockedMethod.calls[0].arguments[2][0];
    assert.strictEqual(mockPlatformAccessory, existingPlatformAccessory);

    resetMocks();
});

test('PlatformAccessoryManager#unregisterFanAccessory unregisters existing accessory', (context) => {
    const existingUuid = hap.uuid.generate(
        deviceId + '-fan'
    );
    const existingPlatformAccessory = new MockPlatformAccessory(
        'Test Device Fan',
        existingUuid
    );
    mockPlatform.accessories = [existingPlatformAccessory];

    platformAccessoryManager.unregisterFanAccessory(deviceId, deviceName);

    const mockedMethod = mockPlatform.api.unregisterPlatformAccessories.mock;
    assert.strictEqual(mockedMethod.calls.length, 1);
    assert.strictEqual(mockedMethod.calls[0].arguments[0], settings.PLUGIN_NAME);
    assert.strictEqual(mockedMethod.calls[0].arguments[1], settings.PLATFORM_NAME);
    const mockPlatformAccessory = mockedMethod.calls[0].arguments[2][0];
    assert.strictEqual(mockPlatformAccessory, existingPlatformAccessory);

    resetMocks();
});

test('PlatformAccessoryManager#unregisterVerticalSlatsAccessory unregisters existing accessory', (context) => {
    const existingUuid = hap.uuid.generate(
        deviceId + '-vertical-slats'
    );
    const existingPlatformAccessory = new MockPlatformAccessory(
        'Test Device Vertical Slats',
        existingUuid
    );
    mockPlatform.accessories = [existingPlatformAccessory];

    platformAccessoryManager.unregisterVerticalSlatsAccessory(deviceId, deviceName);

    const mockedMethod = mockPlatform.api.unregisterPlatformAccessories.mock;
    assert.strictEqual(mockedMethod.calls.length, 1);
    assert.strictEqual(mockedMethod.calls[0].arguments[0], settings.PLUGIN_NAME);
    assert.strictEqual(mockedMethod.calls[0].arguments[1], settings.PLATFORM_NAME);
    const mockPlatformAccessory = mockedMethod.calls[0].arguments[2][0];
    assert.strictEqual(mockPlatformAccessory, existingPlatformAccessory);

    resetMocks();
});

test('PlatformAccessoryManager#unregisterVerticalAirflowDirectionAccessory unregisters existing accessory', (context) => {
    const existingUuid = hap.uuid.generate(
        deviceId + '-vertical-airflow-direction'
    );
    const existingPlatformAccessory = new MockPlatformAccessory(
        'Test Device Vertical Airflow Direction',
        existingUuid
    );
    mockPlatform.accessories = [existingPlatformAccessory];

    platformAccessoryManager.unregisterVerticalAirflowDirectionAccessory(deviceId, deviceName);

    const mockedMethod = mockPlatform.api.unregisterPlatformAccessories.mock;
    assert.strictEqual(mockedMethod.calls.length, 1);
    assert.strictEqual(mockedMethod.calls[0].arguments[0], settings.PLUGIN_NAME);
    assert.strictEqual(mockedMethod.calls[0].arguments[1], settings.PLATFORM_NAME);
    const mockPlatformAccessory = mockedMethod.calls[0].arguments[2][0];
    assert.strictEqual(mockPlatformAccessory, existingPlatformAccessory);

    resetMocks();
});

test('PlatformAccessoryManager#unregisterDryModeSwitchAccessory unregisters existing accessory', (context) => {
    const existingUuid = hap.uuid.generate(
        deviceId + '-dry-mode-switch'
    );
    const existingPlatformAccessory = new MockPlatformAccessory(
        'Test Device Dry Mode Switch',
        existingUuid
    );
    mockPlatform.accessories = [existingPlatformAccessory];

    platformAccessoryManager.unregisterDryModeSwitchAccessory(deviceId, deviceName);

    const mockedMethod = mockPlatform.api.unregisterPlatformAccessories.mock;
    assert.strictEqual(mockedMethod.calls.length, 1);
    assert.strictEqual(mockedMethod.calls[0].arguments[0], settings.PLUGIN_NAME);
    assert.strictEqual(mockedMethod.calls[0].arguments[1], settings.PLATFORM_NAME);
    const mockPlatformAccessory = mockedMethod.calls[0].arguments[2][0];
    assert.strictEqual(mockPlatformAccessory, existingPlatformAccessory);

    resetMocks();
});

test('PlatformAccessoryManager#unregisterEconomySwitchAccessory unregisters existing accessory', (context) => {
    const existingUuid = hap.uuid.generate(
        deviceId + '-economy-switch'
    );
    const existingPlatformAccessory = new MockPlatformAccessory(
        'Test Device Economy Switch',
        existingUuid
    );
    mockPlatform.accessories = [existingPlatformAccessory];

    platformAccessoryManager.unregisterEconomySwitchAccessory(deviceId, deviceName);

    const mockedMethod = mockPlatform.api.unregisterPlatformAccessories.mock;
    assert.strictEqual(mockedMethod.calls.length, 1);
    assert.strictEqual(mockedMethod.calls[0].arguments[0], settings.PLUGIN_NAME);
    assert.strictEqual(mockedMethod.calls[0].arguments[1], settings.PLATFORM_NAME);
    const mockPlatformAccessory = mockedMethod.calls[0].arguments[2][0];
    assert.strictEqual(mockPlatformAccessory, existingPlatformAccessory);

    resetMocks();
});

test('PlatformAccessoryManager#unregisterEnergySavingFanSwitchAccessory unregisters existing accessory', (context) => {
    const existingUuid = hap.uuid.generate(
        deviceId + '-energy-saving-fan-switch'
    );
    const existingPlatformAccessory = new MockPlatformAccessory(
        'Test Device Energy Saving Fan Switch',
        existingUuid
    );
    mockPlatform.accessories = [existingPlatformAccessory];

    platformAccessoryManager.unregisterEnergySavingFanSwitchAccessory(deviceId, deviceName);

    const mockedMethod = mockPlatform.api.unregisterPlatformAccessories.mock;
    assert.strictEqual(mockedMethod.calls.length, 1);
    assert.strictEqual(mockedMethod.calls[0].arguments[0], settings.PLUGIN_NAME);
    assert.strictEqual(mockedMethod.calls[0].arguments[1], settings.PLATFORM_NAME);
    const mockPlatformAccessory = mockedMethod.calls[0].arguments[2][0];
    assert.strictEqual(mockPlatformAccessory, existingPlatformAccessory);

    resetMocks();
});

test('PlatformAccessoryManager#unregisterFanModeSwitchAccessory unregisters existing accessory', (context) => {
    const existingUuid = hap.uuid.generate(
        deviceId + '-fan-mode-switch'
    );
    const existingPlatformAccessory = new MockPlatformAccessory(
        'Test Device Fan Mode Switch',
        existingUuid
    );
    mockPlatform.accessories = [existingPlatformAccessory];

    platformAccessoryManager.unregisterFanModeSwitchAccessory(deviceId, deviceName);

    const mockedMethod = mockPlatform.api.unregisterPlatformAccessories.mock;
    assert.strictEqual(mockedMethod.calls.length, 1);
    assert.strictEqual(mockedMethod.calls[0].arguments[0], settings.PLUGIN_NAME);
    assert.strictEqual(mockedMethod.calls[0].arguments[1], settings.PLATFORM_NAME);
    const mockPlatformAccessory = mockedMethod.calls[0].arguments[2][0];
    assert.strictEqual(mockPlatformAccessory, existingPlatformAccessory);

    resetMocks();
});

test('PlatformAccessoryManager#unregisterMinimumHeatModeSwitchAccessory unregisters existing accessory', (context) => {
    const existingUuid = hap.uuid.generate(
        deviceId + '-minimum-heat-mode-switch'
    );
    const existingPlatformAccessory = new MockPlatformAccessory(
        'Test Device Minimum Heat Mode Switch',
        existingUuid
    );
    mockPlatform.accessories = [existingPlatformAccessory];

    platformAccessoryManager.unregisterMinimumHeatModeSwitchAccessory(deviceId, deviceName);

    const mockedMethod = mockPlatform.api.unregisterPlatformAccessories.mock;
    assert.strictEqual(mockedMethod.calls.length, 1);
    assert.strictEqual(mockedMethod.calls[0].arguments[0], settings.PLUGIN_NAME);
    assert.strictEqual(mockedMethod.calls[0].arguments[1], settings.PLATFORM_NAME);
    const mockPlatformAccessory = mockedMethod.calls[0].arguments[2][0];
    assert.strictEqual(mockPlatformAccessory, existingPlatformAccessory);

    resetMocks();
});

test('PlatformAccessoryManager#unregisterPowerfulSwitchAccessory unregisters existing accessory', (context) => {
    const existingUuid = hap.uuid.generate(
        deviceId + '-powerful-switch'
    );
    const existingPlatformAccessory = new MockPlatformAccessory(
        'Test Device Powerful Switch',
        existingUuid
    );
    mockPlatform.accessories = [existingPlatformAccessory];

    platformAccessoryManager.unregisterPowerfulSwitchAccessory(deviceId, deviceName);

    const mockedMethod = mockPlatform.api.unregisterPlatformAccessories.mock;
    assert.strictEqual(mockedMethod.calls.length, 1);
    assert.strictEqual(mockedMethod.calls[0].arguments[0], settings.PLUGIN_NAME);
    assert.strictEqual(mockedMethod.calls[0].arguments[1], settings.PLATFORM_NAME);
    const mockPlatformAccessory = mockedMethod.calls[0].arguments[2][0];
    assert.strictEqual(mockPlatformAccessory, existingPlatformAccessory);

    resetMocks();
});
