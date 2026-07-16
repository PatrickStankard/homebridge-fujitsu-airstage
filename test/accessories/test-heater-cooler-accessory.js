'use strict';

const assert = require('node:assert');
const { mock, test } = require('node:test');
const HeaterCoolerAccessory = require('../../src/accessories/heater-cooler-accessory');
const MockHomebridge = require('../../src/test/mock-homebridge');
const airstage = require('../../src/airstage');

const mockHomebridge = new MockHomebridge();
const platformAccessory = new mockHomebridge.platform.api.platformAccessory(
    'test-name',
    'test-uuid'
);
platformAccessory.context.airstageClient = mockHomebridge.platform.airstageCloudClient;

test('HeaterCoolerAccessory#constructor registers accessory', (context) => {
    context.mock.method(
        platformAccessory,
        'getService'
    );
    const heaterCoolerAccessory = new HeaterCoolerAccessory(
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
        mockHomebridge.platform.Service.HeaterCooler
    );

    mockHomebridge.resetMocks();
});

test('HeaterCoolerAccessory#constructor configures event listeners', (context) => {
    const heaterCoolerAccessory = new HeaterCoolerAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    assert.strictEqual(mockHomebridge.service.getCharacteristic.mock.calls.length, 10);
    assert.strictEqual(
        mockHomebridge.service.getCharacteristic.mock.calls[0].arguments[0],
        mockHomebridge.platform.Characteristic.Active
    );
    assert.strictEqual(
        mockHomebridge.service.getCharacteristic.mock.calls[1].arguments[0],
        mockHomebridge.platform.Characteristic.CurrentHeaterCoolerState
    );
    assert.strictEqual(
        mockHomebridge.service.getCharacteristic.mock.calls[2].arguments[0],
        mockHomebridge.platform.Characteristic.TargetHeaterCoolerState
    );
    assert.strictEqual(
        mockHomebridge.service.getCharacteristic.mock.calls[3].arguments[0],
        mockHomebridge.platform.Characteristic.CurrentTemperature
    );
    assert.strictEqual(
        mockHomebridge.service.getCharacteristic.mock.calls[4].arguments[0],
        mockHomebridge.platform.Characteristic.CoolingThresholdTemperature
    );
    assert.strictEqual(
        mockHomebridge.service.getCharacteristic.mock.calls[5].arguments[0],
        mockHomebridge.platform.Characteristic.HeatingThresholdTemperature
    );
    assert.strictEqual(
        mockHomebridge.service.getCharacteristic.mock.calls[6].arguments[0],
        mockHomebridge.platform.Characteristic.TemperatureDisplayUnits
    );
    assert.strictEqual(
        mockHomebridge.service.getCharacteristic.mock.calls[7].arguments[0],
        mockHomebridge.platform.Characteristic.Name
    );
    assert.strictEqual(
        mockHomebridge.service.getCharacteristic.mock.calls[8].arguments[0],
        mockHomebridge.platform.Characteristic.RotationSpeed
    );
    assert.strictEqual(
        mockHomebridge.service.getCharacteristic.mock.calls[9].arguments[0],
        mockHomebridge.platform.Characteristic.SwingMode
    );
    assert.strictEqual(mockHomebridge.characteristic.on.mock.calls.length, 17);
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[0].arguments[0],
        'get'
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[0].arguments[1].name,
        heaterCoolerAccessory.getActive.bind(heaterCoolerAccessory).name
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[1].arguments[0],
        'set'
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[1].arguments[1].name,
        heaterCoolerAccessory.setActive.bind(heaterCoolerAccessory).name
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[2].arguments[0],
        'get'
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[2].arguments[1].name,
        heaterCoolerAccessory.getCurrentHeaterCoolerState.bind(heaterCoolerAccessory).name
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[3].arguments[0],
        'get'
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[3].arguments[1].name,
        heaterCoolerAccessory.getTargetHeaterCoolerState.bind(heaterCoolerAccessory).name
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[4].arguments[0],
        'set'
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[4].arguments[1].name,
        heaterCoolerAccessory.setTargetHeaterCoolerState.bind(heaterCoolerAccessory).name
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[5].arguments[0],
        'get'
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[5].arguments[1].name,
        heaterCoolerAccessory.getCurrentTemperature.bind(heaterCoolerAccessory).name
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[6].arguments[0],
        'get'
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[6].arguments[1].name,
        heaterCoolerAccessory.getCoolingThresholdTemperature.bind(heaterCoolerAccessory).name
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[7].arguments[0],
        'set'
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[7].arguments[1].name,
        heaterCoolerAccessory.setCoolingThresholdTemperature.bind(heaterCoolerAccessory).name
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[8].arguments[0],
        'get'
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[8].arguments[1].name,
        heaterCoolerAccessory.getHeatingThresholdTemperature.bind(heaterCoolerAccessory).name
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[9].arguments[0],
        'set'
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[9].arguments[1].name,
        heaterCoolerAccessory.setHeatingThresholdTemperature.bind(heaterCoolerAccessory).name
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[10].arguments[0],
        'get'
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[10].arguments[1].name,
        heaterCoolerAccessory.getTemperatureDisplayUnits.bind(heaterCoolerAccessory).name
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[11].arguments[0],
        'set'
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[11].arguments[1].name,
        heaterCoolerAccessory.setTemperatureDisplayUnits.bind(heaterCoolerAccessory).name
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[12].arguments[0],
        'get'
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[12].arguments[1].name,
        heaterCoolerAccessory.getName.bind(heaterCoolerAccessory).name
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[13].arguments[0],
        'get'
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[13].arguments[1].name,
        heaterCoolerAccessory.getRotationSpeed.bind(heaterCoolerAccessory).name
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[14].arguments[0],
        'set'
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[14].arguments[1].name,
        heaterCoolerAccessory.setRotationSpeed.bind(heaterCoolerAccessory).name
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[15].arguments[0],
        'get'
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[15].arguments[1].name,
        heaterCoolerAccessory.getSwingMode.bind(heaterCoolerAccessory).name
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[16].arguments[0],
        'set'
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[16].arguments[1].name,
        heaterCoolerAccessory.setSwingMode.bind(heaterCoolerAccessory).name
    );

    mockHomebridge.resetMocks();
});

