'use strict';

const assert = require('node:assert');
const { mock, test } = require('node:test');
const PowerfulSwitchAccessory = require('../../src/accessories/powerful-switch-accessory');
const MockHomebridge = require('../../src/test/mock-homebridge');
const airstage = require('../../src/airstage');

const mockHomebridge = new MockHomebridge();
const platformAccessory = new mockHomebridge.platform.api.platformAccessory(
    'test-name',
    'test-uuid'
);

test('PowerfulSwitchAccessory#constructor registers accessory', (context) => {
    context.mock.method(
        platformAccessory,
        'getService'
    );
    const powerfulSwitchAccessory = new PowerfulSwitchAccessory(
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

test('PowerfulSwitchAccessory#constructor configures event listeners', (context) => {
    const powerfulSwitchAccessory = new PowerfulSwitchAccessory(
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
        powerfulSwitchAccessory.getOn.bind(powerfulSwitchAccessory).name
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[1].arguments[0],
        'set'
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[1].arguments[1].name,
        powerfulSwitchAccessory.setOn.bind(powerfulSwitchAccessory).name
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[2].arguments[0],
        'get'
    );
    assert.strictEqual(
        mockHomebridge.characteristic.on.mock.calls[2].arguments[1].name,
        powerfulSwitchAccessory.getName.bind(powerfulSwitchAccessory).name
    );

    mockHomebridge.resetMocks();
});

test('PowerfulSwitchAccessory#getOn when getPowerState returns error', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getPowerState',
        (deviceId, callback) => {
            callback('getPowerState error', null);
        }
    );
    const powerfulSwitchAccessory = new PowerfulSwitchAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    powerfulSwitchAccessory.getOn(function(error, value) {
        assert.strictEqual(error, 'getPowerState error');
        assert.strictEqual(value, null);

        mockHomebridge.resetMocks();

        done();
    });
});

test('PowerfulSwitchAccessory#getOn when getPowerState returns OFF', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getPowerState',
        (deviceId, callback) => {
            callback(null, airstage.constants.TOGGLE_OFF);
        }
    );
    const powerfulSwitchAccessory = new PowerfulSwitchAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    powerfulSwitchAccessory.getOn(function(error, value) {
        assert.strictEqual(error, null);
        assert.strictEqual(value, false);

        mockHomebridge.resetMocks();

        done();
    });
});

test('PowerfulSwitchAccessory#getOn when getPowerState returns ON and getPowerfulState returns error', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getPowerState',
        (deviceId, callback) => {
            callback(null, airstage.constants.TOGGLE_ON);
        }
    );
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getPowerfulState',
        (deviceId, callback) => {
            callback('getPowerfulState error', null);
        }
    );
    const powerfulSwitchAccessory = new PowerfulSwitchAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    powerfulSwitchAccessory.getOn(function(error, value) {
        assert.strictEqual(error, 'getPowerfulState error');
        assert.strictEqual(value, null);

        mockHomebridge.resetMocks();

        done();
    });
});

test('PowerfulSwitchAccessory#getOn when getPowerState returns ON and getPowerfulState returns ON', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getPowerState',
        (deviceId, callback) => {
            callback(null, airstage.constants.TOGGLE_ON);
        }
    );
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getPowerfulState',
        (deviceId, callback) => {
            callback(null, airstage.constants.TOGGLE_ON);
        }
    );
    const powerfulSwitchAccessory = new PowerfulSwitchAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    powerfulSwitchAccessory.getOn(function(error, value) {
        assert.strictEqual(error, null);
        assert.strictEqual(value, true);

        mockHomebridge.resetMocks();

        done();
    });
});

test('PowerfulSwitchAccessory#getOn when getPowerState returns ON and getPowerfulState returns OFF', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getPowerState',
        (deviceId, callback) => {
            callback(null, airstage.constants.TOGGLE_ON);
        }
    );
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getPowerfulState',
        (deviceId, callback) => {
            callback(null, airstage.constants.TOGGLE_OFF);
        }
    );
    const powerfulSwitchAccessory = new PowerfulSwitchAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    powerfulSwitchAccessory.getOn(function(error, value) {
        assert.strictEqual(error, null);
        assert.strictEqual(value, false);

        mockHomebridge.resetMocks();

        done();
    });
});

