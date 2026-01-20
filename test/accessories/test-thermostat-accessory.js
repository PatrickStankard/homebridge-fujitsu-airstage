'use strict';

const assert = require('node:assert');
const { mock, test } = require('node:test');
const ThermostatAccessory = require('../../src/accessories/thermostat-accessory');
const MockHomebridge = require('../../src/test/mock-homebridge');
const airstage = require('../../src/airstage');

const mockHomebridge = new MockHomebridge();
const platformAccessory = new mockHomebridge.platform.api.platformAccessory(
    'test-name',
    'test-uuid'
);

test('ThermostatAccessory#constructor registers accessory', (context) => {
    context.mock.method(
        platformAccessory,
        'getService'
    );
    const thermostatAccessory = new ThermostatAccessory(
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

test('ThermostatAccessory#constructor configures event listeners', (context) => {
    const thermostatAccessory = new ThermostatAccessory(
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
        thermostatAccessory.getCurrentHeatingCoolingState.bind(thermostatAccessory).name
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[1].arguments[0],
        'get'
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[1].arguments[1].name,
        thermostatAccessory.getTargetHeatingCoolingState.bind(thermostatAccessory).name
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[2].arguments[0],
        'set'
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[2].arguments[1].name,
        thermostatAccessory.setTargetHeatingCoolingState.bind(thermostatAccessory).name
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[3].arguments[0],
        'get'
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[3].arguments[1].name,
        thermostatAccessory.getCurrentTemperature.bind(thermostatAccessory).name
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[4].arguments[0],
        'get'
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[4].arguments[1].name,
        thermostatAccessory.getTargetTemperature.bind(thermostatAccessory).name
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[5].arguments[0],
        'set'
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[5].arguments[1].name,
        thermostatAccessory.setTargetTemperature.bind(thermostatAccessory).name
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[6].arguments[0],
        'get'
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[6].arguments[1].name,
        thermostatAccessory.getTemperatureDisplayUnits.bind(thermostatAccessory).name
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[7].arguments[0],
        'set'
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[7].arguments[1].name,
        thermostatAccessory.setTemperatureDisplayUnits.bind(thermostatAccessory).name
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[8].arguments[0],
        'get'
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[8].arguments[1].name,
        thermostatAccessory.getName.bind(thermostatAccessory).name
    );

    mockHomebridge.resetMocks();
});

test('ThermostatAccessory#getCurrentHeatingCoolingState when getPowerState returns error', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getPowerState',
        (deviceId, callback) => {
            callback('getPowerState error', null);
        }
    );
    const thermostatAccessory = new ThermostatAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    thermostatAccessory.getCurrentHeatingCoolingState(function(error, value) {
        assert.strictEqual(error, 'getPowerState error');
        assert.strictEqual(value, null);

        mockHomebridge.resetMocks();

        done();
    });
});

test('ThermostatAccessory#getCurrentHeatingCoolingState when getPowerState returns OFF', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getPowerState',
        (deviceId, callback) => {
            callback(null, airstage.constants.TOGGLE_OFF);
        }
    );
    const thermostatAccessory = new ThermostatAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    thermostatAccessory.getCurrentHeatingCoolingState(function(error, value) {
        assert.strictEqual(error, null);
        assert.strictEqual(value, thermostatAccessory.Characteristic.CurrentHeatingCoolingState.OFF);

        mockHomebridge.resetMocks();

        done();
    });
});

test('ThermostatAccessory#getCurrentHeatingCoolingState when getPowerState returns ON and getOperationMode returns error', (context, done) => {
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
    const thermostatAccessory = new ThermostatAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    thermostatAccessory.getCurrentHeatingCoolingState(function(error, value) {
        assert.strictEqual(error, 'getOperationMode error');
        assert.strictEqual(value, null);

        mockHomebridge.resetMocks();

        done();
    });
});

test('ThermostatAccessory#getCurrentHeatingCoolingState when getPowerState returns ON and getOperationMode returns COOL', (context, done) => {
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
    const thermostatAccessory = new ThermostatAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    thermostatAccessory.getCurrentHeatingCoolingState(function(error, value) {
        assert.strictEqual(error, null);
        assert.strictEqual(value, thermostatAccessory.Characteristic.CurrentHeatingCoolingState.COOL);

        mockHomebridge.resetMocks();

        done();
    });
});

