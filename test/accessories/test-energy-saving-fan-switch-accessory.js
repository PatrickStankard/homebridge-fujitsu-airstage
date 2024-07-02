'use strict';

const assert = require('node:assert');
const { mock, test } = require('node:test');
const EnergySavingFanSwitchAccessory = require('../../src/accessories/energy-saving-fan-switch-accessory');
const MockHomebridge = require('../../src/test/mock-homebridge');
const airstage = require('../../src/airstage');

const mockHomebridge = new MockHomebridge();
const platformAccessory = new mockHomebridge.platform.api.platformAccessory(
    'test-name',
    'test-uuid'
);

test('EnergySavingFanSwitchAccessory#constructor registers accessory', (context) => {
    context.mock.method(
        platformAccessory,
        'getService'
    );
    const energySavingFanSwitchAccessory = new EnergySavingFanSwitchAccessory(
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

test('EnergySavingFanSwitchAccessory#constructor configures event listeners', (context) => {
    const energySavingFanSwitchAccessory = new EnergySavingFanSwitchAccessory(
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
        energySavingFanSwitchAccessory.getOn.bind(energySavingFanSwitchAccessory).name
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[1].arguments[0],
        'set'
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[1].arguments[1].name,
        energySavingFanSwitchAccessory.setOn.bind(energySavingFanSwitchAccessory).name
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[2].arguments[0],
        'get'
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[2].arguments[1].name,
        energySavingFanSwitchAccessory.getName.bind(energySavingFanSwitchAccessory).name
    );

    mockHomebridge.resetMocks();
});

test('EnergySavingFanSwitchAccessory#getOn when getPowerState returns error', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getPowerState',
        (deviceId, callback) => {
            callback('getPowerState error', null);
        }
    );
    const energySavingFanSwitchAccessory = new EnergySavingFanSwitchAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    energySavingFanSwitchAccessory.getOn(function(error, value) {
        assert.strictEqual(error, 'getPowerState error');
        assert.strictEqual(value, null);

        mockHomebridge.resetMocks();

        done();
    });
});

test('EnergySavingFanSwitchAccessory#getOn when getPowerState returns OFF', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getPowerState',
        (deviceId, callback) => {
            callback(null, airstage.constants.TOGGLE_OFF);
        }
    );
    const energySavingFanSwitchAccessory = new EnergySavingFanSwitchAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    energySavingFanSwitchAccessory.getOn(function(error, value) {
        assert.strictEqual(error, null);
        assert.strictEqual(value, false);

        mockHomebridge.resetMocks();

        done();
    });
});

test('EnergySavingFanSwitchAccessory#getOn when getPowerState returns ON and getEnergySavingFanState returns error', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getPowerState',
        (deviceId, callback) => {
            callback(null, airstage.constants.TOGGLE_ON);
        }
    );
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getEnergySavingFanState',
        (deviceId, callback) => {
            callback('getEnergySavingFanState error', null);
        }
    );
    const energySavingFanSwitchAccessory = new EnergySavingFanSwitchAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    energySavingFanSwitchAccessory.getOn(function(error, value) {
        assert.strictEqual(error, 'getEnergySavingFanState error');
        assert.strictEqual(value, null);

        mockHomebridge.resetMocks();

        done();
    });
});

test('EnergySavingFanSwitchAccessory#getOn when getPowerState returns ON and getEnergySavingFanState returns ON', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getPowerState',
        (deviceId, callback) => {
            callback(null, airstage.constants.TOGGLE_ON);
        }
    );
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getEnergySavingFanState',
        (deviceId, callback) => {
            callback(null, airstage.constants.TOGGLE_ON);
        }
    );
    const energySavingFanSwitchAccessory = new EnergySavingFanSwitchAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    energySavingFanSwitchAccessory.getOn(function(error, value) {
        assert.strictEqual(error, null);
        assert.strictEqual(value, true);

        mockHomebridge.resetMocks();

        done();
    });
});

test('EnergySavingFanSwitchAccessory#getOn when getPowerState returns ON and getEnergySavingFanState returns OFF', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getPowerState',
        (deviceId, callback) => {
            callback(null, airstage.constants.TOGGLE_ON);
        }
    );
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getEnergySavingFanState',
        (deviceId, callback) => {
            callback(null, airstage.constants.TOGGLE_OFF);
        }
    );
    const energySavingFanSwitchAccessory = new EnergySavingFanSwitchAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    energySavingFanSwitchAccessory.getOn(function(error, value) {
        assert.strictEqual(error, null);
        assert.strictEqual(value, false);

        mockHomebridge.resetMocks();

        done();
    });
});