test('PowerfulSwitchAccessory#setOn when getPowerState returns error', (context, done) => {
    const powerfulSwitchAccessory = new PowerfulSwitchAccessory(
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

    powerfulSwitchAccessory.setOn(true, function(error) {
        assert.strictEqual(error, 'getPowerState error');

        done();
    });
});

test('PowerfulSwitchAccessory#setOn when getPowerState returns ON and setPowerfulState returns error', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getPowerState',
        (deviceId, callback) => {
            callback(null, airstage.constants.TOGGLE_ON);
        }
    );
    context.mock.method(
        platformAccessory.context.airstageClient,
        'setPowerfulState',
        (deviceId, powerfulState, callback) => {
            callback('setPowerfulState error');
        }
    );
    context.after(() => {
        assert.strictEqual(platformAccessory.context.airstageClient.getPowerState.mock.calls.length, 1);
        assert.strictEqual(platformAccessory.context.airstageClient.setPowerfulState.mock.calls.length, 1);

        mockHomebridge.resetMocks();
    });
    const powerfulSwitchAccessory = new PowerfulSwitchAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    powerfulSwitchAccessory.setOn(true, function(error) {
        assert.strictEqual(error, 'setPowerfulState error');

        done();
    });
});

test('PowerfulSwitchAccessory#setOn when getPowerState returns ON', (context, done) => {
    context.mock.method(
        platformAccessory.context.airstageClient,
        'getPowerState',
        (deviceId, callback) => {
            callback(null, airstage.constants.TOGGLE_ON);
        }
    );
    context.mock.method(
        platformAccessory.context.airstageClient,
        'setPowerfulState',
        (deviceId, powerfulState, callback) => {
            callback(null);
        }
    );
    context.after(() => {
        assert.strictEqual(platformAccessory.context.airstageClient.getPowerState.mock.calls.length, 1);

        const mockedMethod = platformAccessory.context.airstageClient.setPowerfulState;

        assert.strictEqual(mockedMethod.mock.calls.length, 1);
        assert.strictEqual(mockedMethod.mock.calls[0].arguments[0], 'testDeviceId');
        assert.strictEqual(mockedMethod.mock.calls[0].arguments[1], airstage.constants.TOGGLE_ON);

        mockHomebridge.resetMocks();
    });
    const powerfulSwitchAccessory = new PowerfulSwitchAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    powerfulSwitchAccessory.setOn(true, function(error) {
        assert.strictEqual(error, null);

        done();
    });
});

test('PowerfulSwitchAccessory#setOn when getPowerState returns OFF and setPowerState returns error', (context, done) => {
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
    const powerfulSwitchAccessory = new PowerfulSwitchAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    powerfulSwitchAccessory.setOn(true, function(error) {
        assert.strictEqual(error, 'setPowerState error');

        done();
    });
});

test('PowerfulSwitchAccessory#setOn when getPowerState returns OFF and setPowerfulState returns error', (context, done) => {
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
        'setPowerfulState',
        (deviceId, powerfulState, callback) => {
            callback('setPowerfulState error');
        }
    );
    context.after(() => {
        assert.strictEqual(platformAccessory.context.airstageClient.getPowerState.mock.calls.length, 1);
        assert.strictEqual(platformAccessory.context.airstageClient.setPowerState.mock.calls.length, 1);
        assert.strictEqual(platformAccessory.context.airstageClient.setPowerfulState.mock.calls.length, 1);

        mockHomebridge.resetMocks();
    });
    const powerfulSwitchAccessory = new PowerfulSwitchAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    powerfulSwitchAccessory.setOn(true, function(error) {
        assert.strictEqual(error, 'setPowerfulState error');

        done();
    });
});

test('PowerfulSwitchAccessory#setOn when getPowerState returns OFF', (context, done) => {
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
        'setPowerfulState',
        (deviceId, powerfulState, callback) => {
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

        const mockedMethod = platformAccessory.context.airstageClient.setPowerfulState;

        assert.strictEqual(mockedMethod.mock.calls.length, 1);
        assert.strictEqual(mockedMethod.mock.calls[0].arguments[0], 'testDeviceId');
        assert.strictEqual(mockedMethod.mock.calls[0].arguments[1], airstage.constants.TOGGLE_ON);

        mockHomebridge.resetMocks();
    });
    const powerfulSwitchAccessory = new PowerfulSwitchAccessory(
        mockHomebridge.platform,
        platformAccessory
    );

    powerfulSwitchAccessory.setOn(true, function(error) {
        assert.strictEqual(error, null);

        done();
    });
});
