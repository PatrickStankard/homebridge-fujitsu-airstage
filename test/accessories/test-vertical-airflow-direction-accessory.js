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
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[2].arguments[0],
        'get'
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[2].arguments[1].name,
        verticalAirflowDirectionAccessory.getCurrentFanState.bind(verticalAirflowDirectionAccessory).name
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[3].arguments[0],
        'get'
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[3].arguments[1].name,
        verticalAirflowDirectionAccessory.getName.bind(verticalAirflowDirectionAccessory).name
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[4].arguments[0],
        'get'
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[4].arguments[1].name,
        verticalAirflowDirectionAccessory.getRotationSpeed.bind(verticalAirflowDirectionAccessory).name
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[5].arguments[0],
        'set'
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[5].arguments[1].name,
        verticalAirflowDirectionAccessory.setRotationSpeed.bind(verticalAirflowDirectionAccessory).name
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
    const verticalAirflowDirectionAccessory = new VerticalAirflowDirectionAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    verticalAirflowDirectionAccessory.setActive(verticalAirflowDirectionAccessory.Characteristic.Active.ACTIVE, function(error) {
        assert.strictEqual(error, 'getPowerState error');

        mockHomebridge.resetMocks();

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
    const verticalAirflowDirectionAccessory = new VerticalAirflowDirectionAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    verticalAirflowDirectionAccessory.setActive(verticalAirflowDirectionAccessory.Characteristic.Active.ACTIVE, function(error) {
        assert.strictEqual(error, 'setPowerState error');

        mockHomebridge.resetMocks();

        done();
    });
});

test('VerticalAirflowDirectionAccessory#setActive when getPowerState returns OFF and setAirflowVerticalSwingState returns error', (context, done) => {
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
        'setAirflowVerticalSwingState',
        (deviceId, value, callback) => {
            callback('setAirflowVerticalSwingState error');
        }
    );
    const verticalAirflowDirectionAccessory = new VerticalAirflowDirectionAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    verticalAirflowDirectionAccessory.setActive(
        verticalAirflowDirectionAccessory.Characteristic.Active.ACTIVE,
        function(error) {
            assert.strictEqual(error, 'setAirflowVerticalSwingState error');

            mockHomebridge.resetMocks();

            done();
        }
    );
});

test('VerticalAirflowDirectionAccessory#setActive when called with ACTIVE and getPowerState returns OFF', (context, done) => {
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
        'setAirflowVerticalSwingState',
        (deviceId, value, callback) => {
            assert.strictEqual(value, airstage.constants.TOGGLE_OFF);

            callback(null);
        }
    );
    const verticalAirflowDirectionAccessory = new VerticalAirflowDirectionAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    verticalAirflowDirectionAccessory.setActive(
        verticalAirflowDirectionAccessory.Characteristic.Active.ACTIVE,
        function(error) {
            assert.strictEqual(error, null);

            mockHomebridge.resetMocks();

            done();
        }
    );
});

test('VerticalAirflowDirectionAccessory#setActive when called with INACTIVE and getPowerState returns OFF', (context, done) => {
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
        'setAirflowVerticalSwingState',
        (deviceId, value, callback) => {
            assert.strictEqual(value, airstage.constants.TOGGLE_ON);

            callback(null);
        }
    );
    const verticalAirflowDirectionAccessory = new VerticalAirflowDirectionAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    verticalAirflowDirectionAccessory.setActive(
        verticalAirflowDirectionAccessory.Characteristic.Active.INACTIVE,
        function(error) {
            assert.strictEqual(error, null);

            mockHomebridge.resetMocks();

            done();
        }
    );
});