test('HeaterCoolerAccessory#getActive when getPowerState returns error', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getPowerState',
        (deviceId, callback) => {
            callback('getPowerState error', null);
        }
    );
    const heaterCoolerAccessory = new HeaterCoolerAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    heaterCoolerAccessory.getActive(function(error, value) {
        assert.strictEqual(error, 'getPowerState error');
        assert.strictEqual(value, null);

        mockHomebridge.resetMocks();

        done();
    });
});

test('HeaterCoolerAccessory#getActive when getPowerState returns ON', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getPowerState',
        (deviceId, callback) => {
            callback(null, airstage.constants.TOGGLE_ON);
        }
    );
    const heaterCoolerAccessory = new HeaterCoolerAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    heaterCoolerAccessory.getActive(function(error, value) {
        assert.strictEqual(error, null);
        assert.strictEqual(value, heaterCoolerAccessory.Characteristic.Active.ACTIVE);

        mockHomebridge.resetMocks();

        done();
    });
});

test('HeaterCoolerAccessory#getActive when getPowerState returns OFF', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getPowerState',
        (deviceId, callback) => {
            callback(null, airstage.constants.TOGGLE_OFF);
        }
    );
    const heaterCoolerAccessory = new HeaterCoolerAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    heaterCoolerAccessory.getActive(function(error, value) {
        assert.strictEqual(error, null);
        assert.strictEqual(value, heaterCoolerAccessory.Characteristic.Active.INACTIVE);

        mockHomebridge.resetMocks();

        done();
    });
});

test('HeaterCoolerAccessory#setActive when called with ACTIVE and setPowerState returns error', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'setPowerState',
        (deviceId, powerState, callback) => {
            callback('setPowerState error');
        }
    );
    const heaterCoolerAccessory = new HeaterCoolerAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    heaterCoolerAccessory.setActive(
        heaterCoolerAccessory.Characteristic.Active.ACTIVE,
        function(error) {
            assert.strictEqual(error, 'setPowerState error');

            mockHomebridge.resetMocks();

            done();
        }
    );
});

test('HeaterCoolerAccessory#setActive when called with ACTIVE', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'setPowerState',
        (deviceId, powerState, callback) => {
            assert.strictEqual(powerState, airstage.constants.TOGGLE_ON);

            callback(null);
        }
    );
    const heaterCoolerAccessory = new HeaterCoolerAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    heaterCoolerAccessory.setActive(
        heaterCoolerAccessory.Characteristic.Active.ACTIVE,
        function(error) {
            assert.strictEqual(error, null);

            mockHomebridge.resetMocks();

            done();
        }
    );
});

test('HeaterCoolerAccessory#setActive when called with INACTIVE and setPowerState returns error', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'setPowerState',
        (deviceId, powerState, callback) => {
            callback('setPowerState error');
        }
    );
    const heaterCoolerAccessory = new HeaterCoolerAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    heaterCoolerAccessory.setActive(
        heaterCoolerAccessory.Characteristic.Active.INACTIVE,
        function(error) {
            assert.strictEqual(error, 'setPowerState error');

            mockHomebridge.resetMocks();

            done();
        }
    );
});

test('HeaterCoolerAccessory#setActive when called with INACTIVE', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'setPowerState',
        (deviceId, powerState, callback) => {
            assert.strictEqual(powerState, airstage.constants.TOGGLE_OFF);

            callback(null);
        }
    );
    const heaterCoolerAccessory = new HeaterCoolerAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    heaterCoolerAccessory.setActive(
        heaterCoolerAccessory.Characteristic.Active.INACTIVE,
        function(error) {
            assert.strictEqual(error, null);

            mockHomebridge.resetMocks();

            done();
        }
    );
});

test('HeaterCoolerAccessory#getCurrentHeaterCoolerState when getPowerState returns error', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getPowerState',
        (deviceId, callback) => {
            callback('getPowerState error', null);
        }
    );
    const heaterCoolerAccessory = new HeaterCoolerAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    heaterCoolerAccessory.getCurrentHeaterCoolerState(function(error, value) {
        assert.strictEqual(error, 'getPowerState error');
        assert.strictEqual(value, null);

        mockHomebridge.resetMocks();

        done();
    });
});

test('HeaterCoolerAccessory#getCurrentHeaterCoolerState when getPowerState returns OFF', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getPowerState',
        (deviceId, callback) => {
            callback(null, airstage.constants.TOGGLE_OFF);
        }
    );
    const heaterCoolerAccessory = new HeaterCoolerAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    heaterCoolerAccessory.getCurrentHeaterCoolerState(function(error, value) {
        assert.strictEqual(error, null);
        assert.strictEqual(value, heaterCoolerAccessory.Characteristic.CurrentHeaterCoolerState.INACTIVE);

        mockHomebridge.resetMocks();

        done();
    });
});

