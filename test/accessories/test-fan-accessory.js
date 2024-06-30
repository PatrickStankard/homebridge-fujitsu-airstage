'use strict';

const assert = require('node:assert');
const { mock, test } = require('node:test');
const FanAccessory = require('../../src/accessories/fan-accessory');
const MockHomebridge = require('../../src/test/mock-homebridge');
const airstage = require('../../src/airstage');

const mockHomebridge = new MockHomebridge();
const platformAccessory = new mockHomebridge.platform.api.platformAccessory(
    'test-name',
    'test-uuid'
);

test('FanAccessory#constructor registers accessory', (context) => {
    context.mock.method(
        platformAccessory,
        'getService'
    );
    const fanAccessory = new FanAccessory(
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
        mockHomebridge.platform.Service.Fanv2
    );

    mockHomebridge.resetMocks();
});

test('FanAccessory#constructor configures event listeners', (context) => {
    const fanAccessory = new FanAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    assert.strictEqual(mockHomebridge.service.getCharacteristic.mock.calls.length, 6);
    assert.strictEqual(
        mockHomebridge.service.getCharacteristic.mock.calls[0].arguments[0],
        mockHomebridge.platform.Characteristic.Active
    );
    assert.strictEqual(
        mockHomebridge.service.getCharacteristic.mock.calls[1].arguments[0],
        mockHomebridge.platform.Characteristic.CurrentFanState
    );
    assert.strictEqual(
        mockHomebridge.service.getCharacteristic.mock.calls[2].arguments[0],
        mockHomebridge.platform.Characteristic.TargetFanState
    );
    assert.strictEqual(
        mockHomebridge.service.getCharacteristic.mock.calls[3].arguments[0],
        mockHomebridge.platform.Characteristic.Name
    );
    assert.strictEqual(
        mockHomebridge.service.getCharacteristic.mock.calls[4].arguments[0],
        mockHomebridge.platform.Characteristic.RotationSpeed
    );
    assert.strictEqual(
        mockHomebridge.service.getCharacteristic.mock.calls[5].arguments[0],
        mockHomebridge.platform.Characteristic.SwingMode
    );
    assert.strictEqual(mockHomebridge.characteristic.on.mock.calls.length, 10);
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[0].arguments[0],
        'get'
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[0].arguments[1].name,
        fanAccessory.getActive.bind(fanAccessory).name
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[1].arguments[0],
        'set'
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[1].arguments[1].name,
        fanAccessory.setActive.bind(fanAccessory).name
    );

    mockHomebridge.resetMocks();
});

test('FanAccessory#getActive when getPowerState returns error', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getPowerState',
        (deviceId, callback) => {
            callback('getPowerState error', null);
        }
    );
    const fanAccessory = new FanAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    fanAccessory.getActive(function(error, value) {
        assert.strictEqual(error, 'getPowerState error');
        assert.strictEqual(value, null);

        mockHomebridge.resetMocks();

        done();
    });
});

test('FanAccessory#getActive when getPowerState returns ON', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getPowerState',
        (deviceId, callback) => {
            callback(null, airstage.constants.TOGGLE_ON);
        }
    );
    const fanAccessory = new FanAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    fanAccessory.getActive(function(error, value) {
        assert.strictEqual(error, null);
        assert.strictEqual(value, fanAccessory.Characteristic.Active.ACTIVE);

        mockHomebridge.resetMocks();

        done();
    });
});

test('FanAccessory#getActive when getPowerState returns OFF', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getPowerState',
        (deviceId, callback) => {
            callback(null, airstage.constants.TOGGLE_OFF);
        }
    );
    const fanAccessory = new FanAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    fanAccessory.getActive(function(error, value) {
        assert.strictEqual(error, null);
        assert.strictEqual(value, fanAccessory.Characteristic.Active.INACTIVE);

        mockHomebridge.resetMocks();

        done();
    });
});

test('FanAccessory#setActive', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'setPowerState',
        (deviceId, powerState, callback) => {
            callback(null);
        }
    );
    context.after(() => {
        assert.strictEqual(platformAccessory.context.airstageClient.setPowerState.mock.calls.length, 1);

        mockHomebridge.resetMocks();
    });
    const fanAccessory = new FanAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    fanAccessory.setActive(fanAccessory.Characteristic.Active.ACTIVE, function(error) {
        assert.strictEqual(error, null);

        done();
    });
});

test('FanAccessory#setActive when setPowerState returns error', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'setPowerState',
        (deviceId, powerState, callback) => {
            callback('setPowerState error');
        }
    );
    context.after(() => {
        assert.strictEqual(platformAccessory.context.airstageClient.setPowerState.mock.calls.length, 1);

        mockHomebridge.resetMocks();
    });
    const fanAccessory = new FanAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    fanAccessory.setActive(fanAccessory.Characteristic.Active.ACTIVE, function(error) {
        assert.strictEqual(error, 'setPowerState error');

        done();
    });
});
