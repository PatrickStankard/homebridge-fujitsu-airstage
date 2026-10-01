'use strict';

const assert = require('node:assert');
const { mock, test } = require('node:test');
const TemperatureAccessory = require('../../src/accessories/temperature-accessory');
const MockHomebridge = require('../../src/test/mock-homebridge');
const airstage = require('../../src/airstage');

const mockHomebridge = new MockHomebridge();
const platformAccessory = new mockHomebridge.platform.api.platformAccessory(
    'test-name',
    'test-uuid'
);
platformAccessory.context.airstageClient = mockHomebridge.platform.airstageCloudClient;

test('TemperatureAccessory#constructor registers accessory', (context) => {
    context.mock.method(
        platformAccessory,
        'getService'
    );
    const temperatureAccessory = new TemperatureAccessory(
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
        mockHomebridge.platform.Service.Thermostat
    );

    mockHomebridge.resetMocks();
});

test('TemperatureAccessory#constructor configures event listeners', (context) => {
    const temperatureAccessory = new TemperatureAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    assert.strictEqual(mockHomebridge.service.getCharacteristic.mock.calls.length, 6);
    assert.strictEqual(
        mockHomebridge.service.getCharacteristic.mock.calls[0].arguments[0],
        mockHomebridge.platform.Characteristic.CurrentHeatingCoolingState
    );
    assert.strictEqual(
        mockHomebridge.service.getCharacteristic.mock.calls[1].arguments[0],
        mockHomebridge.platform.Characteristic.TargetHeatingCoolingState
    );
    assert.strictEqual(
        mockHomebridge.service.getCharacteristic.mock.calls[2].arguments[0],
        mockHomebridge.platform.Characteristic.CurrentTemperature
    );
    assert.strictEqual(
        mockHomebridge.service.getCharacteristic.mock.calls[3].arguments[0],
        mockHomebridge.platform.Characteristic.TargetTemperature
    );
    assert.strictEqual(
        mockHomebridge.service.getCharacteristic.mock.calls[4].arguments[0],
        mockHomebridge.platform.Characteristic.TemperatureDisplayUnits
    );
    assert.strictEqual(
        mockHomebridge.service.getCharacteristic.mock.calls[5].arguments[0],
        mockHomebridge.platform.Characteristic.Name
    );
    assert.strictEqual(mockHomebridge.characteristic.on.mock.calls.length, 9);
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[0].arguments[0],
        'get'
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[0].arguments[1].name,
        temperatureAccessory.getCurrentHeatingCoolingState.bind(temperatureAccessory).name
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[1].arguments[0],
        'get'
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[1].arguments[1].name,
        temperatureAccessory.getTargetHeatingCoolingState.bind(temperatureAccessory).name
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[2].arguments[0],
        'set'
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[2].arguments[1].name,
        temperatureAccessory.setTargetHeatingCoolingState.bind(temperatureAccessory).name
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[3].arguments[0],
        'get'
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[3].arguments[1].name,
        temperatureAccessory.getCurrentTemperature.bind(temperatureAccessory).name
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[4].arguments[0],
        'get'
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[4].arguments[1].name,
        temperatureAccessory.getTargetTemperature.bind(temperatureAccessory).name
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[5].arguments[0],
        'set'
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[5].arguments[1].name,
        temperatureAccessory.setTargetTemperature.bind(temperatureAccessory).name
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[6].arguments[0],
        'get'
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[6].arguments[1].name,
        temperatureAccessory.getTemperatureDisplayUnits.bind(temperatureAccessory).name
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[7].arguments[0],
        'set'
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[7].arguments[1].name,
        temperatureAccessory.setTemperatureDisplayUnits.bind(temperatureAccessory).name
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[8].arguments[0],
        'get'
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[8].arguments[1].name,
        temperatureAccessory.getName.bind(temperatureAccessory).name
    );

    mockHomebridge.resetMocks();
});

