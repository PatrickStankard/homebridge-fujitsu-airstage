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
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[2].arguments[0],
        'get'
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[2].arguments[1].name,
        fanAccessory.getCurrentFanState.bind(fanAccessory).name
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[3].arguments[0],
        'get'
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[3].arguments[1].name,
        fanAccessory.getTargetFanState.bind(fanAccessory).name
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[4].arguments[0],
        'set'
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[4].arguments[1].name,
        fanAccessory.setTargetFanState.bind(fanAccessory).name
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[5].arguments[0],
        'get'
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[5].arguments[1].name,
        fanAccessory.getName.bind(fanAccessory).name
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[6].arguments[0],
        'get'
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[6].arguments[1].name,
        fanAccessory.getRotationSpeed.bind(fanAccessory).name
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[7].arguments[0],
        'set'
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[7].arguments[1].name,
        fanAccessory.setRotationSpeed.bind(fanAccessory).name
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[8].arguments[0],
        'get'
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[8].arguments[1].name,
        fanAccessory.getSwingMode.bind(fanAccessory).name
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[9].arguments[0],
        'set'
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[9].arguments[1].name,
        fanAccessory.setSwingMode.bind(fanAccessory).name
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

test('FanAccessory#setActive when setPowerState returns error', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'setPowerState',
        (deviceId, powerState, callback) => {
            callback('setPowerState error');
        }
    );
    const fanAccessory = new FanAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    fanAccessory.setActive(fanAccessory.Characteristic.Active.ACTIVE, function(error) {
        assert.strictEqual(error, 'setPowerState error');

        mockHomebridge.resetMocks();

        done();
    });
});

test('FanAccessory#setActive called with ACTIVE', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'setPowerState',
        (deviceId, powerState, callback) => {
            assert.strictEqual(powerState, airstage.constants.TOGGLE_ON);

            callback(null);
        }
    );
    const fanAccessory = new FanAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    fanAccessory.setActive(fanAccessory.Characteristic.Active.ACTIVE, function(error) {
        assert.strictEqual(error, null);

        mockHomebridge.resetMocks();

        done();
    });
});

test('FanAccessory#setActive called with INACTIVE', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'setPowerState',
        (deviceId, powerState, callback) => {
            assert.strictEqual(powerState, airstage.constants.TOGGLE_OFF);

            callback(null);
        }
    );
    const fanAccessory = new FanAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    fanAccessory.setActive(fanAccessory.Characteristic.Active.INACTIVE, function(error) {
        assert.strictEqual(error, null);

        mockHomebridge.resetMocks();

        done();
    });
});

test('FanAccessory#getCurrentFanState when getPowerState returns error', (context, done) => {
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

    fanAccessory.getCurrentFanState(function(error, value) {
        assert.strictEqual(error, 'getPowerState error');
        assert.strictEqual(value, null);

        mockHomebridge.resetMocks();

        done();
    });
});

test('FanAccessory#getCurrentFanState when getPowerState returns ON', (context, done) => {
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

    fanAccessory.getCurrentFanState(function(error, value) {
        assert.strictEqual(error, null);
        assert.strictEqual(value, fanAccessory.Characteristic.CurrentFanState.BLOWING_AIR);

        mockHomebridge.resetMocks();

        done();
    });
});

test('FanAccessory#getCurrentFanState when getPowerState returns OFF', (context, done) => {
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

    fanAccessory.getCurrentFanState(function(error, value) {
        assert.strictEqual(error, null);
        assert.strictEqual(value, fanAccessory.Characteristic.CurrentFanState.INACTIVE);

        mockHomebridge.resetMocks();

        done();
    });
});

test('FanAccessory#getTargetFanState when getFanSpeed returns error', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getFanSpeed',
        (deviceId, callback) => {
            callback('getFanSpeed error', null);
        }
    );
    const fanAccessory = new FanAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    fanAccessory.getTargetFanState(function(error, value) {
        assert.strictEqual(error, 'getFanSpeed error');
        assert.strictEqual(value, null);

        mockHomebridge.resetMocks();

        done();
    });
});

