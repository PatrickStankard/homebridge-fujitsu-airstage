'use strict';

const assert = require('node:assert');
const { mock, test } = require('node:test');
const MinimumHeatModeSwitchAccessory = require('../../src/accessories/minimum-heat-mode-switch-accessory');
const MockHomebridge = require('../../src/test/mock-homebridge');
const airstage = require('../../src/airstage');

const mockHomebridge = new MockHomebridge();
const platformAccessory = new mockHomebridge.platform.api.platformAccessory(
    'test-name',
    'test-uuid'
);

test('MinimumHeatModeSwitchAccessory#constructor registers accessory', (context) => {
    context.mock.method(
        platformAccessory,
        'getService'
    );
    const minimumHeatModeSwitchAccessory = new MinimumHeatModeSwitchAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    assert.strictEqual(platformAccessory.getService.mock.calls.length, 2);
    assert.strictEqual(
        platformAccessory.getService.mock.calls[0].arguments[0],
        mockHomebridge.platform.Service.AccessoryInformation
    );
    assert.strictEqual(
        platformAccessory.getService.mock.calls[1].arguments[0],
        mockHomebridge.platform.Service.Switch
    );

    mockHomebridge.resetMocks();
});

test('MinimumHeatModeSwitchAccessory#constructor configures event listeners', (context) => {
    const minimumHeatModeSwitchAccessory = new MinimumHeatModeSwitchAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    assert.strictEqual(mockHomebridge.service.getCharacteristic.mock.calls.length, 2);
    assert.strictEqual(
        mockHomebridge.service.getCharacteristic.mock.calls[0].arguments[0],
        mockHomebridge.platform.Characteristic.On
    );
    assert.strictEqual(
        mockHomebridge.service.getCharacteristic.mock.calls[1].arguments[0],
        mockHomebridge.platform.Characteristic.Name
    );
    assert.strictEqual(mockHomebridge.characteristic.on.mock.calls.length, 3);
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[0].arguments[0],
        'get'
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[0].arguments[1].name,
        minimumHeatModeSwitchAccessory.getOn.bind(minimumHeatModeSwitchAccessory).name
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[1].arguments[0],
        'set'
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[1].arguments[1].name,
        minimumHeatModeSwitchAccessory.setOn.bind(minimumHeatModeSwitchAccessory).name
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[2].arguments[0],
        'get'
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[2].arguments[1].name,
        minimumHeatModeSwitchAccessory.getName.bind(minimumHeatModeSwitchAccessory).name
    );

    mockHomebridge.resetMocks();
});

test('MinimumHeatModeSwitchAccessory#getOn when getPowerState returns error', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getPowerState',
        (deviceId, callback) => {
            callback('getPowerState error', null);
        }
    );
    const minimumHeatModeSwitchAccessory = new MinimumHeatModeSwitchAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    minimumHeatModeSwitchAccessory.getOn(function(error, value) {
        assert.strictEqual(error, 'getPowerState error');
        assert.strictEqual(value, null);

        mockHomebridge.resetMocks();

        done();
    });
});

test('MinimumHeatModeSwitchAccessory#getOn when getPowerState returns OFF', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getPowerState',
        (deviceId, callback) => {
            callback(null, airstage.constants.TOGGLE_OFF);
        }
    );
    const minimumHeatModeSwitchAccessory = new MinimumHeatModeSwitchAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    minimumHeatModeSwitchAccessory.getOn(function(error, value) {
        assert.strictEqual(error, null);
        assert.strictEqual(value, false);

        mockHomebridge.resetMocks();

        done();
    });
});

test('MinimumHeatModeSwitchAccessory#getOn when getPowerState returns ON and getMinimumHeatState returns error', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getPowerState',
        (deviceId, callback) => {
            callback(null, airstage.constants.TOGGLE_ON);
        }
    );
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getMinimumHeatState',
        (deviceId, callback) => {
            callback('getMinimumHeatState error', null);
        }
    );
    const minimumHeatModeSwitchAccessory = new MinimumHeatModeSwitchAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    minimumHeatModeSwitchAccessory.getOn(function(error, value) {
        assert.strictEqual(error, 'getMinimumHeatState error');
        assert.strictEqual(value, null);

        mockHomebridge.resetMocks();

        done();
    });
});