test('HeaterCoolerAccessory#getCurrentHeaterCoolerState when getPowerState returns ON and getOperationMode returns error', (context, done) => {
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
    const heaterCoolerAccessory = new HeaterCoolerAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    heaterCoolerAccessory.getCurrentHeaterCoolerState(function(error, value) {
        assert.strictEqual(error, 'getOperationMode error');
        assert.strictEqual(value, null);

        mockHomebridge.resetMocks();

        done();
    });
});

test('HeaterCoolerAccessory#getCurrentHeaterCoolerState when getPowerState returns ON and getOperationMode returns AUTO with no temperature delta', (context, done) => {
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
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getTemperatureDelta',
        (deviceId, temperatureScale, callback) => {
            callback(null, 0);
        }
    );
    const heaterCoolerAccessory = new HeaterCoolerAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    heaterCoolerAccessory.getCurrentHeaterCoolerState(function(error, value) {
        assert.strictEqual(error, null);
        assert.strictEqual(value, heaterCoolerAccessory.Characteristic.CurrentHeaterCoolerState.IDLE);

        mockHomebridge.resetMocks();

        done();
    });
});

test('HeaterCoolerAccessory#getCurrentHeaterCoolerState when getPowerState returns ON and getOperationMode returns AUTO with positive temperature delta', (context, done) => {
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
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getTemperatureDelta',
        (deviceId, temperatureScale, callback) => {
            callback(null, 1);
        }
    );
    const heaterCoolerAccessory = new HeaterCoolerAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    heaterCoolerAccessory.getCurrentHeaterCoolerState(function(error, value) {
        assert.strictEqual(error, null);
        assert.strictEqual(value, heaterCoolerAccessory.Characteristic.CurrentHeaterCoolerState.COOLING);

        mockHomebridge.resetMocks();

        done();
    });
});

test('HeaterCoolerAccessory#getCurrentHeaterCoolerState when getPowerState returns ON and getOperationMode returns AUTO with negative temperature delta', (context, done) => {
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
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getTemperatureDelta',
        (deviceId, temperatureScale, callback) => {
            callback(null, -1);
        }
    );
    const heaterCoolerAccessory = new HeaterCoolerAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    heaterCoolerAccessory.getCurrentHeaterCoolerState(function(error, value) {
        assert.strictEqual(error, null);
        assert.strictEqual(value, heaterCoolerAccessory.Characteristic.CurrentHeaterCoolerState.HEATING);

        mockHomebridge.resetMocks();

        done();
    });
});

test('HeaterCoolerAccessory#getCurrentHeaterCoolerState when getPowerState returns ON and getOperationMode returns COOL', (context, done) => {
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
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getTemperatureDelta',
        (deviceId, temperatureScale, callback) => {
            callback(null, 1);
        }
    );
    const heaterCoolerAccessory = new HeaterCoolerAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    heaterCoolerAccessory.getCurrentHeaterCoolerState(function(error, value) {
        assert.strictEqual(error, null);
        assert.strictEqual(value, heaterCoolerAccessory.Characteristic.CurrentHeaterCoolerState.COOLING);

        mockHomebridge.resetMocks();

        done();
    });
});

test('HeaterCoolerAccessory#getCurrentHeaterCoolerState when getPowerState returns ON and getOperationMode returns DRY', (context, done) => {
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
        'getTemperatureDelta',
        (deviceId, temperatureScale, callback) => {
            callback(null, 1);
        }
    );
    const heaterCoolerAccessory = new HeaterCoolerAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    heaterCoolerAccessory.getCurrentHeaterCoolerState(function(error, value) {
        assert.strictEqual(error, null);
        assert.strictEqual(value, heaterCoolerAccessory.Characteristic.CurrentHeaterCoolerState.COOLING);

        mockHomebridge.resetMocks();

        done();
    });
});

test('HeaterCoolerAccessory#getCurrentHeaterCoolerState when getPowerState returns ON and getOperationMode returns FAN', (context, done) => {
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
        'getTemperatureDelta',
        (deviceId, temperatureScale, callback) => {
            callback(null, 0);
        }
    );
    const heaterCoolerAccessory = new HeaterCoolerAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    heaterCoolerAccessory.getCurrentHeaterCoolerState(function(error, value) {
        assert.strictEqual(error, null);
        assert.strictEqual(value, heaterCoolerAccessory.Characteristic.CurrentHeaterCoolerState.INACTIVE);

        mockHomebridge.resetMocks();

        done();
    });
});

test('HeaterCoolerAccessory#getCurrentHeaterCoolerState when getPowerState returns ON and getOperationMode returns HEAT', (context, done) => {
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
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getTemperatureDelta',
        (deviceId, temperatureScale, callback) => {
            callback(null, -1);
        }
    );
    const heaterCoolerAccessory = new HeaterCoolerAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    heaterCoolerAccessory.getCurrentHeaterCoolerState(function(error, value) {
        assert.strictEqual(error, null);
        assert.strictEqual(value, heaterCoolerAccessory.Characteristic.CurrentHeaterCoolerState.HEATING);

        mockHomebridge.resetMocks();

        done();
    });
});