test('TemperatureAccessory#getCurrentHeatingCoolingState when getPowerState returns error', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getPowerState',
        (deviceId, callback) => {
            callback('getPowerState error', null);
        }
    );
    const temperatureAccessory = new TemperatureAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    temperatureAccessory.getCurrentHeatingCoolingState(function(error, value) {
        assert.strictEqual(error, 'getPowerState error');
        assert.strictEqual(value, null);

        mockHomebridge.resetMocks();

        done();
    });
});

test('TemperatureAccessory#getCurrentHeatingCoolingState when getPowerState returns OFF', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getPowerState',
        (deviceId, callback) => {
            callback(null, airstage.constants.TOGGLE_OFF);
        }
    );
    const temperatureAccessory = new TemperatureAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    temperatureAccessory.getCurrentHeatingCoolingState(function(error, value) {
        assert.strictEqual(error, null);
        assert.strictEqual(value, temperatureAccessory.Characteristic.CurrentHeatingCoolingState.OFF);

        mockHomebridge.resetMocks();

        done();
    });
});

test('TemperatureAccessory#getCurrentHeatingCoolingState when getPowerState returns ON and getOperationMode returns error', (context, done) => {
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
    const temperatureAccessory = new TemperatureAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    temperatureAccessory.getCurrentHeatingCoolingState(function(error, value) {
        assert.strictEqual(error, 'getOperationMode error');
        assert.strictEqual(value, null);

        mockHomebridge.resetMocks();

        done();
    });
});

test('TemperatureAccessory#getCurrentHeatingCoolingState when getPowerState returns ON and getOperationMode returns COOL', (context, done) => {
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
            callback(null, airstage.constants.OPERATION_MODE_COOL);
        }
    );
    const temperatureAccessory = new TemperatureAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    temperatureAccessory.getCurrentHeatingCoolingState(function(error, value) {
        assert.strictEqual(error, null);
        assert.strictEqual(value, temperatureAccessory.Characteristic.CurrentHeatingCoolingState.COOL);

        mockHomebridge.resetMocks();

        done();
    });
});

test('TemperatureAccessory#getCurrentHeatingCoolingState when getPowerState returns ON and getOperationMode returns DRY', (context, done) => {
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
    const temperatureAccessory = new TemperatureAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    temperatureAccessory.getCurrentHeatingCoolingState(function(error, value) {
        assert.strictEqual(error, null);
        assert.strictEqual(value, temperatureAccessory.Characteristic.CurrentHeatingCoolingState.COOL);

        mockHomebridge.resetMocks();

        done();
    });
});

test('TemperatureAccessory#getCurrentHeatingCoolingState when getPowerState returns ON and getOperationMode returns FAN', (context, done) => {
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
    const temperatureAccessory = new TemperatureAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    temperatureAccessory.getCurrentHeatingCoolingState(function(error, value) {
        assert.strictEqual(error, null);
        assert.strictEqual(value, temperatureAccessory.Characteristic.CurrentHeatingCoolingState.OFF);

        mockHomebridge.resetMocks();

        done();
    });
});

test('TemperatureAccessory#getCurrentHeatingCoolingState when getPowerState returns ON and getOperationMode returns HEAT', (context, done) => {
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
            callback(null, airstage.constants.OPERATION_MODE_HEAT);
        }
    );
    const temperatureAccessory = new TemperatureAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    temperatureAccessory.getCurrentHeatingCoolingState(function(error, value) {
        assert.strictEqual(error, null);
        assert.strictEqual(value, temperatureAccessory.Characteristic.CurrentHeatingCoolingState.HEAT);

        mockHomebridge.resetMocks();

        done();
    });
});

test('TemperatureAccessory#getTargetHeatingCoolingState when getPowerState returns error', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getPowerState',
        (deviceId, callback) => {
            callback('getPowerState error', null);
        }
    );
    const temperatureAccessory = new TemperatureAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    temperatureAccessory.getTargetHeatingCoolingState(function(error, value) {
        assert.strictEqual(error, 'getPowerState error');
        assert.strictEqual(value, null);

        mockHomebridge.resetMocks();

        done();
    });
});