test('EnergySavingFanSwitchAccessory#setOn when getPowerState returns error', (context, done) => {
    const energySavingFanSwitchAccessory = new EnergySavingFanSwitchAccessory(
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

    energySavingFanSwitchAccessory.setOn(true, function(error) {
        assert.strictEqual(error, 'getPowerState error');

        mockHomebridge.resetMocks();

        done();
    });
});

test('EnergySavingFanSwitchAccessory#setOn when getPowerState returns ON and setEnergySavingFanState returns error', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getPowerState',
        (deviceId, callback) => {
            callback(null, airstage.constants.TOGGLE_ON);
        }
    );
    context.mock.method(
        platformAccessory.context.airstageClient,
        'setEnergySavingFanState',
        (deviceId, energySavingFanState, callback) => {
            callback('setEnergySavingFanState error');
        }
    );
    const energySavingFanSwitchAccessory = new EnergySavingFanSwitchAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    energySavingFanSwitchAccessory.setOn(true, function(error) {
        assert.strictEqual(error, 'setEnergySavingFanState error');

        mockHomebridge.resetMocks();

        done();
    });
});

test('EnergySavingFanSwitchAccessory#setOn when getPowerState returns ON', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getPowerState',
        (deviceId, callback) => {
            callback(null, airstage.constants.TOGGLE_ON);
        }
    );
    context.mock.method(
        platformAccessory.context.airstageClient,
        'setEnergySavingFanState',
        (deviceId, energySavingFanState, callback) => {
            assert.strictEqual(energySavingFanState, airstage.constants.TOGGLE_ON);

            callback(null);
        }
    );
    const energySavingFanSwitchAccessory = new EnergySavingFanSwitchAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    energySavingFanSwitchAccessory.setOn(true, function(error) {
        assert.strictEqual(error, null);

        mockHomebridge.resetMocks();

        done();
    });
});

test('EnergySavingFanSwitchAccessory#setOn when getPowerState returns OFF and setPowerState returns error', (context, done) => {
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
    const energySavingFanSwitchAccessory = new EnergySavingFanSwitchAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    energySavingFanSwitchAccessory.setOn(true, function(error) {
        assert.strictEqual(error, 'setPowerState error');

        mockHomebridge.resetMocks();

        done();
    });
});

test('EnergySavingFanSwitchAccessory#setOn when getPowerState returns OFF and setEnergySavingFanState returns error', (context, done) => {
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
        'setEnergySavingFanState',
        (deviceId, energySavingFanState, callback) => {
            callback('setEnergySavingFanState error');
        }
    );
    const energySavingFanSwitchAccessory = new EnergySavingFanSwitchAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    energySavingFanSwitchAccessory.setOn(true, function(error) {
        assert.strictEqual(error, 'setEnergySavingFanState error');

        mockHomebridge.resetMocks();

        done();
    });
});

test('EnergySavingFanSwitchAccessory#setOn when getPowerState returns OFF', (context, done) => {
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
        'setEnergySavingFanState',
        (deviceId, energySavingFanState, callback) => {
            assert.strictEqual(energySavingFanState, airstage.constants.TOGGLE_ON);

            callback(null);
        }
    );
    const energySavingFanSwitchAccessory = new EnergySavingFanSwitchAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    energySavingFanSwitchAccessory.setOn(true, function(error) {
        assert.strictEqual(error, null);

        mockHomebridge.resetMocks();

        done();
    });
});

test('EnergySavingFanSwitchAccessory#getName when getName returns error', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getName',
        (deviceId, callback) => {
            callback('getName error', null);
        }
    );
    const energySavingFanSwitchAccessory = new EnergySavingFanSwitchAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    energySavingFanSwitchAccessory.getName(function(error, name) {
        assert.strictEqual(error, 'getName error');
        assert.strictEqual(name, null);

        mockHomebridge.resetMocks();

        done();
    });
});

test('EnergySavingFanSwitchAccessory#getName returns name with expected suffix', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getName',
        (deviceId, callback) => {
            callback(null, 'Test Device');
        }
    );
    const energySavingFanSwitchAccessory = new EnergySavingFanSwitchAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    energySavingFanSwitchAccessory.getName(function(error, name) {
        assert.strictEqual(error, null);
        assert.strictEqual(name, 'Test Device Energy Saving Fan Switch');

        mockHomebridge.resetMocks();

        done();
    });
});