test('ThermostatAccessory#getCurrentHeatingCoolingState when getPowerState returns ON and getOperationMode returns DRY', (context, done) => {
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
    const thermostatAccessory = new ThermostatAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    thermostatAccessory.getCurrentHeatingCoolingState(function(error, value) {
        assert.strictEqual(error, null);
        assert.strictEqual(value, thermostatAccessory.Characteristic.CurrentHeatingCoolingState.COOL);

        mockHomebridge.resetMocks();

        done();
    });
});

test('ThermostatAccessory#getCurrentHeatingCoolingState when getPowerState returns ON and getOperationMode returns FAN', (context, done) => {
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
    const thermostatAccessory = new ThermostatAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    thermostatAccessory.getCurrentHeatingCoolingState(function(error, value) {
        assert.strictEqual(error, null);
        assert.strictEqual(value, thermostatAccessory.Characteristic.CurrentHeatingCoolingState.OFF);

        mockHomebridge.resetMocks();

        done();
    });
});

test('ThermostatAccessory#getCurrentHeatingCoolingState when getPowerState returns ON and getOperationMode returns HEAT', (context, done) => {
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
    const thermostatAccessory = new ThermostatAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    thermostatAccessory.getCurrentHeatingCoolingState(function(error, value) {
        assert.strictEqual(error, null);
        assert.strictEqual(value, thermostatAccessory.Characteristic.CurrentHeatingCoolingState.HEAT);

        mockHomebridge.resetMocks();

        done();
    });
});

test('ThermostatAccessory#getTargetHeatingCoolingState when getPowerState returns error', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getPowerState',
        (deviceId, callback) => {
            callback('getPowerState error', null);
        }
    );
    const thermostatAccessory = new ThermostatAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    thermostatAccessory.getTargetHeatingCoolingState(function(error, value) {
        assert.strictEqual(error, 'getPowerState error');
        assert.strictEqual(value, null);

        mockHomebridge.resetMocks();

        done();
    });
});

test('ThermostatAccessory#getTargetHeatingCoolingState when getPowerState returns OFF', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getPowerState',
        (deviceId, callback) => {
            callback(null, airstage.constants.TOGGLE_OFF);
        }
    );
    const thermostatAccessory = new ThermostatAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    thermostatAccessory.getTargetHeatingCoolingState(function(error, value) {
        assert.strictEqual(error, null);
        assert.strictEqual(value, thermostatAccessory.Characteristic.TargetHeatingCoolingState.OFF);

        mockHomebridge.resetMocks();

        done();
    });
});

test('ThermostatAccessory#getTargetHeatingCoolingState when getPowerState returns ON and getOperationMode returns error', (context, done) => {
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
    const thermostatAccessory = new ThermostatAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    thermostatAccessory.getTargetHeatingCoolingState(function(error, value) {
        assert.strictEqual(error, 'getOperationMode error');
        assert.strictEqual(value, null);

        mockHomebridge.resetMocks();

        done();
    });
});

test('ThermostatAccessory#getTargetHeatingCoolingState when getPowerState returns ON and getOperationMode returns COOL', (context, done) => {
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
    const thermostatAccessory = new ThermostatAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    thermostatAccessory.getTargetHeatingCoolingState(function(error, value) {
        assert.strictEqual(error, null);
        assert.strictEqual(value, thermostatAccessory.Characteristic.TargetHeatingCoolingState.COOL);

        mockHomebridge.resetMocks();

        done();
    });
});

test('ThermostatAccessory#getTargetHeatingCoolingState when getPowerState returns ON and getOperationMode returns DRY', (context, done) => {
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
    const thermostatAccessory = new ThermostatAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    thermostatAccessory.getTargetHeatingCoolingState(function(error, value) {
        assert.strictEqual(error, null);
        assert.strictEqual(value, thermostatAccessory.Characteristic.TargetHeatingCoolingState.COOL);

        mockHomebridge.resetMocks();

        done();
    });
});