test('HeaterCoolerAccessory#getTargetHeaterCoolerState when getOperationMode returns error', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getOperationMode',
        (deviceId, callback) => {
            callback('getOperationMode error', null);
        }
    );
    const heaterCoolerAccessory = new HeaterCoolerAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    heaterCoolerAccessory.getTargetHeaterCoolerState(function(error, value) {
        assert.strictEqual(error, 'getOperationMode error');
        assert.strictEqual(value, null);

        mockHomebridge.resetMocks();

        done();
    });
});

test('HeaterCoolerAccessory#getTargetHeaterCoolerState when getOperationMode returns AUTO', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getOperationMode',
        (deviceId, callback) => {
            callback(null, airstage.constants.OPERATION_MODE_AUTO);
        }
    );
    const heaterCoolerAccessory = new HeaterCoolerAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    heaterCoolerAccessory.getTargetHeaterCoolerState(function(error, value) {
        assert.strictEqual(error, null);
        assert.strictEqual(value, heaterCoolerAccessory.Characteristic.TargetHeaterCoolerState.AUTO);

        mockHomebridge.resetMocks();

        done();
    });
});

test('HeaterCoolerAccessory#getTargetHeaterCoolerState when getOperationMode returns COOL', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getOperationMode',
        (deviceId, callback) => {
            callback(null, airstage.constants.OPERATION_MODE_COOL);
        }
    );
    const heaterCoolerAccessory = new HeaterCoolerAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    heaterCoolerAccessory.getTargetHeaterCoolerState(function(error, value) {
        assert.strictEqual(error, null);
        assert.strictEqual(value, heaterCoolerAccessory.Characteristic.TargetHeaterCoolerState.COOL);

        mockHomebridge.resetMocks();

        done();
    });
});

test('HeaterCoolerAccessory#getTargetHeaterCoolerState when getOperationMode returns DRY', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getOperationMode',
        (deviceId, callback) => {
            callback(null, airstage.constants.OPERATION_MODE_DRY);
        }
    );
    const heaterCoolerAccessory = new HeaterCoolerAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    heaterCoolerAccessory.getTargetHeaterCoolerState(function(error, value) {
        assert.strictEqual(error, null);
        assert.strictEqual(value, heaterCoolerAccessory.Characteristic.TargetHeaterCoolerState.COOL);

        mockHomebridge.resetMocks();

        done();
    });
});

test('HeaterCoolerAccessory#getTargetHeaterCoolerState when getOperationMode returns HEAT', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getOperationMode',
        (deviceId, callback) => {
            callback(null, airstage.constants.OPERATION_MODE_HEAT);
        }
    );
    const heaterCoolerAccessory = new HeaterCoolerAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    heaterCoolerAccessory.getTargetHeaterCoolerState(function(error, value) {
        assert.strictEqual(error, null);
        assert.strictEqual(value, heaterCoolerAccessory.Characteristic.TargetHeaterCoolerState.HEAT);

        mockHomebridge.resetMocks();

        done();
    });
});

test('HeaterCoolerAccessory#setTargetHeaterCoolerState when setOperationMode returns error', (context, done) => {
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
    const heaterCoolerAccessory = new HeaterCoolerAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    heaterCoolerAccessory.setTargetHeaterCoolerState(
        heaterCoolerAccessory.Characteristic.TargetHeaterCoolerState.COOL,
        function(error) {
            assert.strictEqual(error, 'setOperationMode error');

            mockHomebridge.resetMocks();

            done();
        }
    );
});

test('HeaterCoolerAccessory#setTargetHeaterCoolerState when called with COOL', (context, done) => {
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
    const heaterCoolerAccessory = new HeaterCoolerAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    heaterCoolerAccessory.setTargetHeaterCoolerState(
        heaterCoolerAccessory.Characteristic.TargetHeaterCoolerState.COOL,
        function(error) {
            assert.strictEqual(error, null);

            mockHomebridge.resetMocks();

            done();
        }
    );
});

test('HeaterCoolerAccessory#setTargetHeaterCoolerState when called with HEAT', (context, done) => {
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
    const heaterCoolerAccessory = new HeaterCoolerAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    heaterCoolerAccessory.setTargetHeaterCoolerState(
        heaterCoolerAccessory.Characteristic.TargetHeaterCoolerState.HEAT,
        function(error) {
            assert.strictEqual(error, null);

            mockHomebridge.resetMocks();

            done();
        }
    );
});

test('HeaterCoolerAccessory#setTargetHeaterCoolerState when called with AUTO', (context, done) => {
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
    const heaterCoolerAccessory = new HeaterCoolerAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    heaterCoolerAccessory.setTargetHeaterCoolerState(
        heaterCoolerAccessory.Characteristic.TargetHeaterCoolerState.AUTO,
        function(error) {
            assert.strictEqual(error, null);

            mockHomebridge.resetMocks();

            done();
        }
    );
});

test('HeaterCoolerAccessory#setTargetHeaterCoolerState does not call setPowerState if device is already on', (context, done) => {
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
    const heaterCoolerAccessory = new HeaterCoolerAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    heaterCoolerAccessory.setTargetHeaterCoolerState(
        heaterCoolerAccessory.Characteristic.TargetHeaterCoolerState.AUTO,
        function(error) {
            assert.strictEqual(error, null);

            mockHomebridge.resetMocks();

            done();
        }
    );
});

