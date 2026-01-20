'use strict';

const assert = require('node:assert');
const { mock, test } = require('node:test');
const AutoFanSpeedSwitchAccessory = require('../../src/accessories/auto-fan-speed-switch-accessory');
const MockHomebridge = require('../../src/test/mock-homebridge');
const airstage = require('../../src/airstage');

const mockHomebridge = new MockHomebridge();
const platformAccessory = new mockHomebridge.platform.api.platformAccessory(
    'test-name',
    'test-uuid'
);

test('AutoFanSpeedSwitchAccessory#constructor registers accessory', (context) => {
    context.mock.method(
        platformAccessory,
        'getService'
    );
    const autoFanSpeedSwitchAccessory = new AutoFanSpeedSwitchAccessory(
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

test('AutoFanSpeedSwitchAccessory#constructor configures event listeners', (context) => {
    const autoFanSpeedSwitchAccessory = new AutoFanSpeedSwitchAccessory(
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
        autoFanSpeedSwitchAccessory.getOn.bind(autoFanSpeedSwitchAccessory).name
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[1].arguments[0],
        'set'
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[1].arguments[1].name,
        autoFanSpeedSwitchAccessory.setOn.bind(autoFanSpeedSwitchAccessory).name
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[2].arguments[0],
        'get'
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[2].arguments[1].name,
        autoFanSpeedSwitchAccessory.getName.bind(autoFanSpeedSwitchAccessory).name
    );

    mockHomebridge.resetMocks();
});

test('AutoFanSpeedSwitchAccessory#getOn when getPowerState returns error', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getPowerState',
        (deviceId, callback) => {
            callback('getPowerState error', null);
        }
    );
    const autoFanSpeedSwitchAccessory = new AutoFanSpeedSwitchAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    autoFanSpeedSwitchAccessory.getOn(function(error, value) {
        assert.strictEqual(error, 'getPowerState error');
        assert.strictEqual(value, null);

        mockHomebridge.resetMocks();

        done();
    });
});

test('AutoFanSpeedSwitchAccessory#getOn when getPowerState returns OFF', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getPowerState',
        (deviceId, callback) => {
            callback(null, airstage.constants.TOGGLE_OFF);
        }
    );
    const autoFanSpeedSwitchAccessory = new AutoFanSpeedSwitchAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    autoFanSpeedSwitchAccessory.getOn(function(error, value) {
        assert.strictEqual(error, null);
        assert.strictEqual(value, false);

        mockHomebridge.resetMocks();

        done();
    });
});

test('AutoFanSpeedSwitchAccessory#getOn when getPowerState returns ON and getFanSpeed returns error', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getPowerState',
        (deviceId, callback) => {
            callback(null, airstage.constants.TOGGLE_ON);
        }
    );
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getFanSpeed',
        (deviceId, callback) => {
            callback('getFanSpeed error', null);
        }
    );
    const autoFanSpeedSwitchAccessory = new AutoFanSpeedSwitchAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    autoFanSpeedSwitchAccessory.getOn(function(error, value) {
        assert.strictEqual(error, 'getFanSpeed error');
        assert.strictEqual(value, null);

        mockHomebridge.resetMocks();

        done();
    });
});

test('AutoFanSpeedSwitchAccessory#getOn when getPowerState returns ON and getFanSpeed returns FAN_SPEED_LOW', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getPowerState',
        (deviceId, callback) => {
            callback(null, airstage.constants.TOGGLE_ON);
        }
    );
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getFanSpeed',
        (deviceId, callback) => {
            callback(null, airstage.constants.FAN_SPEED_LOW);
        }
    );
    const autoFanSpeedSwitchAccessory = new AutoFanSpeedSwitchAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    autoFanSpeedSwitchAccessory.getOn(function(error, value) {
        assert.strictEqual(error, null);
        assert.strictEqual(value, false);

        mockHomebridge.resetMocks();

        done();
    });
});

test('AutoFanSpeedSwitchAccessory#getOn when getPowerState returns ON and getFanSpeed returns FAN_SPEED_AUTO', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getPowerState',
        (deviceId, callback) => {
            callback(null, airstage.constants.TOGGLE_ON);
        }
    );
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getFanSpeed',
        (deviceId, callback) => {
            callback(null, airstage.constants.FAN_SPEED_AUTO);
        }
    );
    const autoFanSpeedSwitchAccessory = new AutoFanSpeedSwitchAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    autoFanSpeedSwitchAccessory.getOn(function(error, value) {
        assert.strictEqual(error, null);
        assert.strictEqual(value, true);

        mockHomebridge.resetMocks();

        done();
    });
});

test('AutoFanSpeedSwitchAccessory#setOn when getPowerState returns error', (context, done) => {
    const autoFanSpeedSwitchAccessory = new AutoFanSpeedSwitchAccessory(
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

    autoFanSpeedSwitchAccessory.setOn(true, function(error) {
        assert.strictEqual(error, 'getPowerState error');

        mockHomebridge.resetMocks();

        done();
    });
});

test('AutoFanSpeedSwitchAccessory#setOn when getPowerState returns ON and getFanSpeed returns error', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getPowerState',
        (deviceId, callback) => {
            callback(null, airstage.constants.TOGGLE_ON);
        }
    );
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getFanSpeed',
        (deviceId, callback) => {
            callback('getFanSpeed error', null);
        }
    );
    const autoFanSpeedSwitchAccessory = new AutoFanSpeedSwitchAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    autoFanSpeedSwitchAccessory.setOn(true, function(error) {
        assert.strictEqual(error, 'getFanSpeed error');

        done();
    });
});