test('FanAccessory#getTargetFanState when getFanSpeed returns AUTO', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getFanSpeed',
        (deviceId, callback) => {
            callback(null, airstage.constants.FAN_SPEED_AUTO);
        }
    );
    const fanAccessory = new FanAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    fanAccessory.getTargetFanState(function(error, value) {
        assert.strictEqual(error, null);
        assert.strictEqual(value, fanAccessory.Characteristic.TargetFanState.AUTO);

        mockHomebridge.resetMocks();

        done();
    });
});

test('FanAccessory#getTargetFanState when getFanSpeed returns LOW', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getFanSpeed',
        (deviceId, callback) => {
            callback(null, airstage.constants.FAN_SPEED_LOW);
        }
    );
    const fanAccessory = new FanAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    fanAccessory.getTargetFanState(function(error, value) {
        assert.strictEqual(error, null);
        assert.strictEqual(value, fanAccessory.Characteristic.TargetFanState.MANUAL);

        mockHomebridge.resetMocks();

        done();
    });
});

test('FanAccessory#setTargetFanState when setFanSpeed returns error', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'setFanSpeed',
        (deviceId, fanSpeed, callback) => {
            callback('setFanSpeed error', null);
        }
    );
    const fanAccessory = new FanAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    fanAccessory.setTargetFanState(
        fanAccessory.Characteristic.TargetFanState.AUTO,
        function(error) {
            assert.strictEqual(error, 'setFanSpeed error');

            mockHomebridge.resetMocks();

            done();
        }
    );
});

test('FanAccessory#setTargetFanState when called with AUTO', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'setFanSpeed',
        (deviceId, fanSpeed, callback) => {
            callback(null);
        }
    );
    const fanAccessory = new FanAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    fanAccessory.setTargetFanState(
        fanAccessory.Characteristic.TargetFanState.AUTO,
        function(error) {
            assert.strictEqual(error, null);

            mockHomebridge.resetMocks();

            done();
        }
    );
});

test('FanAccessory#setTargetFanState when called with MANUAL', (context, done) => {
    const fanAccessory = new FanAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    fanAccessory.setTargetFanState(
        fanAccessory.Characteristic.TargetFanState.MANUAL,
        function(error) {
            assert.strictEqual(error, null);

            mockHomebridge.resetMocks();

            done();
        }
    );
});

test('FanAccessory#getRotationSpeed when getFanSpeed returns error', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getFanSpeed',
        (deviceId, callback) => {
            callback('getFanSpeed error', null);
        }
    );
    const fanAccessory = new FanAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    fanAccessory.getRotationSpeed(function(error, value) {
        assert.strictEqual(error, 'getFanSpeed error');
        assert.strictEqual(value, null);

        mockHomebridge.resetMocks();

        done();
    });
});

test('FanAccessory#getRotationSpeed when getFanSpeed returns AUTO', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getFanSpeed',
        (deviceId, callback) => {
            callback(null, airstage.constants.FAN_SPEED_AUTO);
        }
    );
    const fanAccessory = new FanAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    fanAccessory.getRotationSpeed(function(error, value) {
        assert.strictEqual(error, null);
        assert.strictEqual(value, 0);

        mockHomebridge.resetMocks();

        done();
    });
});

test('FanAccessory#getRotationSpeed when getFanSpeed returns QUIET', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getFanSpeed',
        (deviceId, callback) => {
            callback(null, airstage.constants.FAN_SPEED_QUIET);
        }
    );
    const fanAccessory = new FanAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    fanAccessory.getRotationSpeed(function(error, value) {
        assert.strictEqual(error, null);
        assert.strictEqual(value, 25);

        mockHomebridge.resetMocks();

        done();
    });
});