test('HeaterCoolerAccessory#getCurrentTemperature when getIndoorTemperature returns error', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getIndoorTemperature',
        (deviceId, temperatureScale, callback) => {
            callback('getIndoorTemperature error', null);
        }
    );
    const heaterCoolerAccessory = new HeaterCoolerAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    heaterCoolerAccessory.getCurrentTemperature(function(error, value) {
        assert.strictEqual(error, 'getIndoorTemperature error');
        assert.strictEqual(value, null);

        mockHomebridge.resetMocks();

        done();
    });
});

test('HeaterCoolerAccessory#getCurrentTemperature when getIndoorTemperature returns 10', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getIndoorTemperature',
        (deviceId, temperatureScale, callback) => {
            assert.strictEqual(temperatureScale, airstage.constants.TEMPERATURE_SCALE_CELSIUS);

            callback(null, 10);
        }
    );
    const heaterCoolerAccessory = new HeaterCoolerAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    heaterCoolerAccessory.getCurrentTemperature(function(error, value) {
        assert.strictEqual(error, null);
        assert.strictEqual(value, 10);

        mockHomebridge.resetMocks();

        done();
    });
});

test('HeaterCoolerAccessory#getCoolingThresholdTemperature when getTargetTemperature returns error', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getTargetTemperature',
        (deviceId, temperatureScale, callback) => {
            callback('getTargetTemperature error', null);
        }
    );
    const heaterCoolerAccessory = new HeaterCoolerAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    heaterCoolerAccessory.getCoolingThresholdTemperature(function(error, value) {
        assert.strictEqual(error, 'getTargetTemperature error');
        assert.strictEqual(value, null);

        mockHomebridge.resetMocks();

        done();
    });
});

test('HeaterCoolerAccessory#getCoolingThresholdTemperature when getTargetTemperature returns 10', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getTargetTemperature',
        (deviceId, temperatureScale, callback) => {
            assert.strictEqual(temperatureScale, airstage.constants.TEMPERATURE_SCALE_CELSIUS);

            callback(null, 10);
        }
    );
    const heaterCoolerAccessory = new HeaterCoolerAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    heaterCoolerAccessory.getCoolingThresholdTemperature(function(error, value) {
        assert.strictEqual(error, null);
        assert.strictEqual(value, 10);

        mockHomebridge.resetMocks();

        done();
    });
});

test('HeaterCoolerAccessory#setCoolingThresholdTemperature when getOperationMode returns error', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getOperationMode',
        (deviceId, callback) => {
            callback('getOperationMode error', null);
        }
    );
    context.mock.method(
        platformAccessory.context.airstageClient,
        'setTargetTemperature',
        (deviceId, value, temperatureScale, callback) => {
            callback(null);
        }
    );
    const heaterCoolerAccessory = new HeaterCoolerAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    heaterCoolerAccessory.setCoolingThresholdTemperature(10, function(error) {
        assert.strictEqual(error, 'getOperationMode error');

        mockHomebridge.resetMocks();

        done();
    });
});

test('HeaterCoolerAccessory#setCoolingThresholdTemperature when setTargetTemperature returns error', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getOperationMode',
        (deviceId, callback) => {
            callback(null, airstage.constants.OPERATION_MODE_COOL);
        }
    );
    context.mock.method(
        platformAccessory.context.airstageClient,
        'setTargetTemperature',
        (deviceId, value, temperatureScale, callback) => {
            callback('setTargetTemperature error');
        }
    );
    const heaterCoolerAccessory = new HeaterCoolerAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    heaterCoolerAccessory.setCoolingThresholdTemperature(10, function(error) {
        assert.strictEqual(error, 'setTargetTemperature error');

        mockHomebridge.resetMocks();

        done();
    });
});

test('HeaterCoolerAccessory#setCoolingThresholdTemperature when temperature is 20', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getOperationMode',
        (deviceId, callback) => {
            callback(null, airstage.constants.OPERATION_MODE_COOL);
        }
    );
    context.mock.method(
        platformAccessory.context.airstageClient,
        'setTargetTemperature',
        (deviceId, value, temperatureScale, callback) => {
            assert.strictEqual(value, 20);
            assert.strictEqual(temperatureScale, airstage.constants.TEMPERATURE_SCALE_CELSIUS);

            callback(null);
        }
    );
    const heaterCoolerAccessory = new HeaterCoolerAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    heaterCoolerAccessory.setCoolingThresholdTemperature(20, function(error) {
        assert.strictEqual(error, null);

        mockHomebridge.resetMocks();

        done();
    });
});

test('HeaterCoolerAccessory#getHeatingThresholdTemperature when getTargetTemperature returns error', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getTargetTemperature',
        (deviceId, temperatureScale, callback) => {
            callback('getTargetTemperature error', null);
        }
    );
    const heaterCoolerAccessory = new HeaterCoolerAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    heaterCoolerAccessory.getHeatingThresholdTemperature(function(error, value) {
        assert.strictEqual(error, 'getTargetTemperature error');
        assert.strictEqual(value, null);

        mockHomebridge.resetMocks();

        done();
    });
});

test('HeaterCoolerAccessory#getHeatingThresholdTemperature when getTargetTemperature returns 10', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getTargetTemperature',
        (deviceId, temperatureScale, callback) => {
            assert.strictEqual(temperatureScale, airstage.constants.TEMPERATURE_SCALE_CELSIUS);

            callback(null, 10);
        }
    );
    const heaterCoolerAccessory = new HeaterCoolerAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    heaterCoolerAccessory.getHeatingThresholdTemperature(function(error, value) {
        assert.strictEqual(error, null);
        assert.strictEqual(value, 10);

        mockHomebridge.resetMocks();

        done();
    });
});