test('TemperatureAccessory#getTargetHeatingCoolingState when getPowerState returns OFF', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getPowerState',
        (deviceId, callback) => {
            callback(null, airstage.constants.TOGGLE_OFF);
        }
    );
    const temperatureAccessory = new TemperatureAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    temperatureAccessory.getTargetHeatingCoolingState(function(error, value) {
        assert.strictEqual(error, null);
        assert.strictEqual(value, temperatureAccessory.Characteristic.TargetHeatingCoolingState.OFF);

        mockHomebridge.resetMocks();

        done();
    });
});

test('TemperatureAccessory#getTargetHeatingCoolingState when getPowerState returns ON and getOperationMode returns error', (context, done) => {
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
    const temperatureAccessory = new TemperatureAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    temperatureAccessory.getTargetHeatingCoolingState(function(error, value) {
        assert.strictEqual(error, 'getOperationMode error');
        assert.strictEqual(value, null);

        mockHomebridge.resetMocks();

        done();
    });
});

test('TemperatureAccessory#getTargetHeatingCoolingState when getPowerState returns ON and getOperationMode returns COOL', (context, done) => {
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
            callback(null, airstage.constants.OPERATION_MODE_COOL);
        }
    );
    const temperatureAccessory = new TemperatureAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    temperatureAccessory.getTargetHeatingCoolingState(function(error, value) {
        assert.strictEqual(error, null);
        assert.strictEqual(value, temperatureAccessory.Characteristic.TargetHeatingCoolingState.AUTO);

        mockHomebridge.resetMocks();

        done();
    });
});

test('TemperatureAccessory#getTargetHeatingCoolingState when getPowerState returns ON and getOperationMode returns DRY', (context, done) => {
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
    const temperatureAccessory = new TemperatureAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    temperatureAccessory.getTargetHeatingCoolingState(function(error, value) {
        assert.strictEqual(error, null);
        assert.strictEqual(value, temperatureAccessory.Characteristic.TargetHeatingCoolingState.AUTO);

        mockHomebridge.resetMocks();

        done();
    });
});

test('TemperatureAccessory#getTargetHeatingCoolingState when getPowerState returns ON and getOperationMode returns FAN', (context, done) => {
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
    const temperatureAccessory = new TemperatureAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    temperatureAccessory.getTargetHeatingCoolingState(function(error, value) {
        assert.strictEqual(error, null);
        assert.strictEqual(value, temperatureAccessory.Characteristic.TargetHeatingCoolingState.OFF);

        mockHomebridge.resetMocks();

        done();
    });
});

test('TemperatureAccessory#getTargetHeatingCoolingState when getPowerState returns ON and getOperationMode returns HEAT', (context, done) => {
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
            callback(null, airstage.constants.OPERATION_MODE_HEAT);
        }
    );
    const temperatureAccessory = new TemperatureAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    temperatureAccessory.getTargetHeatingCoolingState(function(error, value) {
        assert.strictEqual(error, null);
        assert.strictEqual(value, temperatureAccessory.Characteristic.TargetHeatingCoolingState.AUTO);

        mockHomebridge.resetMocks();

        done();
    });
});

test('TemperatureAccessory#getTargetHeatingCoolingState when getPowerState returns ON and getOperationMode returns AUTO', (context, done) => {
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
    const temperatureAccessory = new TemperatureAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    temperatureAccessory.getTargetHeatingCoolingState(function(error, value) {
        assert.strictEqual(error, null);
        assert.strictEqual(value, temperatureAccessory.Characteristic.TargetHeatingCoolingState.AUTO);

        mockHomebridge.resetMocks();

        done();
    });
});

