'use strict';

const assert = require('node:assert');
const { mock, test } = require('node:test');
const DryModeSwitchAccessory = require('../../src/accessories/dry-mode-switch-accessory');
const MockHomebridge = require('../../src/test/mock-homebridge');
const airstage = require('../../src/airstage');

const mockHomebridge = new MockHomebridge();
const platformAccessory = new mockHomebridge.platform.api.platformAccessory(
    'test-name',
    'test-uuid'
);

test('DryModeSwitchAccessory#constructor registers accessory', (context) => {
    context.mock.method(
        platformAccessory,
        'getService'
    );
    const dryModeSwitchAccessory = new DryModeSwitchAccessory(
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

test('DryModeSwitchAccessory#constructor configures event listeners', (context) => {
    const dryModeSwitchAccessory = new DryModeSwitchAccessory(
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
        dryModeSwitchAccessory.getOn.bind(dryModeSwitchAccessory).name
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[1].arguments[0],
        'set'
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[1].arguments[1].name,
        dryModeSwitchAccessory.setOn.bind(dryModeSwitchAccessory).name
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[2].arguments[0],
        'get'
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[2].arguments[1].name,
        dryModeSwitchAccessory.getName.bind(dryModeSwitchAccessory).name
    );

    mockHomebridge.resetMocks();
});

test('DryModeSwitchAccessory#getOn when getPowerState returns error', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getPowerState',
        (deviceId, callback) => {
            callback('getPowerState error', null);
        }
    );
    const dryModeSwitchAccessory = new DryModeSwitchAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    dryModeSwitchAccessory.getOn(function(error, value) {
        assert.strictEqual(error, 'getPowerState error');
        assert.strictEqual(value, null);

        mockHomebridge.resetMocks();

        done();
    });
});

test('DryModeSwitchAccessory#getOn when getPowerState returns OFF', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getPowerState',
        (deviceId, callback) => {
            callback(null, airstage.constants.TOGGLE_OFF);
        }
    );
    const dryModeSwitchAccessory = new DryModeSwitchAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    dryModeSwitchAccessory.getOn(function(error, value) {
        assert.strictEqual(error, null);
        assert.strictEqual(value, false);

        mockHomebridge.resetMocks();

        done();
    });
});

test('DryModeSwitchAccessory#getOn when getPowerState returns ON and getOperationMode returns error', (context, done) => {
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
            callback('getOperationMode error', null);
        }
    );
    const dryModeSwitchAccessory = new DryModeSwitchAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    dryModeSwitchAccessory.getOn(function(error, value) {
        assert.strictEqual(error, 'getOperationMode error');
        assert.strictEqual(value, null);

        mockHomebridge.resetMocks();

        done();
    });
});

test('DryModeSwitchAccessory#getOn when getPowerState returns ON and getOperationMode returns FAN', (context, done) => {
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
            callback(null, airstage.constants.OPERATION_MODE_FAN);
        }
    );
    const dryModeSwitchAccessory = new DryModeSwitchAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    dryModeSwitchAccessory.getOn(function(error, value) {
        assert.strictEqual(error, null);
        assert.strictEqual(value, false);

        mockHomebridge.resetMocks();

        done();
    });
});

test('DryModeSwitchAccessory#setOn when getPowerState returns error', (context, done) => {
    const dryModeSwitchAccessory = new DryModeSwitchAccessory(
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

    dryModeSwitchAccessory.setOn(true, function(error) {
        assert.strictEqual(error, 'getPowerState error');

        mockHomebridge.resetMocks();

        done();
    });
});

test('DryModeSwitchAccessory#setOn when getPowerState returns ON and getOperationMode returns error', (context, done) => {
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
            callback('getOperationMode error', null);
        }
    );
    const dryModeSwitchAccessory = new DryModeSwitchAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    dryModeSwitchAccessory.setOn(true, function(error) {
        assert.strictEqual(error, 'getOperationMode error');

        done();
    });
});