test('HeaterCoolerAccessory#setHeatingThresholdTemperature when getOperationMode returns error', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getOperationMode',
        (deviceId, callback) => {
            callback('getOperationMode error', null);
        }
    );
    context.mock.method(
        platformAccessory.context.airstageClient,
        'setTargetTemperature',
        (deviceId, value, temperatureScale, callback) => {
            callback(null);
        }
    );
    const heaterCoolerAccessory = new HeaterCoolerAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    heaterCoolerAccessory.setHeatingThresholdTemperature(10, function(error) {
        assert.strictEqual(error, 'getOperationMode error');

        mockHomebridge.resetMocks();

        done();
    });
});

test('HeaterCoolerAccessory#setHeatingThresholdTemperature when setTargetTemperature returns error', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getOperationMode',
        (deviceId, callback) => {
            callback(null, airstage.constants.OPERATION_MODE_HEAT);
        }
    );
    context.mock.method(
        platformAccessory.context.airstageClient,
        'setTargetTemperature',
        (deviceId, value, temperatureScale, callback) => {
            callback('setTargetTemperature error');
        }
    );
    const heaterCoolerAccessory = new HeaterCoolerAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    heaterCoolerAccessory.setHeatingThresholdTemperature(10, function(error) {
        assert.strictEqual(error, 'setTargetTemperature error');

        mockHomebridge.resetMocks();

        done();
    });
});

test('HeaterCoolerAccessory#setHeatingThresholdTemperature when temperature is 20', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getOperationMode',
        (deviceId, callback) => {
            callback(null, airstage.constants.OPERATION_MODE_HEAT);
        }
    );
    context.mock.method(
        platformAccessory.context.airstageClient,
        'setTargetTemperature',
        (deviceId, value, temperatureScale, callback) => {
            assert.strictEqual(value, 20);
            assert.strictEqual(temperatureScale, airstage.constants.TEMPERATURE_SCALE_CELSIUS);

            callback(null);
        }
    );
    const heaterCoolerAccessory = new HeaterCoolerAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    heaterCoolerAccessory.setHeatingThresholdTemperature(20, function(error) {
        assert.strictEqual(error, null);

        mockHomebridge.resetMocks();

        done();
    });
});

test('HeaterCoolerAccessory#getTemperatureDisplayUnits when getTemperatureScale returns error', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getTemperatureScale',
        (callback) => {
            callback('getTemperatureScale error', null);
        }
    );
    const heaterCoolerAccessory = new HeaterCoolerAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    heaterCoolerAccessory.getTemperatureDisplayUnits(function(error, value) {
        assert.strictEqual(error, 'getTemperatureScale error');
        assert.strictEqual(value, null);

        mockHomebridge.resetMocks();

        done();
    });
});

test('HeaterCoolerAccessory#getTemperatureDisplayUnits when getTemperatureScale returns FAHRENHEIT', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getTemperatureScale',
        (callback) => {
            callback(null, airstage.constants.TEMPERATURE_SCALE_FAHRENHEIT);
        }
    );
    const heaterCoolerAccessory = new HeaterCoolerAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    heaterCoolerAccessory.getTemperatureDisplayUnits(function(error, value) {
        assert.strictEqual(error, null);
        assert.strictEqual(value, heaterCoolerAccessory.Characteristic.TemperatureDisplayUnits.FAHRENHEIT);

        mockHomebridge.resetMocks();

        done();
    });
});

test('HeaterCoolerAccessory#getTemperatureDisplayUnits when getTemperatureScale returns CELSIUS', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getTemperatureScale',
        (callback) => {
            callback(null, airstage.constants.TEMPERATURE_SCALE_CELSIUS);
        }
    );
    const heaterCoolerAccessory = new HeaterCoolerAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    heaterCoolerAccessory.getTemperatureDisplayUnits(function(error, value) {
        assert.strictEqual(error, null);
        assert.strictEqual(value, heaterCoolerAccessory.Characteristic.TemperatureDisplayUnits.CELSIUS);

        mockHomebridge.resetMocks();

        done();
    });
});

test('HeaterCoolerAccessory#setTemperatureDisplayUnits when setTemperatureScale returns error', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'setTemperatureScale',
        (temperatureScale, callback) => {
            callback('setTemperatureScale error');
        }
    );
    const heaterCoolerAccessory = new HeaterCoolerAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    heaterCoolerAccessory.setTemperatureDisplayUnits(
        heaterCoolerAccessory.Characteristic.TemperatureDisplayUnits.FAHRENHEIT,
        function(error) {
            assert.strictEqual(error, 'setTemperatureScale error');

            mockHomebridge.resetMocks();

            done();
        }
    );
});

test('HeaterCoolerAccessory#setTemperatureDisplayUnits when called with FAHRENHEIT', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'setTemperatureScale',
        (temperatureScale, callback) => {
            assert.strictEqual(temperatureScale, airstage.constants.TEMPERATURE_SCALE_FAHRENHEIT);

            callback(null);
        }
    );
    const heaterCoolerAccessory = new HeaterCoolerAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    heaterCoolerAccessory.setTemperatureDisplayUnits(
        heaterCoolerAccessory.Characteristic.TemperatureDisplayUnits.FAHRENHEIT,
        function(error) {
            assert.strictEqual(error, null);

            mockHomebridge.resetMocks();

            done();
        }
    );
});