test('ThermostatAccessory#getTargetHeatingCoolingState when getPowerState returns ON and getOperationMode returns FAN', (context, done) => {
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
    const thermostatAccessory = new ThermostatAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    thermostatAccessory.getTargetHeatingCoolingState(function(error, value) {
        assert.strictEqual(error, null);
        assert.strictEqual(value, thermostatAccessory.Characteristic.TargetHeatingCoolingState.OFF);

        mockHomebridge.resetMocks();

        done();
    });
});

test('ThermostatAccessory#getTargetHeatingCoolingState when getPowerState returns ON and getOperationMode returns HEAT', (context, done) => {
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
    const thermostatAccessory = new ThermostatAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    thermostatAccessory.getTargetHeatingCoolingState(function(error, value) {
        assert.strictEqual(error, null);
        assert.strictEqual(value, thermostatAccessory.Characteristic.TargetHeatingCoolingState.HEAT);

        mockHomebridge.resetMocks();

        done();
    });
});

test('ThermostatAccessory#getTargetHeatingCoolingState when getPowerState returns ON and getOperationMode returns AUTO', (context, done) => {
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
    const thermostatAccessory = new ThermostatAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    thermostatAccessory.getTargetHeatingCoolingState(function(error, value) {
        assert.strictEqual(error, null);
        assert.strictEqual(value, thermostatAccessory.Characteristic.TargetHeatingCoolingState.AUTO);

        mockHomebridge.resetMocks();

        done();
    });
});

test('ThermostatAccessory#setTargetHeatingCoolingState when called with OFF and getPowerState returns error', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getPowerState',
        (deviceId, callback) => {
            callback('getPowerState error', null);
        }
    );
    const thermostatAccessory = new ThermostatAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    thermostatAccessory.setTargetHeatingCoolingState(
        thermostatAccessory.Characteristic.TargetHeatingCoolingState.OFF,
        function(error) {
            assert.strictEqual(error, 'getPowerState error');

            mockHomebridge.resetMocks();

            done();
        }
    );
});

test('ThermostatAccessory#setTargetHeatingCoolingState when called with OFF and setPowerState returns error', (context, done) => {
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
    const thermostatAccessory = new ThermostatAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    thermostatAccessory.setTargetHeatingCoolingState(
        thermostatAccessory.Characteristic.TargetHeatingCoolingState.OFF,
        function(error) {
            assert.strictEqual(error, 'setPowerState error');

            mockHomebridge.resetMocks();

            done();
        }
    );
});

test('ThermostatAccessory#setTargetHeatingCoolingState when called with OFF', (context, done) => {
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
    const thermostatAccessory = new ThermostatAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    thermostatAccessory.setTargetHeatingCoolingState(
        thermostatAccessory.Characteristic.TargetHeatingCoolingState.OFF,
        function(error) {
            assert.strictEqual(error, null);

            mockHomebridge.resetMocks();

            done();
        }
    );
});

test('ThermostatAccessory#setTargetHeatingCoolingState when setOperationMode returns error', (context, done) => {
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
            callback('setOperationMode error');
        }
    );
    const thermostatAccessory = new ThermostatAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    thermostatAccessory.setTargetHeatingCoolingState(
        thermostatAccessory.Characteristic.TargetHeatingCoolingState.COOL,
        function(error) {
            assert.strictEqual(error, 'setOperationMode error');

            mockHomebridge.resetMocks();

            done();
        }
    );
});

test('ThermostatAccessory#setTargetHeatingCoolingState when called with COOL', (context, done) => {
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
    const thermostatAccessory = new ThermostatAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    thermostatAccessory.setTargetHeatingCoolingState(
        thermostatAccessory.Characteristic.TargetHeatingCoolingState.COOL,
        function(error) {
            assert.strictEqual(error, null);

            mockHomebridge.resetMocks();

            done();
        }
    );
});

test('ThermostatAccessory#setTargetHeatingCoolingState when called with HEAT', (context, done) => {
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
    const thermostatAccessory = new ThermostatAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    thermostatAccessory.setTargetHeatingCoolingState(
        thermostatAccessory.Characteristic.TargetHeatingCoolingState.HEAT,
        function(error) {
            assert.strictEqual(error, null);

            mockHomebridge.resetMocks();

            done();
        }
    );
});