test('DryModeSwitchAccessory#setOn when getPowerState returns ON and setOperationMode returns error', (context, done) => {
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
            callback(null, airstage.constants.OPERATION_MODE_FAN);
        }
    );
    context.mock.method(
        platformAccessory.context.airstageClient,
        'setOperationMode',
        (deviceId, operationMode, callback) => {
            callback('setOperationMode error');
        }
    );
    const dryModeSwitchAccessory = new DryModeSwitchAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    dryModeSwitchAccessory.setOn(true, function(error) {
        assert.strictEqual(error, 'setOperationMode error');

        done();
    });
});

test('DryModeSwitchAccessory#setOn when getPowerState returns ON and getOperationMode returns FAN', (context, done) => {
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
            callback(null, airstage.constants.OPERATION_MODE_FAN);
        }
    );
    context.mock.method(
        platformAccessory.context.airstageClient,
        'setOperationMode',
        (deviceId, operationMode, callback) => {
            assert.strictEqual(operationMode, airstage.constants.OPERATION_MODE_DRY);

            callback(null);
        }
    );
    const dryModeSwitchAccessory = new DryModeSwitchAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    dryModeSwitchAccessory.setOn(true, function(error) {
        assert.strictEqual(error, null);
        assert.strictEqual(dryModeSwitchAccessory.lastKnownOperationMode, airstage.constants.OPERATION_MODE_FAN);

        mockHomebridge.resetMocks();

        done();
    });
});

test('DryModeSwitchAccessory#setOn when getPowerState returns OFF and setPowerState returns error', (context, done) => {
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
        (deviceId, powerState, callback) => {
            callback('setPowerState error');
        }
    );
    const dryModeSwitchAccessory = new DryModeSwitchAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    dryModeSwitchAccessory.setOn(true, function(error) {
        assert.strictEqual(error, 'setPowerState error');

        mockHomebridge.resetMocks();

        done();
    });
});

test('DryModeSwitchAccessory#setOn when getPowerState returns OFF and getOperationMode returns error', (context, done) => {
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
        (deviceId, powerState, callback) => {
            callback(null);
        }
    );
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getOperationMode',
        (deviceId, callback) => {
            callback('getOperationMode error');
        }
    );
    const dryModeSwitchAccessory = new DryModeSwitchAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    dryModeSwitchAccessory.setOn(true, function(error) {
        assert.strictEqual(error, 'getOperationMode error');

        mockHomebridge.resetMocks();

        done();
    });
});

test('DryModeSwitchAccessory#setOn when getPowerState returns OFF and setOperationMode returns error', (context, done) => {
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
        (deviceId, powerState, callback) => {
            callback(null);
        }
    );
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getOperationMode',
        (deviceId, callback) => {
            callback(null, airstage.constants.OPERATION_MODE_FAN);
        }
    );
    context.mock.method(
        platformAccessory.context.airstageClient,
        'setOperationMode',
        (deviceId, operationMode, callback) => {
            callback('setOperationMode error');
        }
    );
    const dryModeSwitchAccessory = new DryModeSwitchAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    dryModeSwitchAccessory.setOn(true, function(error) {
        assert.strictEqual(error, 'setOperationMode error');

        mockHomebridge.resetMocks();

        done();
    });
});

test('DryModeSwitchAccessory#setOn when getPowerState returns OFF and getOperationMode returns FAN', (context, done) => {
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
        (deviceId, powerState, callback) => {
            assert.strictEqual(powerState, airstage.constants.TOGGLE_ON);

            callback(null);
        }
    );
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getOperationMode',
        (deviceId, callback) => {
            callback(null, airstage.constants.OPERATION_MODE_FAN);
        }
    );
    context.mock.method(
        platformAccessory.context.airstageClient,
        'setOperationMode',
        (deviceId, operationMode, callback) => {
            assert.strictEqual(operationMode, airstage.constants.OPERATION_MODE_DRY);

            callback(null);
        }
    );
    const dryModeSwitchAccessory = new DryModeSwitchAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    dryModeSwitchAccessory.setOn(true, function(error) {
        assert.strictEqual(error, null);
        assert.strictEqual(dryModeSwitchAccessory.lastKnownOperationMode, airstage.constants.OPERATION_MODE_FAN);

        mockHomebridge.resetMocks();

        done();
    });
});