test('TemperatureAccessory#setTargetHeatingCoolingState when called with OFF and getPowerState returns error', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getPowerState',
        (deviceId, callback) => {
            callback('getPowerState error', null);
        }
    );
    const temperatureAccessory = new TemperatureAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    temperatureAccessory.setTargetHeatingCoolingState(
        temperatureAccessory.Characteristic.TargetHeatingCoolingState.OFF,
        function(error) {
            assert.strictEqual(error, 'getPowerState error');

            mockHomebridge.resetMocks();

            done();
        }
    );
});

test('TemperatureAccessory#setTargetHeatingCoolingState when called with OFF and setPowerState returns error', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getPowerState',
        (deviceId, callback) => {
            callback(null, airstage.constants.TOGGLE_ON);
        }
    );
    context.mock.method(
        platformAccessory.context.airstageClient,
        'setPowerState',
        (deviceId, powerState, callback) => {
            callback('setPowerState error');
        }
    );
    const temperatureAccessory = new TemperatureAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    temperatureAccessory.setTargetHeatingCoolingState(
        temperatureAccessory.Characteristic.TargetHeatingCoolingState.OFF,
        function(error) {
            assert.strictEqual(error, 'setPowerState error');

            mockHomebridge.resetMocks();

            done();
        }
    );
});

test('TemperatureAccessory#setTargetHeatingCoolingState when called with OFF', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getPowerState',
        (deviceId, callback) => {
            callback(null, airstage.constants.TOGGLE_ON);
        }
    );
    context.mock.method(
        platformAccessory.context.airstageClient,
        'setPowerState',
        (deviceId, powerState, callback) => {
            assert.strictEqual(powerState, airstage.constants.TOGGLE_OFF);

            callback(null);
        }
    );
    const temperatureAccessory = new TemperatureAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    temperatureAccessory.setTargetHeatingCoolingState(
        temperatureAccessory.Characteristic.TargetHeatingCoolingState.OFF,
        function(error) {
            assert.strictEqual(error, null);

            mockHomebridge.resetMocks();

            done();
        }
    );
});

test('TemperatureAccessory#setTargetHeatingCoolingState when called with COOL', (context, done) => {
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
        'setOperationMode',
        (deviceId, operationMode, callback) => {
            assert.strictEqual(operationMode, airstage.constants.OPERATION_MODE_COOL);
            callback(null);
        }
    );
    const temperatureAccessory = new TemperatureAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    temperatureAccessory.setTargetHeatingCoolingState(
        temperatureAccessory.Characteristic.TargetHeatingCoolingState.COOL,
        function(error) {
            assert.strictEqual(error, null);

            mockHomebridge.resetMocks();

            done();
        }
    );
});

test('TemperatureAccessory#setTargetHeatingCoolingState when called with HEAT', (context, done) => {
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
        'setOperationMode',
        (deviceId, operationMode, callback) => {
            assert.strictEqual(operationMode, airstage.constants.OPERATION_MODE_HEAT);
            callback(null);
        }
    );
    const temperatureAccessory = new TemperatureAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    temperatureAccessory.setTargetHeatingCoolingState(
        temperatureAccessory.Characteristic.TargetHeatingCoolingState.HEAT,
        function(error) {
            assert.strictEqual(error, null);

            mockHomebridge.resetMocks();

            done();
        }
    );
});

test('TemperatureAccessory#setTargetHeatingCoolingState when called with AUTO', (context, done) => {
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
        'setOperationMode',
        (deviceId, operationMode, callback) => {
            assert.strictEqual(operationMode, airstage.constants.OPERATION_MODE_AUTO);
            callback(null);
        }
    );
    const temperatureAccessory = new TemperatureAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    temperatureAccessory.setTargetHeatingCoolingState(
        temperatureAccessory.Characteristic.TargetHeatingCoolingState.AUTO,
        function(error) {
            assert.strictEqual(error, null);

            mockHomebridge.resetMocks();

            done();
        }
    );
});