test('ThermostatAccessory#setTargetHeatingCoolingState when called with AUTO', (context, done) => {
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
    const thermostatAccessory = new ThermostatAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    thermostatAccessory.setTargetHeatingCoolingState(
        thermostatAccessory.Characteristic.TargetHeatingCoolingState.AUTO,
        function(error) {
            assert.strictEqual(error, null);

            mockHomebridge.resetMocks();

            done();
        }
    );
});

test('ThermostatAccessory#setTargetHeatingCoolingState does not call setPowerState if device is already on', (context, done) => {
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
    const thermostatAccessory = new ThermostatAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    thermostatAccessory.setTargetHeatingCoolingState(
        thermostatAccessory.Characteristic.TargetHeatingCoolingState.AUTO,
        function(error) {
            assert.strictEqual(error, null);

            mockHomebridge.resetMocks();

            done();
        }
    );
});

test('ThermostatAccessory#getCurrentTemperature when getIndoorTemperature returns error', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getIndoorTemperature',
        (deviceId, temperatureScale, callback) => {
            callback('getIndoorTemperature error', null);
        }
    );
    const thermostatAccessory = new ThermostatAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    thermostatAccessory.getCurrentTemperature(function(error, value) {
        assert.strictEqual(error, 'getIndoorTemperature error');
        assert.strictEqual(value, null);

        mockHomebridge.resetMocks();

        done();
    });
});

test('ThermostatAccessory#getCurrentTemperature when getIndoorTemperature returns 10', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getIndoorTemperature',
        (deviceId, temperatureScale, callback) => {
            assert.strictEqual(temperatureScale, airstage.constants.TEMPERATURE_SCALE_CELSIUS);

            callback(null, 10);
        }
    );
    const thermostatAccessory = new ThermostatAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    thermostatAccessory.getCurrentTemperature(function(error, value) {
        assert.strictEqual(error, null);
        assert.strictEqual(value, 10);

        mockHomebridge.resetMocks();

        done();
    });
});

test('ThermostatAccessory#getTargetTemperature when getTargetTemperature returns error', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getTargetTemperature',
        (deviceId, temperatureScale, callback) => {
            callback('getTargetTemperature error', null);
        }
    );
    const thermostatAccessory = new ThermostatAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    thermostatAccessory.getTargetTemperature(function(error, value) {
        assert.strictEqual(error, 'getTargetTemperature error');
        assert.strictEqual(value, null);

        mockHomebridge.resetMocks();

        done();
    });
});

test('ThermostatAccessory#getTargetTemperature when getTargetTemperature returns 10', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getTargetTemperature',
        (deviceId, temperatureScale, callback) => {
            assert.strictEqual(temperatureScale, airstage.constants.TEMPERATURE_SCALE_CELSIUS);

            callback(null, 10);
        }
    );
    const thermostatAccessory = new ThermostatAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    thermostatAccessory.getTargetTemperature(function(error, value) {
        assert.strictEqual(error, null);
        assert.strictEqual(value, 10);

        mockHomebridge.resetMocks();

        done();
    });
});

test('ThermostatAccessory#setTargetTemperature when setTargetTemperature returns error', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'setTargetTemperature',
        (deviceId, value, temperatureScale, callback) => {
            callback('setTargetTemperature error');
        }
    );
    const thermostatAccessory = new ThermostatAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    thermostatAccessory.setTargetTemperature(10, function(error) {
        assert.strictEqual(error, 'setTargetTemperature error');

        mockHomebridge.resetMocks();

        done();
    });
});

test('ThermostatAccessory#setTargetTemperature when setTargetTemperature returns 10', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'setTargetTemperature',
        (deviceId, value, temperatureScale, callback) => {
            assert.strictEqual(value, 10);
            assert.strictEqual(temperatureScale, airstage.constants.TEMPERATURE_SCALE_CELSIUS);

            callback(null);
        }
    );
    const thermostatAccessory = new ThermostatAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    thermostatAccessory.setTargetTemperature(10, function(error) {
        assert.strictEqual(error, null);

        mockHomebridge.resetMocks();

        done();
    });
});

