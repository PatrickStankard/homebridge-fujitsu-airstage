'use strict';

const assert = require('node:assert');
const { mock, test } = require('node:test');
const VerticalAirflowDirectionAccessory = require('../../src/accessories/vertical-airflow-direction-accessory');
const MockHomebridge = require('../../src/test/mock-homebridge');
const airstage = require('../../src/airstage');

const mockHomebridge = new MockHomebridge();
const platformAccessory = new mockHomebridge.platform.api.platformAccessory(
    'test-name',
    'test-uuid'
);

test('VerticalAirflowDirectionAccessory#constructor registers accessory', (context) => {
    context.mock.method(
        platformAccessory,
        'getService'
    );
    const verticalAirflowDirectionAccessory = new VerticalAirflowDirectionAccessory(
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

test('VerticalAirflowDirectionAccessory#constructor configures event listeners', (context) => {
    const verticalAirflowDirectionAccessory = new VerticalAirflowDirectionAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    assert.strictEqual(mockHomebridge.service.getCharacteristic.mock.calls.length, 4);
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
        mockHomebridge.platform.Characteristic.Name
    );
    assert.strictEqual(
        mockHomebridge.service.getCharacteristic.mock.calls[3].arguments[0],
        mockHomebridge.platform.Characteristic.RotationSpeed
    );
    assert.strictEqual(mockHomebridge.characteristic.on.mock.calls.length, 6);
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[0].arguments[0],
        'get'
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[0].arguments[1].name,
        verticalAirflowDirectionAccessory.getActive.bind(verticalAirflowDirectionAccessory).name
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[1].arguments[0],
        'set'
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[1].arguments[1].name,
        verticalAirflowDirectionAccessory.setActive.bind(verticalAirflowDirectionAccessory).name
    );

    mockHomebridge.resetMocks();
});

test('VerticalAirflowDirectionAccessory#getActive when getPowerState returns error', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getPowerState',
        (deviceId, callback) => {
            callback('getPowerState error', null);
        }
    );
    const verticalAirflowDirectionAccessory = new VerticalAirflowDirectionAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    verticalAirflowDirectionAccessory.getActive(function(error, value) {
        assert.strictEqual(error, 'getPowerState error');
        assert.strictEqual(value, null);

        mockHomebridge.resetMocks();

        done();
    });
});

test('VerticalAirflowDirectionAccessory#getActive when getPowerState returns ON and getAirflowVerticalSwingState returns error', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getPowerState',
        (deviceId, callback) => {
            callback(null, airstage.constants.TOGGLE_ON);
        }
    );
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getAirflowVerticalSwingState',
        (deviceId, callback) => {
            callback('getAirflowVerticalSwingState error', null);
        }
    );
    const verticalAirflowDirectionAccessory = new VerticalAirflowDirectionAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    verticalAirflowDirectionAccessory.getActive(function(error, value) {
        assert.strictEqual(error, 'getAirflowVerticalSwingState error');
        assert.strictEqual(value, null);

        mockHomebridge.resetMocks();

        done();
    });
});

test('VerticalAirflowDirectionAccessory#getActive when getPowerState returns ON and getAirflowVerticalSwingState returns OFF', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getPowerState',
        (deviceId, callback) => {
            callback(null, airstage.constants.TOGGLE_ON);
        }
    );
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getAirflowVerticalSwingState',
        (deviceId, callback) => {
            callback(null, airstage.constants.TOGGLE_OFF);
        }
    );
    const verticalAirflowDirectionAccessory = new VerticalAirflowDirectionAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    verticalAirflowDirectionAccessory.getActive(function(error, value) {
        assert.strictEqual(error, null);
        assert.strictEqual(value, verticalAirflowDirectionAccessory.Characteristic.Active.ACTIVE);

        mockHomebridge.resetMocks();

        done();
    });
});

test('VerticalAirflowDirectionAccessory#getActive when getPowerState returns ON and getAirflowVerticalSwingState returns ON', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getPowerState',
        (deviceId, callback) => {
            callback(null, airstage.constants.TOGGLE_ON);
        }
    );
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getAirflowVerticalSwingState',
        (deviceId, callback) => {
            callback(null, airstage.constants.TOGGLE_ON);
        }
    );
    const verticalAirflowDirectionAccessory = new VerticalAirflowDirectionAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    verticalAirflowDirectionAccessory.getActive(function(error, value) {
        assert.strictEqual(error, null);
        assert.strictEqual(value, verticalAirflowDirectionAccessory.Characteristic.Active.INACTIVE);

        mockHomebridge.resetMocks();

        done();
    });
});

test('VerticalAirflowDirectionAccessory#getActive when getPowerState returns OFF', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getPowerState',
        (deviceId, callback) => {
            callback(null, airstage.constants.TOGGLE_OFF);
        }
    );
    const verticalAirflowDirectionAccessory = new VerticalAirflowDirectionAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    verticalAirflowDirectionAccessory.getActive(function(error, value) {
        assert.strictEqual(error, null);
        assert.strictEqual(value, verticalAirflowDirectionAccessory.Characteristic.Active.INACTIVE);

        mockHomebridge.resetMocks();

        done();
    });
});

test('VerticalAirflowDirectionAccessory#setActive when getPowerState returns error', (context, done) => {
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
    const verticalAirflowDirectionAccessory = new VerticalAirflowDirectionAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    verticalAirflowDirectionAccessory.setActive(verticalAirflowDirectionAccessory.Characteristic.Active.ACTIVE, function(error) {
        assert.strictEqual(error, 'getPowerState error');

        done();
    });
});

test('VerticalAirflowDirectionAccessory#setActive when setPowerState returns error', (context, done) => {
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
    const verticalAirflowDirectionAccessory = new VerticalAirflowDirectionAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    verticalAirflowDirectionAccessory.setActive(verticalAirflowDirectionAccessory.Characteristic.Active.ACTIVE, function(error) {
        assert.strictEqual(error, 'setPowerState error');

        done();
    });
});