test('VerticalAirflowDirectionAccessory#setActive when called with ACTIVE and getPowerState returns ON', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getPowerState',
        (deviceId, callback) => {
            callback(null, airstage.constants.TOGGLE_ON);
        }
    );
    context.mock.method(
        platformAccessory.context.airstageClient,
        'setAirflowVerticalSwingState',
        (deviceId, value, callback) => {
            assert.strictEqual(value, airstage.constants.TOGGLE_OFF);

            callback(null);
        }
    );
    const verticalAirflowDirectionAccessory = new VerticalAirflowDirectionAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    verticalAirflowDirectionAccessory.setActive(
        verticalAirflowDirectionAccessory.Characteristic.Active.ACTIVE,
        function(error) {
            assert.strictEqual(error, null);

            mockHomebridge.resetMocks();

            done();
        }
    );
});

test('VerticalAirflowDirectionAccessory#setActive when called with INACTIVE and getPowerState returns ON', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getPowerState',
        (deviceId, callback) => {
            callback(null, airstage.constants.TOGGLE_ON);
        }
    );
    context.mock.method(
        platformAccessory.context.airstageClient,
        'setAirflowVerticalSwingState',
        (deviceId, value, callback) => {
            assert.strictEqual(value, airstage.constants.TOGGLE_ON);

            callback(null);
        }
    );
    const verticalAirflowDirectionAccessory = new VerticalAirflowDirectionAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    verticalAirflowDirectionAccessory.setActive(
        verticalAirflowDirectionAccessory.Characteristic.Active.INACTIVE,
        function(error) {
            assert.strictEqual(error, null);

            mockHomebridge.resetMocks();

            done();
        }
    );
});

test('VerticalAirflowDirectionAccessory#getCurrentFanState when getPowerState returns error', (context, done) => {
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

    verticalAirflowDirectionAccessory.getCurrentFanState(function(error, value) {
        assert.strictEqual(error, 'getPowerState error');
        assert.strictEqual(value, null);

        mockHomebridge.resetMocks();

        done();
    });
});

test('VerticalAirflowDirectionAccessory#getCurrentFanState when getPowerState returns ON and getAirflowVerticalSwingState returns error', (context, done) => {
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

    verticalAirflowDirectionAccessory.getCurrentFanState(function(error, value) {
        assert.strictEqual(error, 'getAirflowVerticalSwingState error');
        assert.strictEqual(value, null);

        mockHomebridge.resetMocks();

        done();
    });
});

test('VerticalAirflowDirectionAccessory#getCurrentFanState when getPowerState returns ON and getAirflowVerticalSwingState returns OFF', (context, done) => {
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

    verticalAirflowDirectionAccessory.getCurrentFanState(function(error, value) {
        assert.strictEqual(error, null);
        assert.strictEqual(value, verticalAirflowDirectionAccessory.Characteristic.CurrentFanState.BLOWING_AIR);

        mockHomebridge.resetMocks();

        done();
    });
});

test('VerticalAirflowDirectionAccessory#getCurrentFanState when getPowerState returns ON and getAirflowVerticalSwingState returns ON', (context, done) => {
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

    verticalAirflowDirectionAccessory.getCurrentFanState(function(error, value) {
        assert.strictEqual(error, null);
        assert.strictEqual(value, verticalAirflowDirectionAccessory.Characteristic.CurrentFanState.IDLE);

        mockHomebridge.resetMocks();

        done();
    });
});

test('VerticalAirflowDirectionAccessory#getCurrentFanState when getPowerState returns OFF', (context, done) => {
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

    verticalAirflowDirectionAccessory.getCurrentFanState(function(error, value) {
        assert.strictEqual(error, null);
        assert.strictEqual(value, verticalAirflowDirectionAccessory.Characteristic.CurrentFanState.INACTIVE);

        mockHomebridge.resetMocks();

        done();
    });
});

test('VerticalAirflowDirectionAccessory#getRotationSpeed when getPowerState returns error', (context, done) => {
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

    verticalAirflowDirectionAccessory.getRotationSpeed(function(error, value) {
        assert.strictEqual(error, 'getPowerState error');
        assert.strictEqual(value, null);

        mockHomebridge.resetMocks();

        done();
    });
});

