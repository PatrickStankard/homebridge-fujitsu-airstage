'use strict';

const assert = require('node:assert');
const { mock, test } = require('node:test');
const FanModeSwitchAccessory = require('../../src/accessories/fan-mode-switch-accessory');
const MockHomebridge = require('../../src/test/mock-homebridge');
const airstage = require('../../src/airstage');

const mockHomebridge = new MockHomebridge();
const platformAccessory = new mockHomebridge.platform.api.platformAccessory(
    'test-name',
    'test-uuid'
);

test('FanModeSwitchAccessory#constructor registers accessory', (context) => {
    context.mock.method(
        platformAccessory,
        'getService'
    );
    const fanModeSwitchAccessory = new FanModeSwitchAccessory(
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

test('FanModeSwitchAccessory#constructor configures event listeners', (context) => {
    const fanModeSwitchAccessory = new FanModeSwitchAccessory(
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
        fanModeSwitchAccessory.getOn.bind(fanModeSwitchAccessory).name
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[1].arguments[0],
        'set'
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[1].arguments[1].name,
        fanModeSwitchAccessory.setOn.bind(fanModeSwitchAccessory).name
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[2].arguments[0],
        'get'
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[2].arguments[1].name,
        fanModeSwitchAccessory.getName.bind(fanModeSwitchAccessory).name
    );

    mockHomebridge.resetMocks();
});

test('FanModeSwitchAccessory#getOn when getPowerState returns error', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getPowerState',
        (deviceId, callback) => {
            callback('getPowerState error', null);
        }
    );
    const fanModeSwitchAccessory = new FanModeSwitchAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    fanModeSwitchAccessory.getOn(function(error, value) {
        assert.strictEqual(error, 'getPowerState error');
        assert.strictEqual(value, null);

        mockHomebridge.resetMocks();

        done();
    });
});

test('FanModeSwitchAccessory#getOn when getPowerState returns OFF', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getPowerState',
        (deviceId, callback) => {
            callback(null, airstage.constants.TOGGLE_OFF);
        }
    );
    const fanModeSwitchAccessory = new FanModeSwitchAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    fanModeSwitchAccessory.getOn(function(error, value) {
        assert.strictEqual(error, null);
        assert.strictEqual(value, false);

        mockHomebridge.resetMocks();

        done();
    });
});

test('FanModeSwitchAccessory#getOn when getPowerState returns ON and getOperationMode returns error', (context, done) => {
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
    const fanModeSwitchAccessory = new FanModeSwitchAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    fanModeSwitchAccessory.getOn(function(error, value) {
        assert.strictEqual(error, 'getOperationMode error');
        assert.strictEqual(value, null);

        mockHomebridge.resetMocks();

        done();
    });
});

test('FanModeSwitchAccessory#getOn when getPowerState returns ON and getOperationMode returns DRY', (context, done) => {
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
            callback(null, airstage.constants.OPERATION_MODE_DRY);
        }
    );
    const fanModeSwitchAccessory = new FanModeSwitchAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    fanModeSwitchAccessory.getOn(function(error, value) {
        assert.strictEqual(error, null);
        assert.strictEqual(value, false);

        mockHomebridge.resetMocks();

        done();
    });
});

test('FanModeSwitchAccessory#setOn when getPowerState returns error', (context, done) => {
    const fanModeSwitchAccessory = new FanModeSwitchAccessory(
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
    context.after(() => {
        assert.strictEqual(platformAccessory.context.airstageClient.getPowerState.mock.calls.length, 1);

        mockHomebridge.resetMocks();
    });

    fanModeSwitchAccessory.setOn(true, function(error) {
        assert.strictEqual(error, 'getPowerState error');

        done();
    });
});

test('FanModeSwitchAccessory#setOn when getPowerState returns ON and getOperationMode returns error', (context, done) => {
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
    context.after(() => {
        assert.strictEqual(platformAccessory.context.airstageClient.getPowerState.mock.calls.length, 1);
        assert.strictEqual(platformAccessory.context.airstageClient.getOperationMode.mock.calls.length, 1);

        mockHomebridge.resetMocks();
    });
    const fanModeSwitchAccessory = new FanModeSwitchAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    fanModeSwitchAccessory.setOn(true, function(error) {
        assert.strictEqual(error, 'getOperationMode error');

        done();
    });
});

test('FanModeSwitchAccessory#setOn when getPowerState returns ON and setOperationMode returns error', (context, done) => {
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
            callback(null, airstage.constants.OPERATION_MODE_DRY);
        }
    );
    context.mock.method(
        platformAccessory.context.airstageClient,
        'setOperationMode',
        (deviceId, operationMode, callback) => {
            callback('setOperationMode error');
        }
    );
    context.after(() => {
        assert.strictEqual(platformAccessory.context.airstageClient.getPowerState.mock.calls.length, 1);
        assert.strictEqual(platformAccessory.context.airstageClient.getOperationMode.mock.calls.length, 1);
        assert.strictEqual(platformAccessory.context.airstageClient.setOperationMode.mock.calls.length, 1);

        mockHomebridge.resetMocks();
    });
    const fanModeSwitchAccessory = new FanModeSwitchAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    fanModeSwitchAccessory.setOn(true, function(error) {
        assert.strictEqual(error, 'setOperationMode error');

        done();
    });
});

