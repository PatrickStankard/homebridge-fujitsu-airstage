'use strict';

const { mock } = require('node:test');
const hap = require('hap-nodejs');
const airstage = require('../airstage');
const PlatformAccessoryManager = require('../platform-accessory-manager');

const airstageClient = new airstage.Client('us', 'United States', 'en');

const mockCharacteristic = {
    'on': mock.fn((event, listener) => mockCharacteristic),
    'emit': mock.fn((event, listener) => mockCharacteristic)
};

const mockService = {
    'setCharacteristic': mock.fn((name, value) => mockService),
    'getCharacteristic': mock.fn((name, value) => mockCharacteristic)
};

class MockPlatformAccessory {
    context = {
        'deviceId': 'testDeviceId',
        'model': 'Test Model',
        'airstageClient': airstageClient
    };
    constructor(name, uuid) {
        this.name = name;
        this.uuid = uuid;
        this.UUID = uuid;
    }
    getService(name) { return mockService; }
    addService(name) { return mockService; }
}

const mockPlatform = {
    'Characteristic': hap.Characteristic,
    'Service': hap.Service,
    'airstageClient': airstageClient,
    'accessories': [],
    'api': {
        'hap': hap,
        'platformAccessory': MockPlatformAccessory,
        'user': {
            'configPath': mock.fn(() => '/test/path'),
            'persistPath': mock.fn(() => '/tmp')
        },
        'updatePlatformAccessories': mock.fn(() => {}),
        'registerPlatformAccessories': mock.fn(() => {}),
        'unregisterPlatformAccessories': mock.fn(() => {}),
        'on': mock.fn((event, listener) => mockPlatform.api)
    },
    'log': {
        'debug': mock.fn(() => {}),
        'error': mock.fn(() => {}),
        'info': mock.fn(() => {})
    }
};

mockPlatform['accessoryManager'] = new PlatformAccessoryManager(mockPlatform);

class MockHomebridge {
    characteristic = mockCharacteristic;
    service = mockService;
    platform = mockPlatform;
    resetMocks() {
        mockCharacteristic.on.mock.resetCalls();
        mockCharacteristic.emit.mock.resetCalls();
        mockService.setCharacteristic.mock.resetCalls();
        mockService.getCharacteristic.mock.resetCalls();
        mockPlatform.api.updatePlatformAccessories.mock.resetCalls();
        mockPlatform.api.registerPlatformAccessories.mock.resetCalls();
        mockPlatform.api.unregisterPlatformAccessories.mock.resetCalls();
        mockPlatform.api.on.mock.resetCalls();
        mockPlatform.log.debug.mock.resetCalls();
        mockPlatform.log.error.mock.resetCalls();
        mockPlatform.log.info.mock.resetCalls();
        mockPlatform.accessories = [];
    }
}

module.exports = MockHomebridge;