test('VerticalAirflowDirectionAccessory#getRotationSpeed when getPowerState returns ON and getAirflowVerticalDirection returns error', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getPowerState',
        (deviceId, callback) => {
            callback(null, airstage.constants.TOGGLE_ON);
        }
    );
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getAirflowVerticalDirection',
        (deviceId, callback) => {
            callback('getAirflowVerticalDirection error', null);
        }
    );
    const verticalAirflowDirectionAccessory = new VerticalAirflowDirectionAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    verticalAirflowDirectionAccessory.getRotationSpeed(function(error, value) {
        assert.strictEqual(error, 'getAirflowVerticalDirection error');
        assert.strictEqual(value, null);

        mockHomebridge.resetMocks();

        done();
    });
});

test('VerticalAirflowDirectionAccessory#getRotationSpeed when getPowerState returns ON and getAirflowVerticalDirection returns 1', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getPowerState',
        (deviceId, callback) => {
            callback(null, airstage.constants.TOGGLE_ON);
        }
    );
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getAirflowVerticalDirection',
        (deviceId, callback) => {
            callback(null, 1);
        }
    );
    const verticalAirflowDirectionAccessory = new VerticalAirflowDirectionAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    verticalAirflowDirectionAccessory.getRotationSpeed(function(error, value) {
        assert.strictEqual(error, null);
        assert.strictEqual(value, 25);

        mockHomebridge.resetMocks();

        done();
    });
});

test('VerticalAirflowDirectionAccessory#getRotationSpeed when getPowerState returns ON and getAirflowVerticalDirection returns 2', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getPowerState',
        (deviceId, callback) => {
            callback(null, airstage.constants.TOGGLE_ON);
        }
    );
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getAirflowVerticalDirection',
        (deviceId, callback) => {
            callback(null, 2);
        }
    );
    const verticalAirflowDirectionAccessory = new VerticalAirflowDirectionAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    verticalAirflowDirectionAccessory.getRotationSpeed(function(error, value) {
        assert.strictEqual(error, null);
        assert.strictEqual(value, 50);

        mockHomebridge.resetMocks();

        done();
    });
});

test('VerticalAirflowDirectionAccessory#getRotationSpeed when getPowerState returns ON and getAirflowVerticalDirection returns 3', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getPowerState',
        (deviceId, callback) => {
            callback(null, airstage.constants.TOGGLE_ON);
        }
    );
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getAirflowVerticalDirection',
        (deviceId, callback) => {
            callback(null, 3);
        }
    );
    const verticalAirflowDirectionAccessory = new VerticalAirflowDirectionAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    verticalAirflowDirectionAccessory.getRotationSpeed(function(error, value) {
        assert.strictEqual(error, null);
        assert.strictEqual(value, 75);

        mockHomebridge.resetMocks();

        done();
    });
});

test('VerticalAirflowDirectionAccessory#getRotationSpeed when getPowerState returns ON and getAirflowVerticalDirection returns 4', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getPowerState',
        (deviceId, callback) => {
            callback(null, airstage.constants.TOGGLE_ON);
        }
    );
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getAirflowVerticalDirection',
        (deviceId, callback) => {
            callback(null, 4);
        }
    );
    const verticalAirflowDirectionAccessory = new VerticalAirflowDirectionAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    verticalAirflowDirectionAccessory.getRotationSpeed(function(error, value) {
        assert.strictEqual(error, null);
        assert.strictEqual(value, 100);

        mockHomebridge.resetMocks();

        done();
    });
});

test('VerticalAirflowDirectionAccessory#getRotationSpeed when getPowerState returns OFF', (context, done) => {
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

    verticalAirflowDirectionAccessory.getRotationSpeed(function(error, value) {
        assert.strictEqual(error, null);
        assert.strictEqual(value, 0);

        mockHomebridge.resetMocks();

        done();
    });
});