test('FanModeSwitchAccessory#setOn when getPowerState returns ON and getOperationMode returns DRY', (context, done) => {
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
            callback(null, airstage.constants.OPERATION_MODE_DRY);
        }
    );
    context.mock.method(
        platformAccessory.context.airstageClient,
        'setOperationMode',
        (deviceId, operationMode, callback) => {
            callback(null);
        }
    );
    context.after(() => {
        assert.strictEqual(platformAccessory.context.airstageClient.getPowerState.mock.calls.length, 1);
        assert.strictEqual(platformAccessory.context.airstageClient.getOperationMode.mock.calls.length, 1);

        const mockedMethod = platformAccessory.context.airstageClient.setOperationMode;

        assert.strictEqual(mockedMethod.mock.calls.length, 1);
        assert.strictEqual(mockedMethod.mock.calls[0].arguments[0], 'testDeviceId');
        assert.strictEqual(mockedMethod.mock.calls[0].arguments[1], airstage.constants.OPERATION_MODE_FAN);
        assert.strictEqual(fanModeSwitchAccessory.lastKnownOperationMode, airstage.constants.OPERATION_MODE_DRY);

        mockHomebridge.resetMocks();
    });
    const fanModeSwitchAccessory = new FanModeSwitchAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    fanModeSwitchAccessory.setOn(true, function(error) {
        assert.strictEqual(error, null);

        done();
    });
});

test('FanModeSwitchAccessory#setOn when getPowerState returns OFF and setPowerState returns error', (context, done) => {
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
    context.after(() => {
        assert.strictEqual(platformAccessory.context.airstageClient.getPowerState.mock.calls.length, 1);
        assert.strictEqual(platformAccessory.context.airstageClient.setPowerState.mock.calls.length, 1);

        mockHomebridge.resetMocks();
    });
    const fanModeSwitchAccessory = new FanModeSwitchAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    fanModeSwitchAccessory.setOn(true, function(error) {
        assert.strictEqual(error, 'setPowerState error');

        done();
    });
});

test('FanModeSwitchAccessory#setOn when getPowerState returns OFF and getOperationMode returns error', (context, done) => {
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
    context.after(() => {
        assert.strictEqual(platformAccessory.context.airstageClient.getPowerState.mock.calls.length, 1);
        assert.strictEqual(platformAccessory.context.airstageClient.setPowerState.mock.calls.length, 1);
        assert.strictEqual(platformAccessory.context.airstageClient.getOperationMode.mock.calls.length, 1);

        mockHomebridge.resetMocks();
    });
    const fanModeSwitchAccessory = new FanModeSwitchAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    fanModeSwitchAccessory.setOn(true, function(error) {
        assert.strictEqual(error, 'getOperationMode error');

        done();
    });
});

test('FanModeSwitchAccessory#setOn when getPowerState returns OFF and setOperationMode returns error', (context, done) => {
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
            callback(null, airstage.constants.OPERATION_MODE_DRY);
        }
    );
    context.mock.method(
        platformAccessory.context.airstageClient,
        'setOperationMode',
        (deviceId, operationMode, callback) => {
            callback('setOperationMode error');
        }
    );
    context.after(() => {
        assert.strictEqual(platformAccessory.context.airstageClient.getPowerState.mock.calls.length, 1);
        assert.strictEqual(platformAccessory.context.airstageClient.setPowerState.mock.calls.length, 1);
        assert.strictEqual(platformAccessory.context.airstageClient.getOperationMode.mock.calls.length, 1);
        assert.strictEqual(platformAccessory.context.airstageClient.setOperationMode.mock.calls.length, 1);

        mockHomebridge.resetMocks();
    });
    const fanModeSwitchAccessory = new FanModeSwitchAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    fanModeSwitchAccessory.setOn(true, function(error) {
        assert.strictEqual(error, 'setOperationMode error');

        done();
    });
});

test('FanModeSwitchAccessory#setOn when getPowerState returns OFF and getOperationMode returns DRY', (context, done) => {
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
            callback(null, airstage.constants.OPERATION_MODE_DRY);
        }
    );
    context.mock.method(
        platformAccessory.context.airstageClient,
        'setOperationMode',
        (deviceId, operationMode, callback) => {
            callback(null);
        }
    );
    context.after(() => {
        assert.strictEqual(platformAccessory.context.airstageClient.getPowerState.mock.calls.length, 1);
        assert.strictEqual(platformAccessory.context.airstageClient.setPowerState.mock.calls.length, 1);
        assert.strictEqual(
            platformAccessory.context.airstageClient.setPowerState.mock.calls[0].arguments[0],
            'testDeviceId'
        );
        assert.strictEqual(
            platformAccessory.context.airstageClient.setPowerState.mock.calls[0].arguments[1],
            airstage.constants.TOGGLE_ON
        );
        assert.strictEqual(platformAccessory.context.airstageClient.getOperationMode.mock.calls.length, 1);

        const mockedMethod = platformAccessory.context.airstageClient.setOperationMode;

        assert.strictEqual(mockedMethod.mock.calls.length, 1);
        assert.strictEqual(mockedMethod.mock.calls[0].arguments[0], 'testDeviceId');
        assert.strictEqual(mockedMethod.mock.calls[0].arguments[1], airstage.constants.OPERATION_MODE_FAN);
        assert.strictEqual(fanModeSwitchAccessory.lastKnownOperationMode, airstage.constants.OPERATION_MODE_DRY);

        mockHomebridge.resetMocks();
    });
    const fanModeSwitchAccessory = new FanModeSwitchAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    fanModeSwitchAccessory.setOn(true, function(error) {
        assert.strictEqual(error, null);

        done();
    });
});
