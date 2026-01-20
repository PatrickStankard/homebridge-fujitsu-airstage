'use strict';

const { mock } = require('node:test');
const hap = require('hap-nodejs');
const PlatformAccessoryManager = require('../platform-accessory-manager');
const airstage = require('../airstage');

const airstageClient = new airstage.Client(
    'us',
    'United States',
    'en'
);

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

    getService(name) {
        return mockService;
    }

    addService(name) {
        return mockService;
    }
}

const mockCharacteristic = {
    'on': mock.fn((event, listener) => {
        return mockCharacteristic;
    }),
    'emit': mock.fn((event, listener) => {
        return mockCharacteristic;
    }),
    'setProps': mock.fn((props) => {
        return mockCharacteristic;
    }),
    'updateValue': mock.fn((value) => {
        return mockCharacteristic;
    })
};

const mockService = {
    'setCharacteristic': mock.fn((name, value) => {
        return mockService;
    }),
    'getCharacteristic': mock.fn((name, value) => {
        return mockCharacteristic;
    })
};

const mockPlatform = {
    'Characteristic': hap.Characteristic,
    'Service': hap.Service,
    'airstageClient': airstageClient,
    'accessories': [],
    'api': {
        'hap': hap,
        'platformAccessory': MockPlatformAccessory,
        'user': {
            'configPath': mock.fn(() => {
                return '/test/path';
            }),
            'persistPath': mock.fn(() => {
                return '/test/path';
            })
        },
        'updatePlatformAccessories': mock.fn(
            (accessories) => {}
        ),
        'registerPlatformAccessories': mock.fn(
            (pluginName, platformName, accessories) => {}
        ),
        'unregisterPlatformAccessories': mock.fn(
            (pluginName, platformName, accessories) => {}
        ),
        'on': mock.fn((event, listener) => {
            return mockPlatform.api;
        })
    },
    'log': {
        'debug': mock.fn(() => {}),
        'error': mock.fn(() => {}),
        'info': mock.fn(() => {}),
        'warn': mock.fn(() => {}),
        'success': mock.fn(() => {})
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
        mockCharacteristic.setProps.mock.resetCalls();
        mockCharacteristic.updateValue.mock.resetCalls();
        mockService.setCharacteristic.mock.resetCalls();
        mockService.getCharacteristic.mock.resetCalls();
        mockPlatform.api.updatePlatformAccessories.mock.resetCalls();
        mockPlatform.api.registerPlatformAccessories.mock.resetCalls();
        mockPlatform.api.unregisterPlatformAccessories.mock.resetCalls();
        mockPlatform.api.on.mock.resetCalls();
        mockPlatform.log.debug.mock.resetCalls();
        mockPlatform.log.error.mock.resetCalls();
        mockPlatform.log.info.mock.resetCalls();
        mockPlatform.log.warn.mock.resetCalls();
        mockPlatform.log.success.mock.resetCalls();
        mockPlatform.accessories = [];
    }
}

module.exports = MockHomebridge;