test('MinimumHeatModeSwitchAccessory#getOn when getPowerState returns ON and getMinimumHeatState returns OFF', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getPowerState',
        (deviceId, callback) => {
            callback(null, airstage.constants.TOGGLE_ON);
        }
    );
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getMinimumHeatState',
        (deviceId, callback) => {
            callback(null, airstage.constants.TOGGLE_OFF);
        }
    );
    const minimumHeatModeSwitchAccessory = new MinimumHeatModeSwitchAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    minimumHeatModeSwitchAccessory.getOn(function(error, value) {
        assert.strictEqual(error, null);
        assert.strictEqual(value, false);

        mockHomebridge.resetMocks();

        done();
    });
});

test('MinimumHeatModeSwitchAccessory#getOn when getPowerState returns ON and getMinimumHeatState returns ON', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getPowerState',
        (deviceId, callback) => {
            callback(null, airstage.constants.TOGGLE_ON);
        }
    );
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getMinimumHeatState',
        (deviceId, callback) => {
            callback(null, airstage.constants.TOGGLE_ON);
        }
    );
    const minimumHeatModeSwitchAccessory = new MinimumHeatModeSwitchAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    minimumHeatModeSwitchAccessory.getOn(function(error, value) {
        assert.strictEqual(error, null);
        assert.strictEqual(value, true);

        mockHomebridge.resetMocks();

        done();
    });
});

test('MinimumHeatModeSwitchAccessory#setOn when getPowerState returns error', (context, done) => {
    const minimumHeatModeSwitchAccessory = new MinimumHeatModeSwitchAccessory(
        mockHomebridge.platform,
        platformAccessory
    );
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getPowerState',
        (deviceId, callback) => {
            callback('getPowerState error', null);
        }
    );

    minimumHeatModeSwitchAccessory.setOn(true, function(error) {
        assert.strictEqual(error, 'getPowerState error');

        mockHomebridge.resetMocks();

        done();
    });
});

test('MinimumHeatModeSwitchAccessory#setOn when getPowerState returns ON and getTargetTemperature returns error', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getPowerState',
        (deviceId, callback) => {
            callback(null, airstage.constants.TOGGLE_ON);
        }
    );
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getOperationMode',
        (deviceId, callback) => {
            callback(null, airstage.constants.OPERATION_MODE_AUTO);
        }
    );
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getTargetTemperature',
        (deviceId, temperatureScale, callback) => {
            callback('getTargetTemperature error', null);
        }
    );
    const minimumHeatModeSwitchAccessory = new MinimumHeatModeSwitchAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    minimumHeatModeSwitchAccessory.setOn(true, function(error) {
        assert.strictEqual(error, 'getTargetTemperature error');

        done();
    });
});

test('MinimumHeatModeSwitchAccessory#setOn when getPowerState returns ON and setMinimumHeatState returns error', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getPowerState',
        (deviceId, callback) => {
            callback(null, airstage.constants.TOGGLE_ON);
        }
    );
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getOperationMode',
        (deviceId, callback) => {
            callback(null, airstage.constants.OPERATION_MODE_AUTO);
        }
    );
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getTargetTemperature',
        (deviceId, temperatureScale, callback) => {
            callback(null, 10);
        }
    );
    context.mock.method(
        platformAccessory.context.airstageClient,
        'setMinimumHeatState',
        (deviceId, value, callback) => {
            callback('setMinimumHeatState error', null);
        }
    );
    const minimumHeatModeSwitchAccessory = new MinimumHeatModeSwitchAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    minimumHeatModeSwitchAccessory.setOn(true, function(error) {
        assert.strictEqual(error, 'setMinimumHeatState error');

        done();
    });
});

test('MinimumHeatModeSwitchAccessory#setOn when getPowerState returns OFF and called with true', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getPowerState',
        (deviceId, callback) => {
            callback(null, airstage.constants.TOGGLE_OFF);
        }
    );
    context.mock.method(
        platformAccessory.context.airstageClient,
        'setPowerState',
        (deviceId, value, callback) => {
            assert.strictEqual(value, airstage.constants.TOGGLE_ON);

            callback(null);
        }
    );
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getOperationMode',
        (deviceId, callback) => {
            callback(null, airstage.constants.OPERATION_MODE_AUTO);
        }
    );
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getTargetTemperature',
        (deviceId, temperatureScale, callback) => {
            callback(null, 10);
        }
    );
    context.mock.method(
        platformAccessory.context.airstageClient,
        'setMinimumHeatState',
        (deviceId, value, callback) => {
            assert.strictEqual(value, airstage.constants.TOGGLE_ON);

            callback(null);
        }
    );
    const minimumHeatModeSwitchAccessory = new MinimumHeatModeSwitchAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    minimumHeatModeSwitchAccessory.setOn(true, function(error) {
        assert.strictEqual(error, null);
        assert.strictEqual(
            minimumHeatModeSwitchAccessory.lastKnownOperationMode,
            airstage.constants.OPERATION_MODE_AUTO
        );
        assert.strictEqual(
            minimumHeatModeSwitchAccessory.lastKnownTargetTemperature,
            10
        );

        done();
    });
});