test('FanAccessory#getRotationSpeed when getFanSpeed returns LOW', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getFanSpeed',
        (deviceId, callback) => {
            callback(null, airstage.constants.FAN_SPEED_LOW);
        }
    );
    const fanAccessory = new FanAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    fanAccessory.getRotationSpeed(function(error, value) {
        assert.strictEqual(error, null);
        assert.strictEqual(value, 50);

        mockHomebridge.resetMocks();

        done();
    });
});

test('FanAccessory#getRotationSpeed when getFanSpeed returns MEDIUM', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getFanSpeed',
        (deviceId, callback) => {
            callback(null, airstage.constants.FAN_SPEED_MEDIUM);
        }
    );
    const fanAccessory = new FanAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    fanAccessory.getRotationSpeed(function(error, value) {
        assert.strictEqual(error, null);
        assert.strictEqual(value, 75);

        mockHomebridge.resetMocks();

        done();
    });
});

test('FanAccessory#getRotationSpeed when getFanSpeed returns HIGH', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getFanSpeed',
        (deviceId, callback) => {
            callback(null, airstage.constants.FAN_SPEED_HIGH);
        }
    );
    const fanAccessory = new FanAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    fanAccessory.getRotationSpeed(function(error, value) {
        assert.strictEqual(error, null);
        assert.strictEqual(value, 100);

        mockHomebridge.resetMocks();

        done();
    });
});

test('FanAccessory#setRotationSpeed when setFanSpeed returns error', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'setFanSpeed',
        (deviceId, fanSpeed, callback) => {
            callback('setFanSpeed error', null);
        }
    );
    const fanAccessory = new FanAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    fanAccessory.setRotationSpeed(
        24.999,
        function(error) {
            assert.strictEqual(error, 'setFanSpeed error');

            mockHomebridge.resetMocks();

            done();
        },
        false
    );
});

test('FanAccessory#setRotationSpeed when called with 24.999', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'setFanSpeed',
        (deviceId, fanSpeed, callback) => {
            assert.strictEqual(fanSpeed, airstage.constants.FAN_SPEED_QUIET);

            callback(null);
        }
    );
    const fanAccessory = new FanAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    fanAccessory.setRotationSpeed(
        24.999,
        function(error) {
            assert.strictEqual(error, null);

            mockHomebridge.resetMocks();

            done();
        },
        false
    );
});

test('FanAccessory#setRotationSpeed when called with 49.999', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'setFanSpeed',
        (deviceId, fanSpeed, callback) => {
            assert.strictEqual(fanSpeed, airstage.constants.FAN_SPEED_LOW);

            callback(null);
        }
    );
    const fanAccessory = new FanAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    fanAccessory.setRotationSpeed(
        49.999,
        function(error) {
            assert.strictEqual(error, null);

            mockHomebridge.resetMocks();

            done();
        },
        false
    );
});

test('FanAccessory#setRotationSpeed when called with 74.999', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'setFanSpeed',
        (deviceId, fanSpeed, callback) => {
            assert.strictEqual(fanSpeed, airstage.constants.FAN_SPEED_MEDIUM);

            callback(null);
        }
    );
    const fanAccessory = new FanAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    fanAccessory.setRotationSpeed(
        74.999,
        function(error) {
            assert.strictEqual(error, null);

            mockHomebridge.resetMocks();

            done();
        },
        false
    );
});

test('FanAccessory#setRotationSpeed when called with 99.999', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'setFanSpeed',
        (deviceId, fanSpeed, callback) => {
            assert.strictEqual(fanSpeed, airstage.constants.FAN_SPEED_HIGH);

            callback(null);
        }
    );
    const fanAccessory = new FanAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    fanAccessory.setRotationSpeed(
        99.999,
        function(error) {
            assert.strictEqual(error, null);

            mockHomebridge.resetMocks();

            done();
        },
        false
    );
});

