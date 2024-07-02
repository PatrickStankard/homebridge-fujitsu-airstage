'use strict';

const assert = require('node:assert');
const { mock, test } = require('node:test');
const EconomySwitchAccessory = require('../../src/accessories/economy-switch-accessory');
const MockHomebridge = require('../../src/test/mock-homebridge');
const airstage = require('../../src/airstage');

const mockHomebridge = new MockHomebridge();
const platformAccessory = new mockHomebridge.platform.api.platformAccessory(
    'test-name',
    'test-uuid'
);

test('EconomySwitchAccessory#constructor registers accessory', (context) => {
    context.mock.method(
        platformAccessory,
        'getService'
    );
    const economySwitchAccessory = new EconomySwitchAccessory(
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

test('EconomySwitchAccessory#constructor configures event listeners', (context) => {
    const economySwitchAccessory = new EconomySwitchAccessory(
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
        economySwitchAccessory.getOn.bind(economySwitchAccessory).name
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[1].arguments[0],
        'set'
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[1].arguments[1].name,
        economySwitchAccessory.setOn.bind(economySwitchAccessory).name
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[2].arguments[0],
        'get'
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[2].arguments[1].name,
        economySwitchAccessory.getName.bind(economySwitchAccessory).name
    );

    mockHomebridge.resetMocks();
});

test('EconomySwitchAccessory#getOn when getPowerState returns error', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getPowerState',
        (deviceId, callback) => {
            callback('getPowerState error', null);
        }
    );
    const economySwitchAccessory = new EconomySwitchAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    economySwitchAccessory.getOn(function(error, value) {
        assert.strictEqual(error, 'getPowerState error');
        assert.strictEqual(value, null);

        mockHomebridge.resetMocks();

        done();
    });
});

test('EconomySwitchAccessory#getOn when getPowerState returns OFF', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getPowerState',
        (deviceId, callback) => {
            callback(null, airstage.constants.TOGGLE_OFF);
        }
    );
    const economySwitchAccessory = new EconomySwitchAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    economySwitchAccessory.getOn(function(error, value) {
        assert.strictEqual(error, null);
        assert.strictEqual(value, false);

        mockHomebridge.resetMocks();

        done();
    });
});

test('EconomySwitchAccessory#getOn when getPowerState returns ON and getEconomyState returns error', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getPowerState',
        (deviceId, callback) => {
            callback(null, airstage.constants.TOGGLE_ON);
        }
    );
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getEconomyState',
        (deviceId, callback) => {
            callback('getEconomyState error', null);
        }
    );
    const economySwitchAccessory = new EconomySwitchAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    economySwitchAccessory.getOn(function(error, value) {
        assert.strictEqual(error, 'getEconomyState error');
        assert.strictEqual(value, null);

        mockHomebridge.resetMocks();

        done();
    });
});

test('EconomySwitchAccessory#getOn when getPowerState returns ON and getEconomyState returns ON', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getPowerState',
        (deviceId, callback) => {
            callback(null, airstage.constants.TOGGLE_ON);
        }
    );
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getEconomyState',
        (deviceId, callback) => {
            callback(null, airstage.constants.TOGGLE_ON);
        }
    );
    const economySwitchAccessory = new EconomySwitchAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    economySwitchAccessory.getOn(function(error, value) {
        assert.strictEqual(error, null);
        assert.strictEqual(value, true);

        mockHomebridge.resetMocks();

        done();
    });
});

test('EconomySwitchAccessory#getOn when getPowerState returns ON and getEconomyState returns OFF', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getPowerState',
        (deviceId, callback) => {
            callback(null, airstage.constants.TOGGLE_ON);
        }
    );
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getEconomyState',
        (deviceId, callback) => {
            callback(null, airstage.constants.TOGGLE_OFF);
        }
    );
    const economySwitchAccessory = new EconomySwitchAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    economySwitchAccessory.getOn(function(error, value) {
        assert.strictEqual(error, null);
        assert.strictEqual(value, false);

        mockHomebridge.resetMocks();

        done();
    });
});

test('EconomySwitchAccessory#setOn when getPowerState returns error', (context, done) => {
    const economySwitchAccessory = new EconomySwitchAccessory(
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

    economySwitchAccessory.setOn(true, function(error) {
        assert.strictEqual(error, 'getPowerState error');

        mockHomebridge.resetMocks();

        done();
    });
});

test('EconomySwitchAccessory#setOn when getPowerState returns ON and setEconomyState returns error', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getPowerState',
        (deviceId, callback) => {
            callback(null, airstage.constants.TOGGLE_ON);
        }
    );
    context.mock.method(
        platformAccessory.context.airstageClient,
        'setEconomyState',
        (deviceId, economyState, callback) => {
            callback('setEconomyState error');
        }
    );
    const economySwitchAccessory = new EconomySwitchAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    economySwitchAccessory.setOn(true, function(error) {
        assert.strictEqual(error, 'setEconomyState error');

        mockHomebridge.resetMocks();

        done();
    });
});

test('EconomySwitchAccessory#setOn when getPowerState returns ON', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getPowerState',
        (deviceId, callback) => {
            callback(null, airstage.constants.TOGGLE_ON);
        }
    );
    context.mock.method(
        platformAccessory.context.airstageClient,
        'setEconomyState',
        (deviceId, economyState, callback) => {
            assert.strictEqual(economyState, airstage.constants.TOGGLE_ON);

            callback(null);
        }
    );
    const economySwitchAccessory = new EconomySwitchAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    economySwitchAccessory.setOn(true, function(error) {
        assert.strictEqual(error, null);

        mockHomebridge.resetMocks();

        done();
    });
});

test('EconomySwitchAccessory#setOn when getPowerState returns OFF and setPowerState returns error', (context, done) => {
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
    const economySwitchAccessory = new EconomySwitchAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    economySwitchAccessory.setOn(true, function(error) {
        assert.strictEqual(error, 'setPowerState error');

        mockHomebridge.resetMocks();

        done();
    });
});

test('EconomySwitchAccessory#setOn when getPowerState returns OFF and setEconomyState returns error', (context, done) => {
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
        'setEconomyState',
        (deviceId, economyState, callback) => {
            callback('setEconomyState error');
        }
    );
    const economySwitchAccessory = new EconomySwitchAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    economySwitchAccessory.setOn(true, function(error) {
        assert.strictEqual(error, 'setEconomyState error');

        mockHomebridge.resetMocks();

        done();
    });
});

test('EconomySwitchAccessory#setOn when getPowerState returns OFF', (context, done) => {
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
        'setEconomyState',
        (deviceId, economyState, callback) => {
            assert.strictEqual(economyState, airstage.constants.TOGGLE_ON);

            callback(null);
        }
    );
    const economySwitchAccessory = new EconomySwitchAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    economySwitchAccessory.setOn(true, function(error) {
        assert.strictEqual(error, null);

        mockHomebridge.resetMocks();

        done();
    });
});