test('MinimumHeatModeSwitchAccessory#setOn when getPowerState returns ON and called with true', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getPowerState',
        (deviceId, callback) => {
            callback(null, airstage.constants.TOGGLE_ON);
        }
    );
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getOperationMode',
        (deviceId, callback) => {
            callback(null, airstage.constants.OPERATION_MODE_AUTO);
        }
    );
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getTargetTemperature',
        (deviceId, temperatureScale, callback) => {
            callback(null, 10);
        }
    );
    context.mock.method(
        platformAccessory.context.airstageClient,
        'setMinimumHeatState',
        (deviceId, value, callback) => {
            assert.strictEqual(value, airstage.constants.TOGGLE_ON);

            callback(null);
        }
    );
    const minimumHeatModeSwitchAccessory = new MinimumHeatModeSwitchAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    minimumHeatModeSwitchAccessory.setOn(true, function(error) {
        assert.strictEqual(error, null);
        assert.strictEqual(
            minimumHeatModeSwitchAccessory.lastKnownOperationMode,
            airstage.constants.OPERATION_MODE_AUTO
        );
        assert.strictEqual(
            minimumHeatModeSwitchAccessory.lastKnownTargetTemperature,
            10
        );

        done();
    });
});

test('MinimumHeatModeSwitchAccessory#setOn when getPowerState returns ON and called with false', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getPowerState',
        (deviceId, callback) => {
            callback(null, airstage.constants.TOGGLE_ON);
        }
    );
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getOperationMode',
        (deviceId, callback) => {
            callback(null, airstage.constants.OPERATION_MODE_AUTO);
        }
    );
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getTargetTemperature',
        (deviceId, temperatureScale, callback) => {
            callback(null, 10);
        }
    );
    context.mock.method(
        platformAccessory.context.airstageClient,
        'setMinimumHeatState',
        (deviceId, value, callback) => {
            assert.strictEqual(value, airstage.constants.TOGGLE_OFF);

            callback(null);
        }
    );
    const minimumHeatModeSwitchAccessory = new MinimumHeatModeSwitchAccessory(
        mockHomebridge.platform,
        platformAccessory
    );
    minimumHeatModeSwitchAccessory.lastKnownOperationMode = airstage.constants.OPERATION_MODE_AUTO;
    minimumHeatModeSwitchAccessory.lastKnownTargetTemperature = 10;

    minimumHeatModeSwitchAccessory.setOn(false, function(error) {
        assert.strictEqual(error, null);
        assert.strictEqual(
            minimumHeatModeSwitchAccessory.lastKnownOperationMode,
            null
        );
        assert.strictEqual(
            minimumHeatModeSwitchAccessory.lastKnownTargetTemperature,
            null
        );

        done();
    });
});

test('MinimumHeatModeSwitchAccessory#getName when getName returns error', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getName',
        (deviceId, callback) => {
            callback('getName error', null);
        }
    );
    const minimumHeatModeSwitchAccessory = new MinimumHeatModeSwitchAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    minimumHeatModeSwitchAccessory.getName(function(error, name) {
        assert.strictEqual(error, 'getName error');
        assert.strictEqual(name, null);

        mockHomebridge.resetMocks();

        done();
    });
});

test('MinimumHeatModeSwitchAccessory#getName returns name with expected suffix', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getName',
        (deviceId, callback) => {
            callback(null, 'Test Device');
        }
    );
    const minimumHeatModeSwitchAccessory = new MinimumHeatModeSwitchAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    minimumHeatModeSwitchAccessory.getName(function(error, name) {
        assert.strictEqual(error, null);
        assert.strictEqual(name, 'Test Device Minimum Heat Mode Switch');

        mockHomebridge.resetMocks();

        done();
    });
});