test('TemperatureAccessory#setTargetHeatingCoolingState does not call setPowerState if device is already on', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getPowerState',
        (deviceId, callback) => {
            callback(null, airstage.constants.TOGGLE_ON);
        }
    );
    context.mock.method(
        platformAccessory.context.airstageClient,
        'setOperationMode',
        (deviceId, operationMode, callback) => {
            assert.strictEqual(operationMode, airstage.constants.OPERATION_MODE_AUTO);
            callback(null);
        }
    );
    const temperatureAccessory = new TemperatureAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    temperatureAccessory.setTargetHeatingCoolingState(
        temperatureAccessory.Characteristic.TargetHeatingCoolingState.AUTO,
        function(error) {
            assert.strictEqual(error, null);

            mockHomebridge.resetMocks();

            done();
        }
    );
});

test('TemperatureAccessory#getCurrentTemperature when getIndoorTemperature returns error', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getIndoorTemperature',
        (deviceId, temperatureScale, callback) => {
            callback('getIndoorTemperature error', null);
        }
    );
    const temperatureAccessory = new TemperatureAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    temperatureAccessory.getCurrentTemperature(function(error, value) {
        assert.strictEqual(error, 'getIndoorTemperature error');
        assert.strictEqual(value, null);

        mockHomebridge.resetMocks();

        done();
    });
});

test('TemperatureAccessory#getCurrentTemperature when getIndoorTemperature returns 10', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getIndoorTemperature',
        (deviceId, temperatureScale, callback) => {
            assert.strictEqual(temperatureScale, airstage.constants.TEMPERATURE_SCALE_CELSIUS);

            callback(null, 10);
        }
    );
    const temperatureAccessory = new TemperatureAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    temperatureAccessory.getCurrentTemperature(function(error, value) {
        assert.strictEqual(error, null);
        assert.strictEqual(value, 10);

        mockHomebridge.resetMocks();

        done();
    });
});

test('TemperatureAccessory#getTargetTemperature when getTargetTemperature returns error', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getTargetTemperature',
        (deviceId, temperatureScale, callback) => {
            callback('getTargetTemperature error', null);
        }
    );
    const temperatureAccessory = new TemperatureAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    temperatureAccessory.getTargetTemperature(function(error, value) {
        assert.strictEqual(error, 'getTargetTemperature error');
        assert.strictEqual(value, null);

        mockHomebridge.resetMocks();

        done();
    });
});

test('TemperatureAccessory#getTargetTemperature when getTargetTemperature returns 10', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getTargetTemperature',
        (deviceId, temperatureScale, callback) => {
            assert.strictEqual(temperatureScale, airstage.constants.TEMPERATURE_SCALE_CELSIUS);

            callback(null, 10);
        }
    );
    const temperatureAccessory = new TemperatureAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    temperatureAccessory.getTargetTemperature(function(error, value) {
        assert.strictEqual(error, null);
        assert.strictEqual(value, 10);

        mockHomebridge.resetMocks();

        done();
    });
});

test('TemperatureAccessory#setTargetTemperature when setTargetTemperature returns error', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'setTargetTemperature',
        (deviceId, value, temperatureScale, callback) => {
            callback('setTargetTemperature error');
        }
    );
    const temperatureAccessory = new TemperatureAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    temperatureAccessory.setTargetTemperature(10, function(error) {
        assert.strictEqual(error, 'setTargetTemperature error');

        mockHomebridge.resetMocks();

        done();
    });
});

test('TemperatureAccessory#setTargetTemperature when setTargetTemperature returns 10', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'setTargetTemperature',
        (deviceId, value, temperatureScale, callback) => {
            assert.strictEqual(value, 10);
            assert.strictEqual(temperatureScale, airstage.constants.TEMPERATURE_SCALE_CELSIUS);

            callback(null);
        }
    );
    const temperatureAccessory = new TemperatureAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    temperatureAccessory.setTargetTemperature(10, function(error) {
        assert.strictEqual(error, null);

        mockHomebridge.resetMocks();

        done();
    });
});