test('FanAccessory#getSwingMode when getAirflowVerticalSwingState returns error', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getAirflowVerticalSwingState',
        (deviceId, callback) => {
            callback('getAirflowVerticalSwingState error', null);
        }
    );
    const fanAccessory = new FanAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    fanAccessory.getSwingMode(function(error, value) {
        assert.strictEqual(error, 'getAirflowVerticalSwingState error');
        assert.strictEqual(value, null);

        mockHomebridge.resetMocks();

        done();
    });
});

test('FanAccessory#getSwingMode when getAirflowVerticalSwingState returns ON', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getAirflowVerticalSwingState',
        (deviceId, callback) => {
            callback(null, airstage.constants.TOGGLE_ON);
        }
    );
    const fanAccessory = new FanAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    fanAccessory.getSwingMode(function(error, value) {
        assert.strictEqual(error, null);
        assert.strictEqual(value, fanAccessory.Characteristic.SwingMode.SWING_ENABLED);

        mockHomebridge.resetMocks();

        done();
    });
});

test('FanAccessory#getSwingMode when getAirflowVerticalSwingState returns OFF', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getAirflowVerticalSwingState',
        (deviceId, callback) => {
            callback(null, airstage.constants.TOGGLE_OFF);
        }
    );
    const fanAccessory = new FanAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    fanAccessory.getSwingMode(function(error, value) {
        assert.strictEqual(error, null);
        assert.strictEqual(value, fanAccessory.Characteristic.SwingMode.SWING_DISABLED);

        mockHomebridge.resetMocks();

        done();
    });
});

test('FanAccessory#setSwingMode when setAirflowVerticalSwingState returns error', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'setAirflowVerticalSwingState',
        (deviceId, powerState, callback) => {
            callback('setAirflowVerticalSwingState error');
        }
    );
    const fanAccessory = new FanAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    fanAccessory.setSwingMode(fanAccessory.Characteristic.SwingMode.SWING_ENABLED, function(error) {
        assert.strictEqual(error, 'setAirflowVerticalSwingState error');

        mockHomebridge.resetMocks();

        done();
    });
});

test('FanAccessory#setSwingMode called with SWING_ENABLED', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'setAirflowVerticalSwingState',
        (deviceId, powerState, callback) => {
            assert.strictEqual(powerState, airstage.constants.TOGGLE_ON);

            callback(null);
        }
    );
    const fanAccessory = new FanAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    fanAccessory.setSwingMode(fanAccessory.Characteristic.SwingMode.SWING_ENABLED, function(error) {
        assert.strictEqual(error, null);

        mockHomebridge.resetMocks();

        done();
    });
});

test('FanAccessory#setSwingMode called with SWING_DISABLED', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'setAirflowVerticalSwingState',
        (deviceId, powerState, callback) => {
            assert.strictEqual(powerState, airstage.constants.TOGGLE_OFF);

            callback(null);
        }
    );
    const fanAccessory = new FanAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    fanAccessory.setSwingMode(fanAccessory.Characteristic.SwingMode.SWING_DISABLED, function(error) {
        assert.strictEqual(error, null);

        mockHomebridge.resetMocks();

        done();
    });
});

test('FanAccessory#getName when getName returns error', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getName',
        (deviceId, callback) => {
            callback('getName error', null);
        }
    );
    const fanAccessory = new FanAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    fanAccessory.getName(function(error, name) {
        assert.strictEqual(error, 'getName error');
        assert.strictEqual(name, null);

        mockHomebridge.resetMocks();

        done();
    });
});

test('FanAccessory#getName returns name with expected suffix', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getName',
        (deviceId, callback) => {
            callback(null, 'Test Device');
        }
    );
    const fanAccessory = new FanAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    fanAccessory.getName(function(error, name) {
        assert.strictEqual(error, null);
        assert.strictEqual(name, 'Test Device Fan');

        mockHomebridge.resetMocks();

        done();
    });
});
