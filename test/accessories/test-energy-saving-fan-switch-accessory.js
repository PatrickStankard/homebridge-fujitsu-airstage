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
    context.after(() => {
        assert.strictEqual(platformAccessory.context.airstageClient.getPowerState.mock.calls.length, 1);

        mockHomebridge.resetMocks();
    });

    energySavingFanSwitchAccessory.setOn(true, function(error) {
        assert.strictEqual(error, 'getPowerState error');

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
    context.after(() => {
        assert.strictEqual(platformAccessory.context.airstageClient.getPowerState.mock.calls.length, 1);
        assert.strictEqual(platformAccessory.context.airstageClient.setEnergySavingFanState.mock.calls.length, 1);

        mockHomebridge.resetMocks();
    });
    const energySavingFanSwitchAccessory = new EnergySavingFanSwitchAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    energySavingFanSwitchAccessory.setOn(true, function(error) {
        assert.strictEqual(error, 'setEnergySavingFanState error');

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
            callback(null);
        }
    );
    context.after(() => {
        assert.strictEqual(platformAccessory.context.airstageClient.getPowerState.mock.calls.length, 1);

        const mockedMethod = platformAccessory.context.airstageClient.setEnergySavingFanState;

        assert.strictEqual(mockedMethod.mock.calls.length, 1);
        assert.strictEqual(mockedMethod.mock.calls[0].arguments[0], 'testDeviceId');
        assert.strictEqual(mockedMethod.mock.calls[0].arguments[1], airstage.constants.TOGGLE_ON);

        mockHomebridge.resetMocks();
    });
    const energySavingFanSwitchAccessory = new EnergySavingFanSwitchAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    energySavingFanSwitchAccessory.setOn(true, function(error) {
        assert.strictEqual(error, null);

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
    context.after(() => {
        assert.strictEqual(platformAccessory.context.airstageClient.getPowerState.mock.calls.length, 1);
        assert.strictEqual(platformAccessory.context.airstageClient.setPowerState.mock.calls.length, 1);

        mockHomebridge.resetMocks();
    });
    const energySavingFanSwitchAccessory = new EnergySavingFanSwitchAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    energySavingFanSwitchAccessory.setOn(true, function(error) {
        assert.strictEqual(error, 'setPowerState error');

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
    context.after(() => {
        assert.strictEqual(platformAccessory.context.airstageClient.getPowerState.mock.calls.length, 1);
        assert.strictEqual(platformAccessory.context.airstageClient.setPowerState.mock.calls.length, 1);
        assert.strictEqual(platformAccessory.context.airstageClient.setEnergySavingFanState.mock.calls.length, 1);

        mockHomebridge.resetMocks();
    });
    const energySavingFanSwitchAccessory = new EnergySavingFanSwitchAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    energySavingFanSwitchAccessory.setOn(true, function(error) {
        assert.strictEqual(error, 'setEnergySavingFanState error');

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
            callback(null);
        }
    );
    context.mock.method(
        platformAccessory.context.airstageClient,
        'setEnergySavingFanState',
        (deviceId, energySavingFanState, callback) => {
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

        const mockedMethod = platformAccessory.context.airstageClient.setEnergySavingFanState;

        assert.strictEqual(mockedMethod.mock.calls.length, 1);
        assert.strictEqual(mockedMethod.mock.calls[0].arguments[0], 'testDeviceId');
        assert.strictEqual(mockedMethod.mock.calls[0].arguments[1], airstage.constants.TOGGLE_ON);

        mockHomebridge.resetMocks();
    });
    const energySavingFanSwitchAccessory = new EnergySavingFanSwitchAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    energySavingFanSwitchAccessory.setOn(true, function(error) {
        assert.strictEqual(error, null);

        done();
    });
});