test('VerticalAirflowDirectionAccessory#setRotationSpeed when setAirflowVerticalDirection returns error', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'setAirflowVerticalDirection',
        (deviceId, airflowVerticalDirection, callback) => {
            callback('setAirflowVerticalDirection error');
        }
    );
    const verticalAirflowDirectionAccessory = new VerticalAirflowDirectionAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    verticalAirflowDirectionAccessory.setRotationSpeed(
        24.999,
        function(error) {
            assert.strictEqual(error, 'setAirflowVerticalDirection error');

            mockHomebridge.resetMocks();

            done();
        },
        false
    );
});

test('VerticalAirflowDirectionAccessory#setRotationSpeed when called with 24.999', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'setAirflowVerticalDirection',
        (deviceId, airflowVerticalDirection, callback) => {
            assert.strictEqual(airflowVerticalDirection, 1);

            callback(null);
        }
    );
    const verticalAirflowDirectionAccessory = new VerticalAirflowDirectionAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    verticalAirflowDirectionAccessory.setRotationSpeed(
        24.999,
        function(error) {
            assert.strictEqual(error, null);

            mockHomebridge.resetMocks();

            done();
        },
        false
    );
});

test('VerticalAirflowDirectionAccessory#setRotationSpeed when called with 49.999', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'setAirflowVerticalDirection',
        (deviceId, airflowVerticalDirection, callback) => {
            assert.strictEqual(airflowVerticalDirection, 2);

            callback(null);
        }
    );
    const verticalAirflowDirectionAccessory = new VerticalAirflowDirectionAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    verticalAirflowDirectionAccessory.setRotationSpeed(
        49.999,
        function(error) {
            assert.strictEqual(error, null);

            mockHomebridge.resetMocks();

            done();
        },
        false
    );
});

test('VerticalAirflowDirectionAccessory#setRotationSpeed when called with 74.999', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'setAirflowVerticalDirection',
        (deviceId, airflowVerticalDirection, callback) => {
            assert.strictEqual(airflowVerticalDirection, 3);

            callback(null);
        }
    );
    const verticalAirflowDirectionAccessory = new VerticalAirflowDirectionAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    verticalAirflowDirectionAccessory.setRotationSpeed(
        74.999,
        function(error) {
            assert.strictEqual(error, null);

            mockHomebridge.resetMocks();

            done();
        },
        false
    );
});

test('VerticalAirflowDirectionAccessory#setRotationSpeed when called with 99.999', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'setAirflowVerticalDirection',
        (deviceId, airflowVerticalDirection, callback) => {
            assert.strictEqual(airflowVerticalDirection, 4);

            callback(null);
        }
    );
    const verticalAirflowDirectionAccessory = new VerticalAirflowDirectionAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    verticalAirflowDirectionAccessory.setRotationSpeed(
        99.999,
        function(error) {
            assert.strictEqual(error, null);

            mockHomebridge.resetMocks();

            done();
        },
        false
    );
});

test('VerticalAirflowDirectionAccessory#getName when getName returns error', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getName',
        (deviceId, callback) => {
            callback('getName error', null);
        }
    );
    const verticalAirflowDirectionAccessory = new VerticalAirflowDirectionAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    verticalAirflowDirectionAccessory.getName(function(error, name) {
        assert.strictEqual(error, 'getName error');
        assert.strictEqual(name, null);

        mockHomebridge.resetMocks();

        done();
    });
});

test('VerticalAirflowDirectionAccessory#getName returns name with expected suffix', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getName',
        (deviceId, callback) => {
            callback(null, 'Test Device');
        }
    );
    const verticalAirflowDirectionAccessory = new VerticalAirflowDirectionAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    verticalAirflowDirectionAccessory.getName(function(error, name) {
        assert.strictEqual(error, null);
        assert.strictEqual(name, 'Test Device Vertical Airflow Direction');

        mockHomebridge.resetMocks();

        done();
    });
});