test('HeaterCoolerAccessory#setTemperatureDisplayUnits when called with CELSIUS', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'setTemperatureScale',
        (temperatureScale, callback) => {
            assert.strictEqual(temperatureScale, airstage.constants.TEMPERATURE_SCALE_CELSIUS);

            callback(null);
        }
    );
    const heaterCoolerAccessory = new HeaterCoolerAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    heaterCoolerAccessory.setTemperatureDisplayUnits(
        heaterCoolerAccessory.Characteristic.TemperatureDisplayUnits.CELSIUS,
        function(error) {
            assert.strictEqual(error, null);

            mockHomebridge.resetMocks();

            done();
        }
    );
});

test('HeaterCoolerAccessory#getName when getName returns error', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getName',
        (deviceId, callback) => {
            callback('getName error', null);
        }
    );
    const heaterCoolerAccessory = new HeaterCoolerAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    heaterCoolerAccessory.getName(function(error, name) {
        assert.strictEqual(error, 'getName error');
        assert.strictEqual(name, null);

        mockHomebridge.resetMocks();

        done();
    });
});

test('HeaterCoolerAccessory#getName returns name with expected suffix', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getName',
        (deviceId, callback) => {
            callback(null, 'Test Device');
        }
    );
    const heaterCoolerAccessory = new HeaterCoolerAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    heaterCoolerAccessory.getName(function(error, name) {
        assert.strictEqual(error, null);
        assert.strictEqual(name, 'Test Device Heater Cooler');

        mockHomebridge.resetMocks();

        done();
    });
});

test('HeaterCoolerAccessory#getRotationSpeed when getFanSpeed returns error', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getFanSpeed',
        (deviceId, callback) => {
            callback('getFanSpeed error', null);
        }
    );
    const heaterCoolerAccessory = new HeaterCoolerAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    heaterCoolerAccessory.getRotationSpeed(function(error, value) {
        assert.strictEqual(error, 'getFanSpeed error');
        assert.strictEqual(value, null);

        mockHomebridge.resetMocks();

        done();
    });
});

test('HeaterCoolerAccessory#getRotationSpeed when getFanSpeed returns AUTO', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getFanSpeed',
        (deviceId, callback) => {
            callback(null, airstage.constants.FAN_SPEED_AUTO);
        }
    );
    const heaterCoolerAccessory = new HeaterCoolerAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    heaterCoolerAccessory.getRotationSpeed(function(error, value) {
        assert.strictEqual(error, null);
        assert.strictEqual(value, 0);

        mockHomebridge.resetMocks();

        done();
    });
});

test('HeaterCoolerAccessory#getRotationSpeed when getFanSpeed returns QUIET', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getFanSpeed',
        (deviceId, callback) => {
            callback(null, airstage.constants.FAN_SPEED_QUIET);
        }
    );
    const heaterCoolerAccessory = new HeaterCoolerAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    heaterCoolerAccessory.getRotationSpeed(function(error, value) {
        assert.strictEqual(error, null);
        assert.strictEqual(value, 25);

        mockHomebridge.resetMocks();

        done();
    });
});

test('HeaterCoolerAccessory#getRotationSpeed when getFanSpeed returns LOW', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getFanSpeed',
        (deviceId, callback) => {
            callback(null, airstage.constants.FAN_SPEED_LOW);
        }
    );
    const heaterCoolerAccessory = new HeaterCoolerAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    heaterCoolerAccessory.getRotationSpeed(function(error, value) {
        assert.strictEqual(error, null);
        assert.strictEqual(value, 50);

        mockHomebridge.resetMocks();

        done();
    });
});

test('HeaterCoolerAccessory#getRotationSpeed when getFanSpeed returns MEDIUM', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getFanSpeed',
        (deviceId, callback) => {
            callback(null, airstage.constants.FAN_SPEED_MEDIUM);
        }
    );
    const heaterCoolerAccessory = new HeaterCoolerAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    heaterCoolerAccessory.getRotationSpeed(function(error, value) {
        assert.strictEqual(error, null);
        assert.strictEqual(value, 75);

        mockHomebridge.resetMocks();

        done();
    });
});

test('HeaterCoolerAccessory#getRotationSpeed when getFanSpeed returns HIGH', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getFanSpeed',
        (deviceId, callback) => {
            callback(null, airstage.constants.FAN_SPEED_HIGH);
        }
    );
    const heaterCoolerAccessory = new HeaterCoolerAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    heaterCoolerAccessory.getRotationSpeed(function(error, value) {
        assert.strictEqual(error, null);
        assert.strictEqual(value, 100);

        mockHomebridge.resetMocks();

        done();
    });
});

test('HeaterCoolerAccessory#setRotationSpeed when setFanSpeed returns error', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'setFanSpeed',
        (deviceId, fanSpeed, callback) => {
            callback('setFanSpeed error', null);
        }
    );
    const heaterCoolerAccessory = new HeaterCoolerAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    heaterCoolerAccessory.setRotationSpeed(
        24.999,
        function(error) {
            assert.strictEqual(error, 'setFanSpeed error');

            mockHomebridge.resetMocks();

            done();
        },
        false
    );
});

test('HeaterCoolerAccessory#setRotationSpeed when called with 24.999', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'setFanSpeed',
        (deviceId, fanSpeed, callback) => {
            assert.strictEqual(fanSpeed, airstage.constants.FAN_SPEED_QUIET);

            callback(null);
        }
    );
    const heaterCoolerAccessory = new HeaterCoolerAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    heaterCoolerAccessory.setRotationSpeed(
        24.999,
        function(error) {
            assert.strictEqual(error, null);

            mockHomebridge.resetMocks();

            done();
        },
        false
    );
});