test('ThermostatAccessory#getTemperatureDisplayUnits when getTemperatureScale returns error', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getTemperatureScale',
        (callback) => {
            callback('getTemperatureScale error', null);
        }
    );
    const thermostatAccessory = new ThermostatAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    thermostatAccessory.getTemperatureDisplayUnits(function(error, value) {
        assert.strictEqual(error, 'getTemperatureScale error');
        assert.strictEqual(value, null);

        mockHomebridge.resetMocks();

        done();
    });
});

test('ThermostatAccessory#getTemperatureDisplayUnits when getTemperatureScale returns FAHRENHEIT', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getTemperatureScale',
        (callback) => {
            callback(null, airstage.constants.TEMPERATURE_SCALE_FAHRENHEIT);
        }
    );
    const thermostatAccessory = new ThermostatAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    thermostatAccessory.getTemperatureDisplayUnits(function(error, value) {
        assert.strictEqual(error, null);
        assert.strictEqual(value, thermostatAccessory.Characteristic.TemperatureDisplayUnits.FAHRENHEIT);

        mockHomebridge.resetMocks();

        done();
    });
});

test('ThermostatAccessory#getTemperatureDisplayUnits when getTemperatureScale returns CELSIUS', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getTemperatureScale',
        (callback) => {
            callback(null, airstage.constants.TEMPERATURE_SCALE_CELSIUS);
        }
    );
    const thermostatAccessory = new ThermostatAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    thermostatAccessory.getTemperatureDisplayUnits(function(error, value) {
        assert.strictEqual(error, null);
        assert.strictEqual(value, thermostatAccessory.Characteristic.TemperatureDisplayUnits.CELSIUS);

        mockHomebridge.resetMocks();

        done();
    });
});

test('ThermostatAccessory#setTemperatureDisplayUnits when setTemperatureScale returns error', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'setTemperatureScale',
        (temperatureScale, callback) => {
            callback('setTemperatureScale error');
        }
    );
    const thermostatAccessory = new ThermostatAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    thermostatAccessory.setTemperatureDisplayUnits(
        thermostatAccessory.Characteristic.TemperatureDisplayUnits.FAHRENHEIT,
        function(error) {
            assert.strictEqual(error, 'setTemperatureScale error');

            mockHomebridge.resetMocks();

            done();
        }
    );
});

test('ThermostatAccessory#setTemperatureDisplayUnits when called with FAHRENHEIT', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'setTemperatureScale',
        (temperatureScale, callback) => {
            assert.strictEqual(temperatureScale, airstage.constants.TEMPERATURE_SCALE_FAHRENHEIT);

            callback(null);
        }
    );
    const thermostatAccessory = new ThermostatAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    thermostatAccessory.setTemperatureDisplayUnits(
        thermostatAccessory.Characteristic.TemperatureDisplayUnits.FAHRENHEIT,
        function(error) {
            assert.strictEqual(error, null);

            mockHomebridge.resetMocks();

            done();
        }
    );
});

test('ThermostatAccessory#setTemperatureDisplayUnits when called with CELSIUS', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'setTemperatureScale',
        (temperatureScale, callback) => {
            assert.strictEqual(temperatureScale, airstage.constants.TEMPERATURE_SCALE_CELSIUS);

            callback(null);
        }
    );
    const thermostatAccessory = new ThermostatAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    thermostatAccessory.setTemperatureDisplayUnits(
        thermostatAccessory.Characteristic.TemperatureDisplayUnits.CELSIUS,
        function(error) {
            assert.strictEqual(error, null);

            mockHomebridge.resetMocks();

            done();
        }
    );
});

test('ThermostatAccessory#getName when getName returns error', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getName',
        (deviceId, callback) => {
            callback('getName error', null);
        }
    );
    const thermostatAccessory = new ThermostatAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    thermostatAccessory.getName(function(error, name) {
        assert.strictEqual(error, 'getName error');
        assert.strictEqual(name, null);

        mockHomebridge.resetMocks();

        done();
    });
});

test('ThermostatAccessory#getName returns name with expected suffix', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getName',
        (deviceId, callback) => {
            callback(null, 'Test Device');
        }
    );
    const thermostatAccessory = new ThermostatAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    thermostatAccessory.getName(function(error, name) {
        assert.strictEqual(error, null);
        assert.strictEqual(name, 'Test Device Thermostat');

        mockHomebridge.resetMocks();

        done();
    });
});