test('TemperatureAccessory#getTemperatureDisplayUnits when getTemperatureScale returns error', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getTemperatureScale',
        (callback) => {
            callback('getTemperatureScale error', null);
        }
    );
    const temperatureAccessory = new TemperatureAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    temperatureAccessory.getTemperatureDisplayUnits(function(error, value) {
        assert.strictEqual(error, 'getTemperatureScale error');
        assert.strictEqual(value, null);

        mockHomebridge.resetMocks();

        done();
    });
});

test('TemperatureAccessory#getTemperatureDisplayUnits when getTemperatureScale returns FAHRENHEIT', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getTemperatureScale',
        (callback) => {
            callback(null, airstage.constants.TEMPERATURE_SCALE_FAHRENHEIT);
        }
    );
    const temperatureAccessory = new TemperatureAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    temperatureAccessory.getTemperatureDisplayUnits(function(error, value) {
        assert.strictEqual(error, null);
        assert.strictEqual(value, temperatureAccessory.Characteristic.TemperatureDisplayUnits.FAHRENHEIT);

        mockHomebridge.resetMocks();

        done();
    });
});

test('TemperatureAccessory#getTemperatureDisplayUnits when getTemperatureScale returns CELSIUS', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getTemperatureScale',
        (callback) => {
            callback(null, airstage.constants.TEMPERATURE_SCALE_CELSIUS);
        }
    );
    const temperatureAccessory = new TemperatureAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    temperatureAccessory.getTemperatureDisplayUnits(function(error, value) {
        assert.strictEqual(error, null);
        assert.strictEqual(value, temperatureAccessory.Characteristic.TemperatureDisplayUnits.CELSIUS);

        mockHomebridge.resetMocks();

        done();
    });
});

test('TemperatureAccessory#setTemperatureDisplayUnits when called with FAHRENHEIT', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'setTemperatureScale',
        (temperatureScale, callback) => {
            assert.strictEqual(temperatureScale, airstage.constants.TEMPERATURE_SCALE_FAHRENHEIT);

            callback(null);
        }
    );
    const temperatureAccessory = new TemperatureAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    temperatureAccessory.setTemperatureDisplayUnits(
        temperatureAccessory.Characteristic.TemperatureDisplayUnits.FAHRENHEIT,
        function(error) {
            assert.strictEqual(error, null);

            mockHomebridge.resetMocks();

            done();
        }
    );
});

test('TemperatureAccessory#setTemperatureDisplayUnits when called with CELSIUS', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'setTemperatureScale',
        (temperatureScale, callback) => {
            assert.strictEqual(temperatureScale, airstage.constants.TEMPERATURE_SCALE_CELSIUS);

            callback(null);
        }
    );
    const temperatureAccessory = new TemperatureAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    temperatureAccessory.setTemperatureDisplayUnits(
        temperatureAccessory.Characteristic.TemperatureDisplayUnits.CELSIUS,
        function(error) {
            assert.strictEqual(error, null);

            mockHomebridge.resetMocks();

            done();
        }
    );
});

test('TemperatureAccessory#getName when getName returns error', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getName',
        (deviceId, callback) => {
            callback('getName error', null);
        }
    );
    const temperatureAccessory = new TemperatureAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    temperatureAccessory.getName(function(error, name) {
        assert.strictEqual(error, 'getName error');
        assert.strictEqual(name, null);

        mockHomebridge.resetMocks();

        done();
    });
});

test('TemperatureAccessory#getName returns name with expected suffix', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getName',
        (deviceId, callback) => {
            callback(null, 'Test Device');
        }
    );
    const temperatureAccessory = new TemperatureAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    temperatureAccessory.getName(function(error, name) {
        assert.strictEqual(error, null);
        assert.strictEqual(name, 'Test Device Temperature');

        mockHomebridge.resetMocks();

        done();
    });
});