test('HeaterCoolerAccessory#setRotationSpeed when called with 49.999', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'setFanSpeed',
        (deviceId, fanSpeed, callback) => {
            assert.strictEqual(fanSpeed, airstage.constants.FAN_SPEED_LOW);

            callback(null);
        }
    );
    const heaterCoolerAccessory = new HeaterCoolerAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    heaterCoolerAccessory.setRotationSpeed(
        49.999,
        function(error) {
            assert.strictEqual(error, null);

            mockHomebridge.resetMocks();

            done();
        },
        false
    );
});

test('HeaterCoolerAccessory#setRotationSpeed when called with 74.999', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'setFanSpeed',
        (deviceId, fanSpeed, callback) => {
            assert.strictEqual(fanSpeed, airstage.constants.FAN_SPEED_MEDIUM);

            callback(null);
        }
    );
    const heaterCoolerAccessory = new HeaterCoolerAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    heaterCoolerAccessory.setRotationSpeed(
        74.999,
        function(error) {
            assert.strictEqual(error, null);

            mockHomebridge.resetMocks();

            done();
        },
        false
    );
});

test('HeaterCoolerAccessory#setRotationSpeed when called with 99.999', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'setFanSpeed',
        (deviceId, fanSpeed, callback) => {
            assert.strictEqual(fanSpeed, airstage.constants.FAN_SPEED_HIGH);

            callback(null);
        }
    );
    const heaterCoolerAccessory = new HeaterCoolerAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    heaterCoolerAccessory.setRotationSpeed(
        99.999,
        function(error) {
            assert.strictEqual(error, null);

            mockHomebridge.resetMocks();

            done();
        },
        false
    );
});

test('HeaterCoolerAccessory#getSwingMode when getAirflowVerticalSwingState returns error', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getAirflowVerticalSwingState',
        (deviceId, callback) => {
            callback('getAirflowVerticalSwingState error', null);
        }
    );
    const heaterCoolerAccessory = new HeaterCoolerAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    heaterCoolerAccessory.getSwingMode(function(error, value) {
        assert.strictEqual(error, 'getAirflowVerticalSwingState error');
        assert.strictEqual(value, null);

        mockHomebridge.resetMocks();

        done();
    });
});

test('HeaterCoolerAccessory#getSwingMode when getAirflowVerticalSwingState returns ON', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getAirflowVerticalSwingState',
        (deviceId, callback) => {
            callback(null, airstage.constants.TOGGLE_ON);
        }
    );
    const heaterCoolerAccessory = new HeaterCoolerAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    heaterCoolerAccessory.getSwingMode(function(error, value) {
        assert.strictEqual(error, null);
        assert.strictEqual(value, heaterCoolerAccessory.Characteristic.SwingMode.SWING_ENABLED);

        mockHomebridge.resetMocks();

        done();
    });
});

test('HeaterCoolerAccessory#getSwingMode when getAirflowVerticalSwingState returns OFF', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getAirflowVerticalSwingState',
        (deviceId, callback) => {
            callback(null, airstage.constants.TOGGLE_OFF);
        }
    );
    const heaterCoolerAccessory = new HeaterCoolerAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    heaterCoolerAccessory.getSwingMode(function(error, value) {
        assert.strictEqual(error, null);
        assert.strictEqual(value, heaterCoolerAccessory.Characteristic.SwingMode.SWING_DISABLED);

        mockHomebridge.resetMocks();

        done();
    });
});

test('HeaterCoolerAccessory#setSwingMode when setAirflowVerticalSwingState returns error', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'setAirflowVerticalSwingState',
        (deviceId, powerState, callback) => {
            callback('setAirflowVerticalSwingState error');
        }
    );
    const heaterCoolerAccessory = new HeaterCoolerAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    heaterCoolerAccessory.setSwingMode(heaterCoolerAccessory.Characteristic.SwingMode.SWING_ENABLED, function(error) {
        assert.strictEqual(error, 'setAirflowVerticalSwingState error');

        mockHomebridge.resetMocks();

        done();
    });
});

test('HeaterCoolerAccessory#setSwingMode called with SWING_ENABLED', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'setAirflowVerticalSwingState',
        (deviceId, powerState, callback) => {
            assert.strictEqual(powerState, airstage.constants.TOGGLE_ON);

            callback(null);
        }
    );
    const heaterCoolerAccessory = new HeaterCoolerAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    heaterCoolerAccessory.setSwingMode(heaterCoolerAccessory.Characteristic.SwingMode.SWING_ENABLED, function(error) {
        assert.strictEqual(error, null);

        mockHomebridge.resetMocks();

        done();
    });
});

test('HeaterCoolerAccessory#setSwingMode called with SWING_DISABLED', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'setAirflowVerticalSwingState',
        (deviceId, powerState, callback) => {
            assert.strictEqual(powerState, airstage.constants.TOGGLE_OFF);

            callback(null);
        }
    );
    const heaterCoolerAccessory = new HeaterCoolerAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    heaterCoolerAccessory.setSwingMode(heaterCoolerAccessory.Characteristic.SwingMode.SWING_DISABLED, function(error) {
        assert.strictEqual(error, null);

        mockHomebridge.resetMocks();

        done();
    });
});