test('AutoFanSpeedSwitchAccessory#setOn when getPowerState returns ON and setFanSpeed returns error', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getPowerState',
        (deviceId, callback) => {
            callback(null, airstage.constants.TOGGLE_ON);
        }
    );
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getFanSpeed',
        (deviceId, callback) => {
            callback(null, airstage.constants.FAN_SPEED_LOW);
        }
    );
    context.mock.method(
        platformAccessory.context.airstageClient,
        'setFanSpeed',
        (deviceId, fanSpeed, callback) => {
            callback('setFanSpeed error');
        }
    );
    const autoFanSpeedSwitchAccessory = new AutoFanSpeedSwitchAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    autoFanSpeedSwitchAccessory.setOn(true, function(error) {
        assert.strictEqual(error, 'setFanSpeed error');

        done();
    });
});

test('AutoFanSpeedSwitchAccessory#setOn when getPowerState returns ON and getFanSpeed returns FAN_SPEED_LOW', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getPowerState',
        (deviceId, callback) => {
            callback(null, airstage.constants.TOGGLE_ON);
        }
    );
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getFanSpeed',
        (deviceId, callback) => {
            callback(null, airstage.constants.FAN_SPEED_LOW);
        }
    );
    context.mock.method(
        platformAccessory.context.airstageClient,
        'setFanSpeed',
        (deviceId, fanSpeed, callback) => {
            assert.strictEqual(fanSpeed, airstage.constants.FAN_SPEED_AUTO);

            callback(null);
        }
    );
    const autoFanSpeedSwitchAccessory = new AutoFanSpeedSwitchAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    autoFanSpeedSwitchAccessory.setOn(true, function(error) {
        assert.strictEqual(error, null);
        assert.strictEqual(autoFanSpeedSwitchAccessory.lastKnownFanSpeed, airstage.constants.FAN_SPEED_LOW);

        mockHomebridge.resetMocks();

        done();
    });
});

test('AutoFanSpeedSwitchAccessory#setOn when getPowerState returns OFF and setPowerState returns error', (context, done) => {
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
    const autoFanSpeedSwitchAccessory = new AutoFanSpeedSwitchAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    autoFanSpeedSwitchAccessory.setOn(true, function(error) {
        assert.strictEqual(error, 'setPowerState error');

        mockHomebridge.resetMocks();

        done();
    });
});

test('AutoFanSpeedSwitchAccessory#setOn when getPowerState returns OFF and getFanSpeed returns error', (context, done) => {
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
        'getFanSpeed',
        (deviceId, callback) => {
            callback('getFanSpeed error');
        }
    );
    const autoFanSpeedSwitchAccessory = new AutoFanSpeedSwitchAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    autoFanSpeedSwitchAccessory.setOn(true, function(error) {
        assert.strictEqual(error, 'getFanSpeed error');

        mockHomebridge.resetMocks();

        done();
    });
});

test('AutoFanSpeedSwitchAccessory#setOn when getPowerState returns OFF and setFanSpeed returns error', (context, done) => {
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
        'getFanSpeed',
        (deviceId, callback) => {
            callback(null, airstage.constants.FAN_SPEED_LOW);
        }
    );
    context.mock.method(
        platformAccessory.context.airstageClient,
        'setFanSpeed',
        (deviceId, fanSpeed, callback) => {
            callback('setFanSpeed error');
        }
    );
    const autoFanSpeedSwitchAccessory = new AutoFanSpeedSwitchAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    autoFanSpeedSwitchAccessory.setOn(true, function(error) {
        assert.strictEqual(error, 'setFanSpeed error');

        mockHomebridge.resetMocks();

        done();
    });
});

test('AutoFanSpeedSwitchAccessory#setOn when getPowerState returns OFF and getFanSpeed returns FAN_SPEED_LOW', (context, done) => {
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
        'getFanSpeed',
        (deviceId, callback) => {
            callback(null, airstage.constants.FAN_SPEED_LOW);
        }
    );
    context.mock.method(
        platformAccessory.context.airstageClient,
        'setFanSpeed',
        (deviceId, fanSpeed, callback) => {
            assert.strictEqual(fanSpeed, airstage.constants.FAN_SPEED_AUTO);

            callback(null);
        }
    );
    const autoFanSpeedSwitchAccessory = new AutoFanSpeedSwitchAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    autoFanSpeedSwitchAccessory.setOn(true, function(error) {
        assert.strictEqual(error, null);
        assert.strictEqual(autoFanSpeedSwitchAccessory.lastKnownFanSpeed, airstage.constants.FAN_SPEED_LOW);

        mockHomebridge.resetMocks();

        done();
    });
});

test('AutoFanSpeedSwitchAccessory#getName when getName returns error', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getName',
        (deviceId, callback) => {
            callback('getName error', null);
        }
    );
    const autoFanSpeedSwitchAccessory = new AutoFanSpeedSwitchAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    autoFanSpeedSwitchAccessory.getName(function(error, name) {
        assert.strictEqual(error, 'getName error');
        assert.strictEqual(name, null);

        mockHomebridge.resetMocks();

        done();
    });
});

test('AutoFanSpeedSwitchAccessory#getName returns name with expected suffix', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getName',
        (deviceId, callback) => {
            callback(null, 'Test Device');
        }
    );
    const autoFanSpeedSwitchAccessory = new AutoFanSpeedSwitchAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    autoFanSpeedSwitchAccessory.getName(function(error, name) {
        assert.strictEqual(error, null);
        assert.strictEqual(name, 'Test Device Auto Fan Speed Switch');

        mockHomebridge.resetMocks();

        done();
    });
});
