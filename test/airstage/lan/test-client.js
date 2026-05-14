'use strict';

const assert = require('node:assert');
const { mock, test } = require('node:test');
const airstage = require('./../../../src/airstage');

const clientWithCelsius = new airstage.lan.Client(
    [
        {
            hostname: '1.2.3.4',
            macAddress: '39:FF:BB:9D:6E:BA',
            displayName: 'Air Conditioner'
        },
        {
            hostname: '2.3.4.5',
            macAddress: '96:65:8F:1B:F6:01',
            displayName: 'Heat Pump'
        }
    ],
    'C'
);
const clientWithFahrenheit = new airstage.lan.Client(
    [
        {
            hostname: '1.2.3.4',
            macAddress: '39:FF:BB:9D:6E:BA',
            displayName: 'Air Conditioner'
        },
        {
            hostname: '2.3.4.5',
            macAddress: '96:65:8F:1B:F6:01',
            displayName: 'Heat Pump'
        }
    ],
    'F'
);
const clientWithInvalidTemperatureScale = new airstage.lan.Client(
    [
        {
            hostname: '1.2.3.4',
            macAddress: '39:FF:BB:9D:6E:BA',
            displayName: 'Air Conditioner'
        },
        {
            hostname: '2.3.4.5',
            macAddress: '96:65:8F:1B:F6:01',
            displayName: 'Heat Pump'
        }
    ],
    'K'
);

test('airstage.lan.Client#getTemperatureScale with success', (context, done) => {
    clientWithFahrenheit.getTemperatureScale((error, result) => {
        assert.strictEqual(error, null);
        assert.strictEqual(result, 'F');

        done();
    });
});

test('airstage.cloud.Client#getTemperatureScale with error', (context, done) => {
    const expectedError = 'Invalid temperature scale: K';

    clientWithInvalidTemperatureScale.getTemperatureScale((error, result) => {
        assert.strictEqual(error, expectedError);
        assert.strictEqual(result, null);

        done();
    });
});

test('airstage.lan.Client#setTemperatureScale with success', (context, done) => {
    clientWithFahrenheit.setTemperatureScale('F', (error, result) => {
        assert.strictEqual(error, null);
        assert.strictEqual(result, 'F');

        done();
    });
});

test('airstage.cloud.Client#setTemperatureScale with error', (context, done) => {
    const expectedError = 'Invalid temperature scale: K';

    clientWithInvalidTemperatureScale.setTemperatureScale('K', (error, result) => {
        assert.strictEqual(error, expectedError);
        assert.strictEqual(result, null);

        done();
    });
});

test('airstage.lan.Client#getName with success', (context, done) => {
    clientWithFahrenheit.getName('39FFBB9D6EBA', (error, result) => {
        assert.strictEqual(error, null);
        assert.strictEqual(result, 'Air Conditioner');

        done();
    });
});

test('airstage.lan.Client#getName with error', (context, done) => {
    const expectedError = 'Could not determine name for device ID: ASDF';

    clientWithFahrenheit.getName('ASDF', (error, result) => {
        assert.strictEqual(error, expectedError);
        assert.strictEqual(result, null);

        done();
    });
});

test('airstage.lan.Client#getModel calls _apiClient.postGetParam with success', (context, done) => {
    const expectedResponse = {
        'value': {
            'iu_model': 'AZ123'
        },
        'read_res': 'ack',
        'device_id': '39FFBB9D6EBA',
        'device_sub_id': 0,
        'req_id': '',
        'modified_by': '',
        'set_level': '03',
        'cause': '',
        'result': 'OK',
        'error': ''
    };
    context.mock.method(
        clientWithFahrenheit._apiClient,
        'postGetParam',
        (hostname, deviceId, deviceSubId, list, callback) => {
            callback({'error': null, 'response': expectedResponse});
        }
    );
    context.after(() => {
        const mockedMethod = clientWithFahrenheit._apiClient.postGetParam.mock;

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments.length, 5);
        assert.strictEqual(mockedMethod.calls[0].arguments[0], '1.2.3.4');
        assert.strictEqual(mockedMethod.calls[0].arguments[1], '39FFBB9D6EBA');
        assert.strictEqual(mockedMethod.calls[0].arguments[2], '0');
        assert.strictEqual(mockedMethod.calls[0].arguments[3], airstage.constants.PARAMETER_NAMES);
    });
    clientWithFahrenheit.resetDeviceCache('39FFBB9D6EBA');

    clientWithFahrenheit.getModel('39FFBB9D6EBA', (error, result) => {
        assert.strictEqual(error, null);
        assert.strictEqual(result, 'AZ123');

        done();
    });
});

test('airstage.lan.Client#getModel calls _apiClient.postGetParam with error', (context, done) => {
    const expectedError = 'Error';
    context.mock.method(
        clientWithFahrenheit._apiClient,
        'postGetParam',
        (hostname, deviceId, deviceSubId, list, callback) => {
            callback({'error': expectedError, 'response': null});
        }
    );
    context.after(() => {
        const mockedMethod = clientWithFahrenheit._apiClient.postGetParam.mock;

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments.length, 5);
        assert.strictEqual(mockedMethod.calls[0].arguments[0], '1.2.3.4');
        assert.strictEqual(mockedMethod.calls[0].arguments[1], '39FFBB9D6EBA');
        assert.strictEqual(mockedMethod.calls[0].arguments[2], '0');
        assert.strictEqual(mockedMethod.calls[0].arguments[3], airstage.constants.PARAMETER_NAMES);
    });
    clientWithFahrenheit.resetDeviceCache('39FFBB9D6EBA');

    clientWithFahrenheit.getModel('39FFBB9D6EBA', (error, result) => {
        assert.strictEqual(error, expectedError);
        assert.strictEqual(result, null);

        done();
    });
});

test('airstage.lan.Client#getPowerState calls _apiClient.postGetParam with success', (context, done) => {
    const expectedResponse = {
        'value': {
            'iu_onoff': '1'
        },
        'read_res': 'ack',
        'device_id': '39FFBB9D6EBA',
        'device_sub_id': 0,
        'req_id': '',
        'modified_by': '',
        'set_level': '03',
        'cause': '',
        'result': 'OK',
        'error': ''
    };
    context.mock.method(
        clientWithFahrenheit._apiClient,
        'postGetParam',
        (hostname, deviceId, deviceSubId, list, callback) => {
            callback({'error': null, 'response': expectedResponse});
        }
    );
    context.after(() => {
        const mockedMethod = clientWithFahrenheit._apiClient.postGetParam.mock;

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments.length, 5);
        assert.strictEqual(mockedMethod.calls[0].arguments[0], '1.2.3.4');
        assert.strictEqual(mockedMethod.calls[0].arguments[1], '39FFBB9D6EBA');
        assert.strictEqual(mockedMethod.calls[0].arguments[2], '0');
        assert.strictEqual(mockedMethod.calls[0].arguments[3], airstage.constants.PARAMETER_NAMES);
    });
    clientWithFahrenheit.resetDeviceCache('39FFBB9D6EBA');

    clientWithFahrenheit.getPowerState('39FFBB9D6EBA', (error, result) => {
        assert.strictEqual(error, null);
        assert.strictEqual(result, 'ON');

        done();
    });
});

test('airstage.lan.Client#getPowerState calls _apiClient.postGetParam with error', (context, done) => {
    const expectedError = 'Error';
    context.mock.method(
        clientWithFahrenheit._apiClient,
        'postGetParam',
        (hostname, deviceId, deviceSubId, list, callback) => {
            callback({'error': expectedError, 'response': null});
        }
    );
    context.after(() => {
        const mockedMethod = clientWithFahrenheit._apiClient.postGetParam.mock;

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments.length, 5);
        assert.strictEqual(mockedMethod.calls[0].arguments[0], '1.2.3.4');
        assert.strictEqual(mockedMethod.calls[0].arguments[1], '39FFBB9D6EBA');
        assert.strictEqual(mockedMethod.calls[0].arguments[2], '0');
        assert.strictEqual(mockedMethod.calls[0].arguments[3], airstage.constants.PARAMETER_NAMES);
    });
    clientWithFahrenheit.resetDeviceCache('39FFBB9D6EBA');

    clientWithFahrenheit.getPowerState('39FFBB9D6EBA', (error, result) => {
        assert.strictEqual(error, expectedError);
        assert.strictEqual(result, null);

        done();
    });
});

test('airstage.lan.Client#setPowerState calls _apiClient.postSetParam with success', (context, done) => {
    const expectedResponse = {
        'value': {
            'iu_onoff': '1'
        },
        'write_res': 'ack',
        'read_res': 'ack',
        'device_id': '39FFBB9D6EBA',
        'device_sub_id': 0,
        'req_id': '',
        'modified_by': '',
        'set_level': '02',
        'cause': '',
        'result': 'OK',
        'error': ''
    };
    context.mock.method(
        clientWithFahrenheit._apiClient,
        'postSetParam',
        (hostname, deviceId, deviceSubId, value, callback) => {
            callback({'error': null, 'response': expectedResponse});
        }
    );
    context.after(() => {
        const mockedMethod = clientWithFahrenheit._apiClient.postSetParam.mock;

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments.length, 5);
        assert.strictEqual(mockedMethod.calls[0].arguments[0], '1.2.3.4');
        assert.strictEqual(mockedMethod.calls[0].arguments[1], '39FFBB9D6EBA');
        assert.strictEqual(mockedMethod.calls[0].arguments[2], '0');
        assert.strictEqual(Object.keys(mockedMethod.calls[0].arguments[3]).length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments[3]['iu_onoff'], '1');
    });
    clientWithFahrenheit.resetDeviceCache('39FFBB9D6EBA');

    clientWithFahrenheit.setPowerState('39FFBB9D6EBA', 'ON', (error, result) => {
        assert.strictEqual(error, null);
        assert.strictEqual(result, 'ON');

        done();
    });
});

test('airstage.lan.Client#setPowerState calls _apiClient.postSetParam with error', (context, done) => {
    const expectedError = 'Error';
    context.mock.method(
        clientWithFahrenheit._apiClient,
        'postSetParam',
        (hostname, deviceId, deviceSubId, value, callback) => {
            callback({'error': expectedError, 'response': null});
        }
    );
    context.after(() => {
        const mockedMethod = clientWithFahrenheit._apiClient.postSetParam.mock;

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments.length, 5);
        assert.strictEqual(mockedMethod.calls[0].arguments[0], '1.2.3.4');
        assert.strictEqual(mockedMethod.calls[0].arguments[1], '39FFBB9D6EBA');
        assert.strictEqual(mockedMethod.calls[0].arguments[2], '0');
        assert.strictEqual(Object.keys(mockedMethod.calls[0].arguments[3]).length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments[3]['iu_onoff'], '1');
    });
    clientWithFahrenheit.resetDeviceCache('39FFBB9D6EBA');

    clientWithFahrenheit.setPowerState('39FFBB9D6EBA', 'ON', (error, result) => {
        assert.strictEqual(error, expectedError);
        assert.strictEqual(result, null);

        done();
    });
});

test('airstage.lan.Client#getOperationMode calls _apiClient.postGetParam with success', (context, done) => {
    const expectedResponse = {
        'value': {
            'iu_op_mode': '0'
        },
        'read_res': 'ack',
        'device_id': '39FFBB9D6EBA',
        'device_sub_id': 0,
        'req_id': '',
        'modified_by': '',
        'set_level': '03',
        'cause': '',
        'result': 'OK',
        'error': ''
    };
    context.mock.method(
        clientWithFahrenheit._apiClient,
        'postGetParam',
        (hostname, deviceId, deviceSubId, list, callback) => {
            callback({'error': null, 'response': expectedResponse});
        }
    );
    context.after(() => {
        const mockedMethod = clientWithFahrenheit._apiClient.postGetParam.mock;

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments.length, 5);
        assert.strictEqual(mockedMethod.calls[0].arguments[0], '1.2.3.4');
        assert.strictEqual(mockedMethod.calls[0].arguments[1], '39FFBB9D6EBA');
        assert.strictEqual(mockedMethod.calls[0].arguments[2], '0');
        assert.strictEqual(mockedMethod.calls[0].arguments[3], airstage.constants.PARAMETER_NAMES);
    });
    clientWithFahrenheit.resetDeviceCache('39FFBB9D6EBA');

    clientWithFahrenheit.getOperationMode('39FFBB9D6EBA', (error, result) => {
        assert.strictEqual(error, null);
        assert.strictEqual(result, 'AUTO');

        done();
    });
});

test('airstage.lan.Client#getOperationMode calls _apiClient.postGetParam with error', (context, done) => {
    const expectedError = 'Error';
    context.mock.method(
        clientWithFahrenheit._apiClient,
        'postGetParam',
        (hostname, deviceId, deviceSubId, list, callback) => {
            callback({'error': expectedError, 'response': null});
        }
    );
    context.after(() => {
        const mockedMethod = clientWithFahrenheit._apiClient.postGetParam.mock;

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments.length, 5);
        assert.strictEqual(mockedMethod.calls[0].arguments[0], '1.2.3.4');
        assert.strictEqual(mockedMethod.calls[0].arguments[1], '39FFBB9D6EBA');
        assert.strictEqual(mockedMethod.calls[0].arguments[2], '0');
        assert.strictEqual(mockedMethod.calls[0].arguments[3], airstage.constants.PARAMETER_NAMES);
    });
    clientWithFahrenheit.resetDeviceCache('39FFBB9D6EBA');

    clientWithFahrenheit.getOperationMode('39FFBB9D6EBA', (error, result) => {
        assert.strictEqual(error, expectedError);
        assert.strictEqual(result, null);

        done();
    });
});

test('airstage.lan.Client#setOperationMode with "COOL" calls _apiClient.postSetParam with success', (context, done) => {
    const expectedResponse = {
        'value': {
            'iu_op_mode': '1'
        },
        'write_res': 'ack',
        'read_res': 'ack',
        'device_id': '39FFBB9D6EBA',
        'device_sub_id': 0,
        'req_id': '',
        'modified_by': '',
        'set_level': '02',
        'cause': '',
        'result': 'OK',
        'error': ''
    };
    context.mock.method(
        clientWithFahrenheit._apiClient,
        'postSetParam',
        (hostname, deviceId, deviceSubId, value, callback) => {
            callback({'error': null, 'response': expectedResponse});
        }
    );
    context.after(() => {
        const mockedMethod = clientWithFahrenheit._apiClient.postSetParam.mock;

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments.length, 5);
        assert.strictEqual(mockedMethod.calls[0].arguments[0], '1.2.3.4');
        assert.strictEqual(mockedMethod.calls[0].arguments[1], '39FFBB9D6EBA');
        assert.strictEqual(mockedMethod.calls[0].arguments[2], '0');
        assert.strictEqual(Object.keys(mockedMethod.calls[0].arguments[3]).length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments[3]['iu_op_mode'], '1');
    });
    clientWithFahrenheit.resetDeviceCache('39FFBB9D6EBA');

    clientWithFahrenheit.setOperationMode('39FFBB9D6EBA', 'COOL', (error, result) => {
        assert.strictEqual(error, null);
        assert.strictEqual(result, 'COOL');

        done();
    });
});

test('airstage.lan.Client#setOperationMode with "DRY" calls _apiClient.postSetParam with success', (context, done) => {
    const expectedResponse = {
        'value': {
            'iu_op_mode': '2'
        },
        'write_res': 'ack',
        'read_res': 'ack',
        'device_id': '39FFBB9D6EBA',
        'device_sub_id': 0,
        'req_id': '',
        'modified_by': '',
        'set_level': '02',
        'cause': '',
        'result': 'OK',
        'error': ''
    };
    context.mock.method(
        clientWithFahrenheit._apiClient,
        'postSetParam',
        (hostname, deviceId, deviceSubId, value, callback) => {
            callback({'error': null, 'response': expectedResponse});
        }
    );
    context.after(() => {
        const mockedMethod = clientWithFahrenheit._apiClient.postSetParam.mock;

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments.length, 5);
        assert.strictEqual(mockedMethod.calls[0].arguments[0], '1.2.3.4');
        assert.strictEqual(mockedMethod.calls[0].arguments[1], '39FFBB9D6EBA');
        assert.strictEqual(mockedMethod.calls[0].arguments[2], '0');
        assert.strictEqual(Object.keys(mockedMethod.calls[0].arguments[3]).length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments[3]['iu_op_mode'], '2');
    });
    clientWithFahrenheit.resetDeviceCache('39FFBB9D6EBA');

    clientWithFahrenheit.setOperationMode('39FFBB9D6EBA', 'DRY', (error, result) => {
        assert.strictEqual(error, null);
        assert.strictEqual(result, 'DRY');

        clientWithFahrenheit.getDevice('39FFBB9D6EBA', (error, result) => {
            assert.strictEqual(error, null);
            assert.strictEqual(Object.keys(result.parameters).length, 2);
            assert.strictEqual(result.parameters['iu_fan_spd'], '0');
            assert.strictEqual(result.parameters['iu_op_mode'], '2');

            done();
        });
    });
});

test('airstage.lan.Client#setOperationMode calls _apiClient.postSetParam with error', (context, done) => {
    const expectedError = 'Error';
    context.mock.method(
        clientWithFahrenheit._apiClient,
        'postSetParam',
        (hostname, deviceId, deviceSubId, value, callback) => {
            callback({'error': expectedError, 'response': null});
        }
    );
    context.after(() => {
        const mockedMethod = clientWithFahrenheit._apiClient.postSetParam.mock;

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments.length, 5);
        assert.strictEqual(mockedMethod.calls[0].arguments[0], '1.2.3.4');
        assert.strictEqual(mockedMethod.calls[0].arguments[1], '39FFBB9D6EBA');
        assert.strictEqual(mockedMethod.calls[0].arguments[2], '0');
        assert.strictEqual(Object.keys(mockedMethod.calls[0].arguments[3]).length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments[3]['iu_op_mode'], '1');
    });
    clientWithFahrenheit.resetDeviceCache('39FFBB9D6EBA');

    clientWithFahrenheit.setOperationMode('39FFBB9D6EBA', 'COOL', (error, result) => {
        assert.strictEqual(error, expectedError);
        assert.strictEqual(result, null);

        done();
    });
});

test('airstage.lan.Client#getIndoorTemperature calls _apiClient.postGetParam with success', (context, done) => {
    const expectedResponse = {
        'value': {
            'iu_indoor_tmp': '7200'
        },
        'read_res': 'ack',
        'device_id': '39FFBB9D6EBA',
        'device_sub_id': 0,
        'req_id': '',
        'modified_by': '',
        'set_level': '03',
        'cause': '',
        'result': 'OK',
        'error': ''
    };
    context.mock.method(
        clientWithFahrenheit._apiClient,
        'postGetParam',
        (hostname, deviceId, deviceSubId, list, callback) => {
            callback({'error': null, 'response': expectedResponse});
        }
    );
    context.after(() => {
        const mockedMethod = clientWithFahrenheit._apiClient.postGetParam.mock;

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments.length, 5);
        assert.strictEqual(mockedMethod.calls[0].arguments[0], '1.2.3.4');
        assert.strictEqual(mockedMethod.calls[0].arguments[1], '39FFBB9D6EBA');
        assert.strictEqual(mockedMethod.calls[0].arguments[2], '0');
        assert.strictEqual(mockedMethod.calls[0].arguments[3], airstage.constants.PARAMETER_NAMES);
    });
    clientWithFahrenheit.resetDeviceCache('39FFBB9D6EBA');

    clientWithFahrenheit.getIndoorTemperature('39FFBB9D6EBA', 'F', (error, result) => {
        assert.strictEqual(error, null);
        assert.strictEqual(result, 72);

        done();
    });
});

test('airstage.lan.Client#getIndoorTemperature calls _apiClient.postGetParam with error', (context, done) => {
    const expectedError = 'Error';
    context.mock.method(
        clientWithFahrenheit._apiClient,
        'postGetParam',
        (hostname, deviceId, deviceSubId, list, callback) => {
            callback({'error': expectedError, 'response': null});
        }
    );
    context.after(() => {
        const mockedMethod = clientWithFahrenheit._apiClient.postGetParam.mock;

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments.length, 5);
        assert.strictEqual(mockedMethod.calls[0].arguments[0], '1.2.3.4');
        assert.strictEqual(mockedMethod.calls[0].arguments[1], '39FFBB9D6EBA');
        assert.strictEqual(mockedMethod.calls[0].arguments[2], '0');
        assert.strictEqual(mockedMethod.calls[0].arguments[3], airstage.constants.PARAMETER_NAMES);
    });
    clientWithFahrenheit.resetDeviceCache('39FFBB9D6EBA');

    clientWithFahrenheit.getIndoorTemperature('39FFBB9D6EBA', 'F', (error, result) => {
        assert.strictEqual(error, expectedError);
        assert.strictEqual(result, null);

        done();
    });
});

test('airstage.lan.Client#getTargetTemperature calls _apiClient.postGetParam with success', (context, done) => {
    const expectedResponse = {
        'value': {
            'iu_set_tmp': '220'
        },
        'read_res': 'ack',
        'device_id': '39FFBB9D6EBA',
        'device_sub_id': 0,
        'req_id': '',
        'modified_by': '',
        'set_level': '03',
        'cause': '',
        'result': 'OK',
        'error': ''
    };
    context.mock.method(
        clientWithFahrenheit._apiClient,
        'postGetParam',
        (hostname, deviceId, deviceSubId, list, callback) => {
            callback({'error': null, 'response': expectedResponse});
        }
    );
    context.after(() => {
        const mockedMethod = clientWithFahrenheit._apiClient.postGetParam.mock;

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments.length, 5);
        assert.strictEqual(mockedMethod.calls[0].arguments[0], '1.2.3.4');
        assert.strictEqual(mockedMethod.calls[0].arguments[1], '39FFBB9D6EBA');
        assert.strictEqual(mockedMethod.calls[0].arguments[2], '0');
        assert.strictEqual(mockedMethod.calls[0].arguments[3], airstage.constants.PARAMETER_NAMES);
    });
    clientWithFahrenheit.resetDeviceCache('39FFBB9D6EBA');

    clientWithFahrenheit.getTargetTemperature('39FFBB9D6EBA', 'F', (error, result) => {
        assert.strictEqual(error, null);
        assert.strictEqual(result, 72);

        done();
    });
});

test('airstage.lan.Client#getTargetTemperature calls _apiClient.postGetParam with error', (context, done) => {
    const expectedError = 'Error';
    context.mock.method(
        clientWithFahrenheit._apiClient,
        'postGetParam',
        (hostname, deviceId, deviceSubId, list, callback) => {
            callback({'error': expectedError, 'response': null});
        }
    );
    context.after(() => {
        const mockedMethod = clientWithFahrenheit._apiClient.postGetParam.mock;

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments.length, 5);
        assert.strictEqual(mockedMethod.calls[0].arguments[0], '1.2.3.4');
        assert.strictEqual(mockedMethod.calls[0].arguments[1], '39FFBB9D6EBA');
        assert.strictEqual(mockedMethod.calls[0].arguments[2], '0');
        assert.strictEqual(mockedMethod.calls[0].arguments[3], airstage.constants.PARAMETER_NAMES);
    });
    clientWithFahrenheit.resetDeviceCache('39FFBB9D6EBA');

    clientWithFahrenheit.getTargetTemperature('39FFBB9D6EBA', 'F', (error, result) => {
        assert.strictEqual(error, expectedError);
        assert.strictEqual(result, null);

        done();
    });
});

test('airstage.lan.Client#setTargetTemperature with "F" calls _apiClient.postSetParam with success', (context, done) => {
    const expectedResponse = {
        'value': {
            'iu_set_tmp': '220'
        },
        'write_res': 'ack',
        'read_res': 'ack',
        'device_id': '39FFBB9D6EBA',
        'device_sub_id': 0,
        'req_id': '',
        'modified_by': '',
        'set_level': '02',
        'cause': '',
        'result': 'OK',
        'error': ''
    };
    context.mock.method(
        clientWithFahrenheit._apiClient,
        'postSetParam',
        (hostname, deviceId, deviceSubId, value, callback) => {
            callback({'error': null, 'response': expectedResponse});
        }
    );
    context.after(() => {
        const mockedMethod = clientWithFahrenheit._apiClient.postSetParam.mock;

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments.length, 5);
        assert.strictEqual(mockedMethod.calls[0].arguments[0], '1.2.3.4');
        assert.strictEqual(mockedMethod.calls[0].arguments[1], '39FFBB9D6EBA');
        assert.strictEqual(mockedMethod.calls[0].arguments[2], '0');
        assert.strictEqual(Object.keys(mockedMethod.calls[0].arguments[3]).length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments[3]['iu_set_tmp'], '220');
    });
    clientWithFahrenheit.resetDeviceCache('39FFBB9D6EBA');

    clientWithFahrenheit.setTargetTemperature('39FFBB9D6EBA', 72, 'F', (error, result) => {
        assert.strictEqual(error, null);
        assert.strictEqual(result, 72);

        done();
    });
});

test('airstage.lan.Client#setTargetTemperature with "C" calls _apiClient.postSetParam with success', (context, done) => {
    const expectedResponse = {
        'value': {
            'iu_set_tmp': '220'
        },
        'write_res': 'ack',
        'read_res': 'ack',
        'device_id': '39FFBB9D6EBA',
        'device_sub_id': 0,
        'req_id': '',
        'modified_by': '',
        'set_level': '02',
        'cause': '',
        'result': 'OK',
        'error': ''
    };
    context.mock.method(
        clientWithCelsius._apiClient,
        'postSetParam',
        (hostname, deviceId, deviceSubId, value, callback) => {
            callback({'error': null, 'response': expectedResponse});
        }
    );
    context.after(() => {
        const mockedMethod = clientWithCelsius._apiClient.postSetParam.mock;

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments.length, 5);
        assert.strictEqual(mockedMethod.calls[0].arguments[0], '1.2.3.4');
        assert.strictEqual(mockedMethod.calls[0].arguments[1], '39FFBB9D6EBA');
        assert.strictEqual(mockedMethod.calls[0].arguments[2], '0');
        assert.strictEqual(Object.keys(mockedMethod.calls[0].arguments[3]).length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments[3]['iu_set_tmp'], '220');
    });
    clientWithCelsius.resetDeviceCache('39FFBB9D6EBA');

    clientWithCelsius.setTargetTemperature('39FFBB9D6EBA', 22, 'C', (error, result) => {
        assert.strictEqual(error, null);
        assert.strictEqual(result, 22);

        done();
    });
});

test('airstage.lan.Client#setTargetTemperature calls _apiClient.postSetParam with error', (context, done) => {
    const expectedError = 'Error';
    context.mock.method(
        clientWithFahrenheit._apiClient,
        'postSetParam',
        (hostname, deviceId, deviceSubId, value, callback) => {
            callback({'error': expectedError, 'response': null});
        }
    );
    context.after(() => {
        const mockedMethod = clientWithFahrenheit._apiClient.postSetParam.mock;

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments.length, 5);
        assert.strictEqual(mockedMethod.calls[0].arguments[0], '1.2.3.4');
        assert.strictEqual(mockedMethod.calls[0].arguments[1], '39FFBB9D6EBA');
        assert.strictEqual(mockedMethod.calls[0].arguments[2], '0');
        assert.strictEqual(Object.keys(mockedMethod.calls[0].arguments[3]).length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments[3]['iu_set_tmp'], '220');
    });
    clientWithFahrenheit.resetDeviceCache('39FFBB9D6EBA');

    clientWithFahrenheit.setTargetTemperature('39FFBB9D6EBA', 72, 'F', (error, result) => {
        assert.strictEqual(error, expectedError);
        assert.strictEqual(result, null);

        done();
    });
});

test('airstage.lan.Client#getTemperatureDelta calls _apiClient.postGetParam with success', (context, done) => {
    const expectedResponse = {
        'value': {
            'iu_indoor_tmp': '7400',
            'iu_set_tmp': '220'
        },
        'read_res': 'ack',
        'device_id': '39FFBB9D6EBA',
        'device_sub_id': 0,
        'req_id': '',
        'modified_by': '',
        'set_level': '03',
        'cause': '',
        'result': 'OK',
        'error': ''
    };
    context.mock.method(
        clientWithFahrenheit._apiClient,
        'postGetParam',
        (hostname, deviceId, deviceSubId, list, callback) => {
            callback({'error': null, 'response': expectedResponse});
        }
    );
    context.after(() => {
        const mockedMethod = clientWithFahrenheit._apiClient.postGetParam.mock;

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments.length, 5);
        assert.strictEqual(mockedMethod.calls[0].arguments[0], '1.2.3.4');
        assert.strictEqual(mockedMethod.calls[0].arguments[1], '39FFBB9D6EBA');
        assert.strictEqual(mockedMethod.calls[0].arguments[2], '0');
        assert.strictEqual(mockedMethod.calls[0].arguments[3], airstage.constants.PARAMETER_NAMES);
    });
    clientWithFahrenheit.resetDeviceCache('39FFBB9D6EBA');

    clientWithFahrenheit.getTemperatureDelta('39FFBB9D6EBA', 'F', (error, result) => {
        assert.strictEqual(error, null);
        assert.strictEqual(result, 4);

        done();
    });
});

test('airstage.lan.Client#getTemperatureDelta calls _apiClient.postGetParam with error', (context, done) => {
    const expectedError = 'Error';
    context.mock.method(
        clientWithFahrenheit._apiClient,
        'postGetParam',
        (hostname, deviceId, deviceSubId, list, callback) => {
            callback({'error': expectedError, 'response': null});
        }
    );
    context.after(() => {
        const mockedMethod = clientWithFahrenheit._apiClient.postGetParam.mock;

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments.length, 5);
        assert.strictEqual(mockedMethod.calls[0].arguments[0], '1.2.3.4');
        assert.strictEqual(mockedMethod.calls[0].arguments[1], '39FFBB9D6EBA');
        assert.strictEqual(mockedMethod.calls[0].arguments[2], '0');
        assert.strictEqual(mockedMethod.calls[0].arguments[3], airstage.constants.PARAMETER_NAMES);
    });
    clientWithFahrenheit.resetDeviceCache('39FFBB9D6EBA');

    clientWithFahrenheit.getTemperatureDelta('39FFBB9D6EBA', 'F', (error, result) => {
        assert.strictEqual(error, expectedError);
        assert.strictEqual(result, null);

        done();
    });
});

test('airstage.lan.Client#getFanSpeed calls _apiClient.postGetParam with success', (context, done) => {
    const expectedResponse = {
        'value': {
            'iu_fan_spd': '11'
        },
        'read_res': 'ack',
        'device_id': '39FFBB9D6EBA',
        'device_sub_id': 0,
        'req_id': '',
        'modified_by': '',
        'set_level': '03',
        'cause': '',
        'result': 'OK',
        'error': ''
    };
    context.mock.method(
        clientWithFahrenheit._apiClient,
        'postGetParam',
        (hostname, deviceId, deviceSubId, list, callback) => {
            callback({'error': null, 'response': expectedResponse});
        }
    );
    context.after(() => {
        const mockedMethod = clientWithFahrenheit._apiClient.postGetParam.mock;

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments.length, 5);
        assert.strictEqual(mockedMethod.calls[0].arguments[0], '1.2.3.4');
        assert.strictEqual(mockedMethod.calls[0].arguments[1], '39FFBB9D6EBA');
        assert.strictEqual(mockedMethod.calls[0].arguments[2], '0');
        assert.strictEqual(mockedMethod.calls[0].arguments[3], airstage.constants.PARAMETER_NAMES);
    });
    clientWithFahrenheit.resetDeviceCache('39FFBB9D6EBA');

    clientWithFahrenheit.getFanSpeed('39FFBB9D6EBA', (error, result) => {
        assert.strictEqual(error, null);
        assert.strictEqual(result, 'HIGH');

        done();
    });
});

test('airstage.lan.Client#getFanSpeed calls _apiClient.postGetParam with error', (context, done) => {
    const expectedError = 'Error';
    context.mock.method(
        clientWithFahrenheit._apiClient,
        'postGetParam',
        (hostname, deviceId, deviceSubId, list, callback) => {
            callback({'error': expectedError, 'response': null});
        }
    );
    context.after(() => {
        const mockedMethod = clientWithFahrenheit._apiClient.postGetParam.mock;

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments.length, 5);
        assert.strictEqual(mockedMethod.calls[0].arguments[0], '1.2.3.4');
        assert.strictEqual(mockedMethod.calls[0].arguments[1], '39FFBB9D6EBA');
        assert.strictEqual(mockedMethod.calls[0].arguments[2], '0');
        assert.strictEqual(mockedMethod.calls[0].arguments[3], airstage.constants.PARAMETER_NAMES);
    });
    clientWithFahrenheit.resetDeviceCache('39FFBB9D6EBA');

    clientWithFahrenheit.getFanSpeed('39FFBB9D6EBA', (error, result) => {
        assert.strictEqual(error, expectedError);
        assert.strictEqual(result, null);

        done();
    });
});

test('airstage.lan.Client#setFanSpeed calls _apiClient.postSetParam with success', (context, done) => {
    const expectedResponse = {
        'value': {
            'iu_fan_spd': '11'
        },
        'write_res': 'ack',
        'read_res': 'ack',
        'device_id': '39FFBB9D6EBA',
        'device_sub_id': 0,
        'req_id': '',
        'modified_by': '',
        'set_level': '02',
        'cause': '',
        'result': 'OK',
        'error': ''
    };
    context.mock.method(
        clientWithFahrenheit._apiClient,
        'postSetParam',
        (hostname, deviceId, deviceSubId, value, callback) => {
            callback({'error': null, 'response': expectedResponse});
        }
    );
    context.after(() => {
        const mockedMethod = clientWithFahrenheit._apiClient.postSetParam.mock;

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments.length, 5);
        assert.strictEqual(mockedMethod.calls[0].arguments[0], '1.2.3.4');
        assert.strictEqual(mockedMethod.calls[0].arguments[1], '39FFBB9D6EBA');
        assert.strictEqual(mockedMethod.calls[0].arguments[2], '0');
        assert.strictEqual(Object.keys(mockedMethod.calls[0].arguments[3]).length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments[3]['iu_fan_spd'], '11');
    });
    clientWithFahrenheit.resetDeviceCache('39FFBB9D6EBA');

    clientWithFahrenheit.setFanSpeed('39FFBB9D6EBA', 'HIGH', (error, result) => {
        assert.strictEqual(error, null);
        assert.strictEqual(result, 'HIGH');

        done();
    });
});

test('airstage.lan.Client#setFanSpeed calls _apiClient.postSetParam with error', (context, done) => {
    const expectedError = 'Error';
    context.mock.method(
        clientWithFahrenheit._apiClient,
        'postSetParam',
        (hostname, deviceId, deviceSubId, value, callback) => {
            callback({'error': expectedError, 'response': null});
        }
    );
    context.after(() => {
        const mockedMethod = clientWithFahrenheit._apiClient.postSetParam.mock;

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments.length, 5);
        assert.strictEqual(mockedMethod.calls[0].arguments[0], '1.2.3.4');
        assert.strictEqual(mockedMethod.calls[0].arguments[1], '39FFBB9D6EBA');
        assert.strictEqual(mockedMethod.calls[0].arguments[2], '0');
        assert.strictEqual(Object.keys(mockedMethod.calls[0].arguments[3]).length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments[3]['iu_fan_spd'], '11');
    });
    clientWithFahrenheit.resetDeviceCache('39FFBB9D6EBA');

    clientWithFahrenheit.setFanSpeed('39FFBB9D6EBA', 'HIGH', (error, result) => {
        assert.strictEqual(error, expectedError);
        assert.strictEqual(result, null);

        done();
    });
});

test('airstage.lan.Client#getAirflowVerticalDirection calls _apiClient.postGetParam with success', (context, done) => {
    const expectedResponse = {
        'value': {
            'iu_af_dir_vrt': '1'
        },
        'read_res': 'ack',
        'device_id': '39FFBB9D6EBA',
        'device_sub_id': 0,
        'req_id': '',
        'modified_by': '',
        'set_level': '03',
        'cause': '',
        'result': 'OK',
        'error': ''
    };
    context.mock.method(
        clientWithFahrenheit._apiClient,
        'postGetParam',
        (hostname, deviceId, deviceSubId, list, callback) => {
            callback({'error': null, 'response': expectedResponse});
        }
    );
    context.after(() => {
        const mockedMethod = clientWithFahrenheit._apiClient.postGetParam.mock;

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments.length, 5);
        assert.strictEqual(mockedMethod.calls[0].arguments[0], '1.2.3.4');
        assert.strictEqual(mockedMethod.calls[0].arguments[1], '39FFBB9D6EBA');
        assert.strictEqual(mockedMethod.calls[0].arguments[2], '0');
        assert.strictEqual(mockedMethod.calls[0].arguments[3], airstage.constants.PARAMETER_NAMES);
    });
    clientWithFahrenheit.resetDeviceCache('39FFBB9D6EBA');

    clientWithFahrenheit.getAirflowVerticalDirection('39FFBB9D6EBA', (error, result) => {
        assert.strictEqual(error, null);
        assert.strictEqual(result, 1);

        done();
    });
});

test('airstage.lan.Client#getAirflowVerticalDirection calls _apiClient.postGetParam with error', (context, done) => {
    const expectedError = 'Error';
    context.mock.method(
        clientWithFahrenheit._apiClient,
        'postGetParam',
        (hostname, deviceId, deviceSubId, list, callback) => {
            callback({'error': expectedError, 'response': null});
        }
    );
    context.after(() => {
        const mockedMethod = clientWithFahrenheit._apiClient.postGetParam.mock;

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments.length, 5);
        assert.strictEqual(mockedMethod.calls[0].arguments[0], '1.2.3.4');
        assert.strictEqual(mockedMethod.calls[0].arguments[1], '39FFBB9D6EBA');
        assert.strictEqual(mockedMethod.calls[0].arguments[2], '0');
        assert.strictEqual(mockedMethod.calls[0].arguments[3], airstage.constants.PARAMETER_NAMES);
    });
    clientWithFahrenheit.resetDeviceCache('39FFBB9D6EBA');

    clientWithFahrenheit.getAirflowVerticalDirection('39FFBB9D6EBA', (error, result) => {
        assert.strictEqual(error, expectedError);
        assert.strictEqual(result, null);

        done();
    });
});

test('airstage.lan.Client#setAirflowVerticalDirection with 0 calls _apiClient.postSetParam with success', (context, done) => {
    const expectedResponse = {
        'value': {
            'iu_af_dir_vrt': '1'
        },
        'write_res': 'ack',
        'read_res': 'ack',
        'device_id': '39FFBB9D6EBA',
        'device_sub_id': 0,
        'req_id': '',
        'modified_by': '',
        'set_level': '02',
        'cause': '',
        'result': 'OK',
        'error': ''
    };
    context.mock.method(
        clientWithFahrenheit._apiClient,
        'postSetParam',
        (hostname, deviceId, deviceSubId, value, callback) => {
            callback({'error': null, 'response': expectedResponse});
        }
    );
    context.after(() => {
        const mockedMethod = clientWithFahrenheit._apiClient.postSetParam.mock;

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments.length, 5);
        assert.strictEqual(mockedMethod.calls[0].arguments[0], '1.2.3.4');
        assert.strictEqual(mockedMethod.calls[0].arguments[1], '39FFBB9D6EBA');
        assert.strictEqual(mockedMethod.calls[0].arguments[2], '0');
        assert.strictEqual(Object.keys(mockedMethod.calls[0].arguments[3]).length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments[3]['iu_af_dir_vrt'], '1');
    });
    clientWithFahrenheit.resetDeviceCache('39FFBB9D6EBA');

    clientWithFahrenheit.setAirflowVerticalDirection('39FFBB9D6EBA', 0, (error, result) => {
        assert.strictEqual(error, null);
        assert.strictEqual(result, 1);

        done();
    });
});

test('airstage.lan.Client#setAirflowVerticalDirection with 1 calls _apiClient.postSetParam with success', (context, done) => {
    const expectedResponse = {
        'value': {
            'iu_af_dir_vrt': '1'
        },
        'write_res': 'ack',
        'read_res': 'ack',
        'device_id': '39FFBB9D6EBA',
        'device_sub_id': 0,
        'req_id': '',
        'modified_by': '',
        'set_level': '02',
        'cause': '',
        'result': 'OK',
        'error': ''
    };
    context.mock.method(
        clientWithFahrenheit._apiClient,
        'postSetParam',
        (hostname, deviceId, deviceSubId, value, callback) => {
            callback({'error': null, 'response': expectedResponse});
        }
    );
    context.after(() => {
        const mockedMethod = clientWithFahrenheit._apiClient.postSetParam.mock;

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments.length, 5);
        assert.strictEqual(mockedMethod.calls[0].arguments[0], '1.2.3.4');
        assert.strictEqual(mockedMethod.calls[0].arguments[1], '39FFBB9D6EBA');
        assert.strictEqual(mockedMethod.calls[0].arguments[2], '0');
        assert.strictEqual(Object.keys(mockedMethod.calls[0].arguments[3]).length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments[3]['iu_af_dir_vrt'], '1');
    });
    clientWithFahrenheit.resetDeviceCache('39FFBB9D6EBA');

    clientWithFahrenheit.setAirflowVerticalDirection('39FFBB9D6EBA', 1, (error, result) => {
        assert.strictEqual(error, null);
        assert.strictEqual(result, 1);

        done();
    });
});

test('airstage.lan.Client#setAirflowVerticalDirection with 5 calls _apiClient.postSetParam with success', (context, done) => {
    const expectedResponse = {
        'value': {
            'iu_af_dir_vrt': '4'
        },
        'write_res': 'ack',
        'read_res': 'ack',
        'device_id': '39FFBB9D6EBA',
        'device_sub_id': 0,
        'req_id': '',
        'modified_by': '',
        'set_level': '02',
        'cause': '',
        'result': 'OK',
        'error': ''
    };
    context.mock.method(
        clientWithFahrenheit._apiClient,
        'postSetParam',
        (hostname, deviceId, deviceSubId, value, callback) => {
            callback({'error': null, 'response': expectedResponse});
        }
    );
    context.after(() => {
        const mockedMethod = clientWithFahrenheit._apiClient.postSetParam.mock;

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments.length, 5);
        assert.strictEqual(mockedMethod.calls[0].arguments[0], '1.2.3.4');
        assert.strictEqual(mockedMethod.calls[0].arguments[1], '39FFBB9D6EBA');
        assert.strictEqual(mockedMethod.calls[0].arguments[2], '0');
        assert.strictEqual(Object.keys(mockedMethod.calls[0].arguments[3]).length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments[3]['iu_af_dir_vrt'], '4');
    });
    clientWithFahrenheit.resetDeviceCache('39FFBB9D6EBA');

    clientWithFahrenheit.setAirflowVerticalDirection('39FFBB9D6EBA', 5, (error, result) => {
        assert.strictEqual(error, null);
        assert.strictEqual(result, 4);

        done();
    });
});

test('airstage.lan.Client#setAirflowVerticalDirection calls _apiClient.postSetParam with error', (context, done) => {
    const expectedError = 'Error';
    context.mock.method(
        clientWithFahrenheit._apiClient,
        'postSetParam',
        (hostname, deviceId, deviceSubId, value, callback) => {
            callback({'error': expectedError, 'response': null});
        }
    );
    context.after(() => {
        const mockedMethod = clientWithFahrenheit._apiClient.postSetParam.mock;

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments.length, 5);
        assert.strictEqual(mockedMethod.calls[0].arguments[0], '1.2.3.4');
        assert.strictEqual(mockedMethod.calls[0].arguments[1], '39FFBB9D6EBA');
        assert.strictEqual(mockedMethod.calls[0].arguments[2], '0');
        assert.strictEqual(Object.keys(mockedMethod.calls[0].arguments[3]).length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments[3]['iu_af_dir_vrt'], '1');
    });
    clientWithFahrenheit.resetDeviceCache('39FFBB9D6EBA');

    clientWithFahrenheit.setAirflowVerticalDirection('39FFBB9D6EBA', 1, (error, result) => {
        assert.strictEqual(error, expectedError);
        assert.strictEqual(result, null);

        done();
    });
});

test('airstage.lan.Client#getAirflowVerticalSwingState calls _apiClient.postGetParam with success', (context, done) => {
    const expectedResponse = {
        'value': {
            'iu_af_swg_vrt': '1'
        },
        'read_res': 'ack',
        'device_id': '39FFBB9D6EBA',
        'device_sub_id': 0,
        'req_id': '',
        'modified_by': '',
        'set_level': '03',
        'cause': '',
        'result': 'OK',
        'error': ''
    };
    context.mock.method(
        clientWithFahrenheit._apiClient,
        'postGetParam',
        (hostname, deviceId, deviceSubId, list, callback) => {
            callback({'error': null, 'response': expectedResponse});
        }
    );
    context.after(() => {
        const mockedMethod = clientWithFahrenheit._apiClient.postGetParam.mock;

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments.length, 5);
        assert.strictEqual(mockedMethod.calls[0].arguments[0], '1.2.3.4');
        assert.strictEqual(mockedMethod.calls[0].arguments[1], '39FFBB9D6EBA');
        assert.strictEqual(mockedMethod.calls[0].arguments[2], '0');
        assert.strictEqual(mockedMethod.calls[0].arguments[3], airstage.constants.PARAMETER_NAMES);
    });
    clientWithFahrenheit.resetDeviceCache('39FFBB9D6EBA');

    clientWithFahrenheit.getAirflowVerticalSwingState('39FFBB9D6EBA', (error, result) => {
        assert.strictEqual(error, null);
        assert.strictEqual(result, 'ON');

        done();
    });
});

test('airstage.lan.Client#getAirflowVerticalSwingState calls _apiClient.postGetParam with error', (context, done) => {
    const expectedError = 'Error';
    context.mock.method(
        clientWithFahrenheit._apiClient,
        'postGetParam',
        (hostname, deviceId, deviceSubId, list, callback) => {
            callback({'error': expectedError, 'response': null});
        }
    );
    context.after(() => {
        const mockedMethod = clientWithFahrenheit._apiClient.postGetParam.mock;

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments.length, 5);
        assert.strictEqual(mockedMethod.calls[0].arguments[0], '1.2.3.4');
        assert.strictEqual(mockedMethod.calls[0].arguments[1], '39FFBB9D6EBA');
        assert.strictEqual(mockedMethod.calls[0].arguments[2], '0');
        assert.strictEqual(mockedMethod.calls[0].arguments[3], airstage.constants.PARAMETER_NAMES);
    });
    clientWithFahrenheit.resetDeviceCache('39FFBB9D6EBA');

    clientWithFahrenheit.getAirflowVerticalSwingState('39FFBB9D6EBA', (error, result) => {
        assert.strictEqual(error, expectedError);
        assert.strictEqual(result, null);

        done();
    });
});

test('airstage.lan.Client#setAirflowVerticalSwingState calls _apiClient.postSetParam with success', (context, done) => {
    const expectedResponse = {
        'value': {
            'iu_af_swg_vrt': '1'
        },
        'write_res': 'ack',
        'read_res': 'ack',
        'device_id': '39FFBB9D6EBA',
        'device_sub_id': 0,
        'req_id': '',
        'modified_by': '',
        'set_level': '02',
        'cause': '',
        'result': 'OK',
        'error': ''
    };
    context.mock.method(
        clientWithFahrenheit._apiClient,
        'postSetParam',
        (hostname, deviceId, deviceSubId, value, callback) => {
            callback({'error': null, 'response': expectedResponse});
        }
    );
    context.after(() => {
        const mockedMethod = clientWithFahrenheit._apiClient.postSetParam.mock;

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments.length, 5);
        assert.strictEqual(mockedMethod.calls[0].arguments[0], '1.2.3.4');
        assert.strictEqual(mockedMethod.calls[0].arguments[1], '39FFBB9D6EBA');
        assert.strictEqual(mockedMethod.calls[0].arguments[2], '0');
        assert.strictEqual(Object.keys(mockedMethod.calls[0].arguments[3]).length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments[3]['iu_af_swg_vrt'], '1');
    });
    clientWithFahrenheit.resetDeviceCache('39FFBB9D6EBA');

    clientWithFahrenheit.setAirflowVerticalSwingState('39FFBB9D6EBA', 'ON', (error, result) => {
        assert.strictEqual(error, null);
        assert.strictEqual(result, 'ON');

        done();
    });
});

test('airstage.lan.Client#setAirflowVerticalSwingState calls _apiClient.postSetParam with error', (context, done) => {
    const expectedError = 'Error';
    context.mock.method(
        clientWithFahrenheit._apiClient,
        'postSetParam',
        (hostname, deviceId, deviceSubId, value, callback) => {
            callback({'error': expectedError, 'response': null});
        }
    );
    context.after(() => {
        const mockedMethod = clientWithFahrenheit._apiClient.postSetParam.mock;

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments.length, 5);
        assert.strictEqual(mockedMethod.calls[0].arguments[0], '1.2.3.4');
        assert.strictEqual(mockedMethod.calls[0].arguments[1], '39FFBB9D6EBA');
        assert.strictEqual(mockedMethod.calls[0].arguments[2], '0');
        assert.strictEqual(Object.keys(mockedMethod.calls[0].arguments[3]).length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments[3]['iu_af_swg_vrt'], '1');
    });
    clientWithFahrenheit.resetDeviceCache('39FFBB9D6EBA');

    clientWithFahrenheit.setAirflowVerticalSwingState('39FFBB9D6EBA', 'ON', (error, result) => {
        assert.strictEqual(error, expectedError);
        assert.strictEqual(result, null);

        done();
    });
});

test('airstage.lan.Client#getPowerfulState calls _apiClient.postGetParam with success', (context, done) => {
    const expectedResponse = {
        'value': {
            'iu_powerful': '1'
        },
        'read_res': 'ack',
        'device_id': '39FFBB9D6EBA',
        'device_sub_id': 0,
        'req_id': '',
        'modified_by': '',
        'set_level': '03',
        'cause': '',
        'result': 'OK',
        'error': ''
    };
    context.mock.method(
        clientWithFahrenheit._apiClient,
        'postGetParam',
        (hostname, deviceId, deviceSubId, list, callback) => {
            callback({'error': null, 'response': expectedResponse});
        }
    );
    context.after(() => {
        const mockedMethod = clientWithFahrenheit._apiClient.postGetParam.mock;

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments.length, 5);
        assert.strictEqual(mockedMethod.calls[0].arguments[0], '1.2.3.4');
        assert.strictEqual(mockedMethod.calls[0].arguments[1], '39FFBB9D6EBA');
        assert.strictEqual(mockedMethod.calls[0].arguments[2], '0');
        assert.strictEqual(mockedMethod.calls[0].arguments[3], airstage.constants.PARAMETER_NAMES);
    });
    clientWithFahrenheit.resetDeviceCache('39FFBB9D6EBA');

    clientWithFahrenheit.getPowerfulState('39FFBB9D6EBA', (error, result) => {
        assert.strictEqual(error, null);
        assert.strictEqual(result, 'ON');

        done();
    });
});

test('airstage.lan.Client#getPowerfulState calls _apiClient.postGetParam with error', (context, done) => {
    const expectedError = 'Error';
    context.mock.method(
        clientWithFahrenheit._apiClient,
        'postGetParam',
        (hostname, deviceId, deviceSubId, list, callback) => {
            callback({'error': expectedError, 'response': null});
        }
    );
    context.after(() => {
        const mockedMethod = clientWithFahrenheit._apiClient.postGetParam.mock;

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments.length, 5);
        assert.strictEqual(mockedMethod.calls[0].arguments[0], '1.2.3.4');
        assert.strictEqual(mockedMethod.calls[0].arguments[1], '39FFBB9D6EBA');
        assert.strictEqual(mockedMethod.calls[0].arguments[2], '0');
        assert.strictEqual(mockedMethod.calls[0].arguments[3], airstage.constants.PARAMETER_NAMES);
    });
    clientWithFahrenheit.resetDeviceCache('39FFBB9D6EBA');

    clientWithFahrenheit.getPowerfulState('39FFBB9D6EBA', (error, result) => {
        assert.strictEqual(error, expectedError);
        assert.strictEqual(result, null);

        done();
    });
});

test('airstage.lan.Client#setPowerfulState calls _apiClient.postSetParam with success', (context, done) => {
    const expectedResponse = {
        'value': {
            'iu_powerful': '1'
        },
        'write_res': 'ack',
        'read_res': 'ack',
        'device_id': '39FFBB9D6EBA',
        'device_sub_id': 0,
        'req_id': '',
        'modified_by': '',
        'set_level': '02',
        'cause': '',
        'result': 'OK',
        'error': ''
    };
    context.mock.method(
        clientWithFahrenheit._apiClient,
        'postSetParam',
        (hostname, deviceId, deviceSubId, value, callback) => {
            callback({'error': null, 'response': expectedResponse});
        }
    );
    context.after(() => {
        const mockedMethod = clientWithFahrenheit._apiClient.postSetParam.mock;

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments.length, 5);
        assert.strictEqual(mockedMethod.calls[0].arguments[0], '1.2.3.4');
        assert.strictEqual(mockedMethod.calls[0].arguments[1], '39FFBB9D6EBA');
        assert.strictEqual(mockedMethod.calls[0].arguments[2], '0');
        assert.strictEqual(Object.keys(mockedMethod.calls[0].arguments[3]).length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments[3]['iu_powerful'], '1');
    });
    clientWithFahrenheit.resetDeviceCache('39FFBB9D6EBA');

    clientWithFahrenheit.setPowerfulState('39FFBB9D6EBA', 'ON', (error, result) => {
        assert.strictEqual(error, null);
        assert.strictEqual(result, 'ON');

        done();
    });
});

test('airstage.lan.Client#setPowerfulState calls _apiClient.postSetParam with error', (context, done) => {
    const expectedError = 'Error';
    context.mock.method(
        clientWithFahrenheit._apiClient,
        'postSetParam',
        (hostname, deviceId, deviceSubId, value, callback) => {
            callback({'error': expectedError, 'response': null});
        }
    );
    context.after(() => {
        const mockedMethod = clientWithFahrenheit._apiClient.postSetParam.mock;

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments.length, 5);
        assert.strictEqual(mockedMethod.calls[0].arguments[0], '1.2.3.4');
        assert.strictEqual(mockedMethod.calls[0].arguments[1], '39FFBB9D6EBA');
        assert.strictEqual(mockedMethod.calls[0].arguments[2], '0');
        assert.strictEqual(Object.keys(mockedMethod.calls[0].arguments[3]).length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments[3]['iu_powerful'], '1');
    });
    clientWithFahrenheit.resetDeviceCache('39FFBB9D6EBA');

    clientWithFahrenheit.setPowerfulState('39FFBB9D6EBA', 'ON', (error, result) => {
        assert.strictEqual(error, expectedError);
        assert.strictEqual(result, null);

        done();
    });
});

test('airstage.lan.Client#getEconomyState calls _apiClient.postGetParam with success', (context, done) => {
    const expectedResponse = {
        'value': {
            'iu_economy': '1'
        },
        'read_res': 'ack',
        'device_id': '39FFBB9D6EBA',
        'device_sub_id': 0,
        'req_id': '',
        'modified_by': '',
        'set_level': '03',
        'cause': '',
        'result': 'OK',
        'error': ''
    };
    context.mock.method(
        clientWithFahrenheit._apiClient,
        'postGetParam',
        (hostname, deviceId, deviceSubId, list, callback) => {
            callback({'error': null, 'response': expectedResponse});
        }
    );
    context.after(() => {
        const mockedMethod = clientWithFahrenheit._apiClient.postGetParam.mock;

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments.length, 5);
        assert.strictEqual(mockedMethod.calls[0].arguments[0], '1.2.3.4');
        assert.strictEqual(mockedMethod.calls[0].arguments[1], '39FFBB9D6EBA');
        assert.strictEqual(mockedMethod.calls[0].arguments[2], '0');
        assert.strictEqual(mockedMethod.calls[0].arguments[3], airstage.constants.PARAMETER_NAMES);
    });
    clientWithFahrenheit.resetDeviceCache('39FFBB9D6EBA');

    clientWithFahrenheit.getEconomyState('39FFBB9D6EBA', (error, result) => {
        assert.strictEqual(error, null);
        assert.strictEqual(result, 'ON');

        done();
    });
});

test('airstage.lan.Client#getEconomyState calls _apiClient.postGetParam with error', (context, done) => {
    const expectedError = 'Error';
    context.mock.method(
        clientWithFahrenheit._apiClient,
        'postGetParam',
        (hostname, deviceId, deviceSubId, list, callback) => {
            callback({'error': expectedError, 'response': null});
        }
    );
    context.after(() => {
        const mockedMethod = clientWithFahrenheit._apiClient.postGetParam.mock;

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments.length, 5);
        assert.strictEqual(mockedMethod.calls[0].arguments[0], '1.2.3.4');
        assert.strictEqual(mockedMethod.calls[0].arguments[1], '39FFBB9D6EBA');
        assert.strictEqual(mockedMethod.calls[0].arguments[2], '0');
        assert.strictEqual(mockedMethod.calls[0].arguments[3], airstage.constants.PARAMETER_NAMES);
    });
    clientWithFahrenheit.resetDeviceCache('39FFBB9D6EBA');

    clientWithFahrenheit.getEconomyState('39FFBB9D6EBA', (error, result) => {
        assert.strictEqual(error, expectedError);
        assert.strictEqual(result, null);

        done();
    });
});

test('airstage.lan.Client#setEconomyState calls _apiClient.postSetParam with success', (context, done) => {
    const expectedResponse = {
        'value': {
            'iu_economy': '1'
        },
        'write_res': 'ack',
        'read_res': 'ack',
        'device_id': '39FFBB9D6EBA',
        'device_sub_id': 0,
        'req_id': '',
        'modified_by': '',
        'set_level': '02',
        'cause': '',
        'result': 'OK',
        'error': ''
    };
    context.mock.method(
        clientWithFahrenheit._apiClient,
        'postSetParam',
        (hostname, deviceId, deviceSubId, value, callback) => {
            callback({'error': null, 'response': expectedResponse});
        }
    );
    context.after(() => {
        const mockedMethod = clientWithFahrenheit._apiClient.postSetParam.mock;

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments.length, 5);
        assert.strictEqual(mockedMethod.calls[0].arguments[0], '1.2.3.4');
        assert.strictEqual(mockedMethod.calls[0].arguments[1], '39FFBB9D6EBA');
        assert.strictEqual(mockedMethod.calls[0].arguments[2], '0');
        assert.strictEqual(Object.keys(mockedMethod.calls[0].arguments[3]).length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments[3]['iu_economy'], '1');
    });
    clientWithFahrenheit.resetDeviceCache('39FFBB9D6EBA');

    clientWithFahrenheit.setEconomyState('39FFBB9D6EBA', 'ON', (error, result) => {
        assert.strictEqual(error, null);
        assert.strictEqual(result, 'ON');

        done();
    });
});

test('airstage.lan.Client#setEconomyState calls _apiClient.postSetParam with error', (context, done) => {
    const expectedError = 'Error';
    context.mock.method(
        clientWithFahrenheit._apiClient,
        'postSetParam',
        (hostname, deviceId, deviceSubId, value, callback) => {
            callback({'error': expectedError, 'response': null});
        }
    );
    context.after(() => {
        const mockedMethod = clientWithFahrenheit._apiClient.postSetParam.mock;

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments.length, 5);
        assert.strictEqual(mockedMethod.calls[0].arguments[0], '1.2.3.4');
        assert.strictEqual(mockedMethod.calls[0].arguments[1], '39FFBB9D6EBA');
        assert.strictEqual(mockedMethod.calls[0].arguments[2], '0');
        assert.strictEqual(Object.keys(mockedMethod.calls[0].arguments[3]).length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments[3]['iu_economy'], '1');
    });
    clientWithFahrenheit.resetDeviceCache('39FFBB9D6EBA');

    clientWithFahrenheit.setEconomyState('39FFBB9D6EBA', 'ON', (error, result) => {
        assert.strictEqual(error, expectedError);
        assert.strictEqual(result, null);

        done();
    });
});

test('airstage.lan.Client#getEnergySavingFanState calls _apiClient.postGetParam with success', (context, done) => {
    const expectedResponse = {
        'value': {
            'iu_fan_ctrl': '1'
        },
        'read_res': 'ack',
        'device_id': '39FFBB9D6EBA',
        'device_sub_id': 0,
        'req_id': '',
        'modified_by': '',
        'set_level': '03',
        'cause': '',
        'result': 'OK',
        'error': ''
    };
    context.mock.method(
        clientWithFahrenheit._apiClient,
        'postGetParam',
        (hostname, deviceId, deviceSubId, list, callback) => {
            callback({'error': null, 'response': expectedResponse});
        }
    );
    context.after(() => {
        const mockedMethod = clientWithFahrenheit._apiClient.postGetParam.mock;

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments.length, 5);
        assert.strictEqual(mockedMethod.calls[0].arguments[0], '1.2.3.4');
        assert.strictEqual(mockedMethod.calls[0].arguments[1], '39FFBB9D6EBA');
        assert.strictEqual(mockedMethod.calls[0].arguments[2], '0');
        assert.strictEqual(mockedMethod.calls[0].arguments[3], airstage.constants.PARAMETER_NAMES);
    });
    clientWithFahrenheit.resetDeviceCache('39FFBB9D6EBA');

    clientWithFahrenheit.getEnergySavingFanState('39FFBB9D6EBA', (error, result) => {
        assert.strictEqual(error, null);
        assert.strictEqual(result, 'ON');

        done();
    });
});

test('airstage.lan.Client#getEnergySavingFanState calls _apiClient.postGetParam with error', (context, done) => {
    const expectedError = 'Error';
    context.mock.method(
        clientWithFahrenheit._apiClient,
        'postGetParam',
        (hostname, deviceId, deviceSubId, list, callback) => {
            callback({'error': expectedError, 'response': null});
        }
    );
    context.after(() => {
        const mockedMethod = clientWithFahrenheit._apiClient.postGetParam.mock;

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments.length, 5);
        assert.strictEqual(mockedMethod.calls[0].arguments[0], '1.2.3.4');
        assert.strictEqual(mockedMethod.calls[0].arguments[1], '39FFBB9D6EBA');
        assert.strictEqual(mockedMethod.calls[0].arguments[2], '0');
        assert.strictEqual(mockedMethod.calls[0].arguments[3], airstage.constants.PARAMETER_NAMES);
    });
    clientWithFahrenheit.resetDeviceCache('39FFBB9D6EBA');

    clientWithFahrenheit.getEnergySavingFanState('39FFBB9D6EBA', (error, result) => {
        assert.strictEqual(error, expectedError);
        assert.strictEqual(result, null);

        done();
    });
});

test('airstage.lan.Client#setEnergySavingFanState calls _apiClient.postSetParam with success', (context, done) => {
    const expectedResponse = {
        'value': {
            'iu_fan_ctrl': '1'
        },
        'write_res': 'ack',
        'read_res': 'ack',
        'device_id': '39FFBB9D6EBA',
        'device_sub_id': 0,
        'req_id': '',
        'modified_by': '',
        'set_level': '02',
        'cause': '',
        'result': 'OK',
        'error': ''
    };
    context.mock.method(
        clientWithFahrenheit._apiClient,
        'postSetParam',
        (hostname, deviceId, deviceSubId, value, callback) => {
            callback({'error': null, 'response': expectedResponse});
        }
    );
    context.after(() => {
        const mockedMethod = clientWithFahrenheit._apiClient.postSetParam.mock;

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments.length, 5);
        assert.strictEqual(mockedMethod.calls[0].arguments[0], '1.2.3.4');
        assert.strictEqual(mockedMethod.calls[0].arguments[1], '39FFBB9D6EBA');
        assert.strictEqual(mockedMethod.calls[0].arguments[2], '0');
        assert.strictEqual(Object.keys(mockedMethod.calls[0].arguments[3]).length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments[3]['iu_fan_ctrl'], '1');
    });
    clientWithFahrenheit.resetDeviceCache('39FFBB9D6EBA');

    clientWithFahrenheit.setEnergySavingFanState('39FFBB9D6EBA', 'ON', (error, result) => {
        assert.strictEqual(error, null);
        assert.strictEqual(result, 'ON');

        done();
    });
});

test('airstage.lan.Client#setEnergySavingFanState calls _apiClient.postSetParam with error', (context, done) => {
    const expectedError = 'Error';
    context.mock.method(
        clientWithFahrenheit._apiClient,
        'postSetParam',
        (hostname, deviceId, deviceSubId, value, callback) => {
            callback({'error': expectedError, 'response': null});
        }
    );
    context.after(() => {
        const mockedMethod = clientWithFahrenheit._apiClient.postSetParam.mock;

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments.length, 5);
        assert.strictEqual(mockedMethod.calls[0].arguments[0], '1.2.3.4');
        assert.strictEqual(mockedMethod.calls[0].arguments[1], '39FFBB9D6EBA');
        assert.strictEqual(mockedMethod.calls[0].arguments[2], '0');
        assert.strictEqual(Object.keys(mockedMethod.calls[0].arguments[3]).length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments[3]['iu_fan_ctrl'], '1');
    });
    clientWithFahrenheit.resetDeviceCache('39FFBB9D6EBA');

    clientWithFahrenheit.setEnergySavingFanState('39FFBB9D6EBA', 'ON', (error, result) => {
        assert.strictEqual(error, expectedError);
        assert.strictEqual(result, null);

        done();
    });
});

test('airstage.lan.Client#getMinimumHeatState calls _apiClient.postGetParam with success', (context, done) => {
    const expectedResponse = {
        'value': {
            'iu_min_heat': '1'
        },
        'read_res': 'ack',
        'device_id': '39FFBB9D6EBA',
        'device_sub_id': 0,
        'req_id': '',
        'modified_by': '',
        'set_level': '03',
        'cause': '',
        'result': 'OK',
        'error': ''
    };
    context.mock.method(
        clientWithFahrenheit._apiClient,
        'postGetParam',
        (hostname, deviceId, deviceSubId, list, callback) => {
            callback({'error': null, 'response': expectedResponse});
        }
    );
    context.after(() => {
        const mockedMethod = clientWithFahrenheit._apiClient.postGetParam.mock;

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments.length, 5);
        assert.strictEqual(mockedMethod.calls[0].arguments[0], '1.2.3.4');
        assert.strictEqual(mockedMethod.calls[0].arguments[1], '39FFBB9D6EBA');
        assert.strictEqual(mockedMethod.calls[0].arguments[2], '0');
        assert.strictEqual(mockedMethod.calls[0].arguments[3], airstage.constants.PARAMETER_NAMES);
    });
    clientWithFahrenheit.resetDeviceCache('39FFBB9D6EBA');

    clientWithFahrenheit.getMinimumHeatState('39FFBB9D6EBA', (error, result) => {
        assert.strictEqual(error, null);
        assert.strictEqual(result, 'ON');

        done();
    });
});

test('airstage.lan.Client#getMinimumHeatState calls _apiClient.postGetParam with error', (context, done) => {
    const expectedError = 'Error';
    context.mock.method(
        clientWithFahrenheit._apiClient,
        'postGetParam',
        (hostname, deviceId, deviceSubId, list, callback) => {
            callback({'error': expectedError, 'response': null});
        }
    );
    context.after(() => {
        const mockedMethod = clientWithFahrenheit._apiClient.postGetParam.mock;

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments.length, 5);
        assert.strictEqual(mockedMethod.calls[0].arguments[0], '1.2.3.4');
        assert.strictEqual(mockedMethod.calls[0].arguments[1], '39FFBB9D6EBA');
        assert.strictEqual(mockedMethod.calls[0].arguments[2], '0');
        assert.strictEqual(mockedMethod.calls[0].arguments[3], airstage.constants.PARAMETER_NAMES);
    });
    clientWithFahrenheit.resetDeviceCache('39FFBB9D6EBA');

    clientWithFahrenheit.getMinimumHeatState('39FFBB9D6EBA', (error, result) => {
        assert.strictEqual(error, expectedError);
        assert.strictEqual(result, null);

        done();
    });
});

test('airstage.lan.Client#setMinimumHeatState with "ON" calls _apiClient.postSetParam with success', (context, done) => {
    const expectedResponse = {
        'value': {
            'iu_min_heat': '1'
        },
        'write_res': 'ack',
        'read_res': 'ack',
        'device_id': '39FFBB9D6EBA',
        'device_sub_id': 0,
        'req_id': '',
        'modified_by': '',
        'set_level': '02',
        'cause': '',
        'result': 'OK',
        'error': ''
    };
    context.mock.method(
        clientWithFahrenheit._apiClient,
        'postSetParam',
        (hostname, deviceId, deviceSubId, value, callback) => {
            callback({'error': null, 'response': expectedResponse});
        }
    );
    context.after(() => {
        const mockedMethod = clientWithFahrenheit._apiClient.postSetParam.mock;

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments.length, 5);
        assert.strictEqual(mockedMethod.calls[0].arguments[0], '1.2.3.4');
        assert.strictEqual(mockedMethod.calls[0].arguments[1], '39FFBB9D6EBA');
        assert.strictEqual(mockedMethod.calls[0].arguments[2], '0');
        assert.strictEqual(Object.keys(mockedMethod.calls[0].arguments[3]).length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments[3]['iu_min_heat'], '1');
    });
    clientWithFahrenheit.resetDeviceCache('39FFBB9D6EBA');

    clientWithFahrenheit.setMinimumHeatState('39FFBB9D6EBA', 'ON', (error, result) => {
        assert.strictEqual(error, null);
        assert.strictEqual(result, 'ON');

        clientWithFahrenheit.getDevice('39FFBB9D6EBA', (error, result) => {
            assert.strictEqual(error, null);
            assert.strictEqual(Object.keys(result.parameters).length, 5);
            assert.strictEqual(result.parameters['iu_min_heat'], '1');
            assert.strictEqual(result.parameters['iu_onoff'], '1');
            assert.strictEqual(result.parameters['iu_fan_spd'], '0');
            assert.strictEqual(result.parameters['iu_op_mode'], '4');
            assert.strictEqual(result.parameters['iu_set_tmp'], '100');

            done();
        });
    });
});

test('airstage.lan.Client#setMinimumHeatState with "OFF" calls _apiClient.postSetParam with success', (context, done) => {
    const expectedResponse = {
        'value': {
            'iu_min_heat': '0'
        },
        'write_res': 'ack',
        'read_res': 'ack',
        'device_id': '39FFBB9D6EBA',
        'device_sub_id': 0,
        'req_id': '',
        'modified_by': '',
        'set_level': '02',
        'cause': '',
        'result': 'OK',
        'error': ''
    };
    context.mock.method(
        clientWithFahrenheit._apiClient,
        'postSetParam',
        (hostname, deviceId, deviceSubId, value, callback) => {
            callback({'error': null, 'response': expectedResponse});
        }
    );
    context.after(() => {
        const mockedMethod = clientWithFahrenheit._apiClient.postSetParam.mock;

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments.length, 5);
        assert.strictEqual(mockedMethod.calls[0].arguments[0], '1.2.3.4');
        assert.strictEqual(mockedMethod.calls[0].arguments[1], '39FFBB9D6EBA');
        assert.strictEqual(mockedMethod.calls[0].arguments[2], '0');
        assert.strictEqual(Object.keys(mockedMethod.calls[0].arguments[3]).length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments[3]['iu_min_heat'], '0');
    });
    clientWithFahrenheit.resetDeviceCache('39FFBB9D6EBA');

    clientWithFahrenheit.setMinimumHeatState('39FFBB9D6EBA', 'OFF', (error, result) => {
        assert.strictEqual(error, null);
        assert.strictEqual(result, 'OFF');

        clientWithFahrenheit.getDevice('39FFBB9D6EBA', (error, result) => {
            assert.strictEqual(error, null);
            assert.strictEqual(Object.keys(result.parameters).length, 2);
            assert.strictEqual(result.parameters['iu_min_heat'], '0');
            assert.strictEqual(result.parameters['iu_onoff'], '0');

            done();
        });
    });
});

test('airstage.lan.Client#setMinimumHeatState calls _apiClient.postSetParam with error', (context, done) => {
    const expectedError = 'Error';
    context.mock.method(
        clientWithFahrenheit._apiClient,
        'postSetParam',
        (hostname, deviceId, deviceSubId, value, callback) => {
            callback({'error': expectedError, 'response': null});
        }
    );
    context.after(() => {
        const mockedMethod = clientWithFahrenheit._apiClient.postSetParam.mock;

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments.length, 5);
        assert.strictEqual(mockedMethod.calls[0].arguments[0], '1.2.3.4');
        assert.strictEqual(mockedMethod.calls[0].arguments[1], '39FFBB9D6EBA');
        assert.strictEqual(mockedMethod.calls[0].arguments[2], '0');
        assert.strictEqual(Object.keys(mockedMethod.calls[0].arguments[3]).length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments[3]['iu_min_heat'], '1');
    });
    clientWithFahrenheit.resetDeviceCache('39FFBB9D6EBA');

    clientWithFahrenheit.setMinimumHeatState('39FFBB9D6EBA', 'ON', (error, result) => {
        assert.strictEqual(error, expectedError);
        assert.strictEqual(result, null);

        done();
    });
});

test('airstage.lan.Client#getParameter with null parameter calls _apiClient.postGetParam with error', (context, done) => {
    const expectedError = 'Parameter not available: iu_min_heat';
    const expectedResponse = {
        'value': {
            'iu_min_heat': null
        },
        'read_res': 'ack',
        'device_id': '39FFBB9D6EBA',
        'device_sub_id': 0,
        'req_id': '',
        'modified_by': '',
        'set_level': '03',
        'cause': '',
        'result': 'OK',
        'error': ''
    };
    context.mock.method(
        clientWithFahrenheit._apiClient,
        'postGetParam',
        (hostname, deviceId, deviceSubId, list, callback) => {
            callback({'error': null, 'response': expectedResponse});
        }
    );
    context.after(() => {
        const mockedMethod = clientWithFahrenheit._apiClient.postGetParam.mock;

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments.length, 5);
        assert.strictEqual(mockedMethod.calls[0].arguments[0], '1.2.3.4');
        assert.strictEqual(mockedMethod.calls[0].arguments[1], '39FFBB9D6EBA');
        assert.strictEqual(mockedMethod.calls[0].arguments[2], '0');
        assert.strictEqual(mockedMethod.calls[0].arguments[3], airstage.constants.PARAMETER_NAMES);
    });
    clientWithFahrenheit.resetDeviceCache('39FFBB9D6EBA');

    clientWithFahrenheit.getParameter('39FFBB9D6EBA', 'iu_min_heat', (error, result) => {
        assert.strictEqual(error, expectedError);
        assert.strictEqual(result, null);

        done();
    });
});

test('airstage.lan.Client#getParameter with undefined parameter calls _apiClient.postGetParam with error', (context, done) => {
    const expectedError = 'Parameter not available: foo';
    const expectedResponse = {
        'value': {
            'iu_min_heat': '1'
        },
        'read_res': 'ack',
        'device_id': '39FFBB9D6EBA',
        'device_sub_id': 0,
        'req_id': '',
        'modified_by': '',
        'set_level': '03',
        'cause': '',
        'result': 'OK',
        'error': ''
    };
    context.mock.method(
        clientWithFahrenheit._apiClient,
        'postGetParam',
        (hostname, deviceId, deviceSubId, list, callback) => {
            callback({'error': null, 'response': expectedResponse});
        }
    );
    context.after(() => {
        const mockedMethod = clientWithFahrenheit._apiClient.postGetParam.mock;

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments.length, 5);
        assert.strictEqual(mockedMethod.calls[0].arguments[0], '1.2.3.4');
        assert.strictEqual(mockedMethod.calls[0].arguments[1], '39FFBB9D6EBA');
        assert.strictEqual(mockedMethod.calls[0].arguments[2], '0');
        assert.strictEqual(mockedMethod.calls[0].arguments[3], airstage.constants.PARAMETER_NAMES);
    });
    clientWithFahrenheit.resetDeviceCache('39FFBB9D6EBA');

    clientWithFahrenheit.getParameter('39FFBB9D6EBA', 'foo', (error, result) => {
        assert.strictEqual(error, expectedError);
        assert.strictEqual(result, null);

        done();
    });
});

test('airstage.lan.Client#setParameter with unknown device ID returns error', (context, done) => {
    const expectedError = 'No hostname for device ID: foo';

    clientWithFahrenheit.setParameter('foo', 'iu_min_heat', '1', (error, result) => {
        assert.strictEqual(error, expectedError);
        assert.strictEqual(result, null);

        done();
    });
});

test('airstage.lan.Client#getDevice with unknown device ID returns error', (context, done) => {
    const expectedError = 'No hostname for device ID: foo';

    clientWithFahrenheit.getDevice('foo', (error, result) => {
        assert.strictEqual(error, expectedError);
        assert.strictEqual(result, null);

        done();
    });
});

test('airstage.lan.Client#getDevices with cache hit returns devices', (context, done) => {
    clientWithFahrenheit.resetDeviceCache();
    clientWithFahrenheit._setDeviceParameterCache('39FFBB9D6EBA', {'parameters': [{'name': 'iu_min_heat', 'value': '1'}]});
    clientWithFahrenheit._setDeviceParameterCache('96658F1BF601', {'parameters': [{'name': 'iu_min_heat', 'value': '0'}]});

    clientWithFahrenheit.getDevices(0, (error, result) => {
        assert.strictEqual(error, null);
        assert.strictEqual(Object.keys(result).length, 1);
        assert.strictEqual(Object.keys(result.parameters).length, 2);
        assert.strictEqual(Object.keys(result.parameters['39FFBB9D6EBA']).length, 1);
        assert.strictEqual(result.parameters['39FFBB9D6EBA']['iu_min_heat'], '1');
        assert.strictEqual(Object.keys(result.parameters['96658F1BF601']).length, 1);
        assert.strictEqual(result.parameters['96658F1BF601']['iu_min_heat'], '0');

        done();
    });
});

test('airstage.lan.Client#getDevices without cache hit calls _apiClient.postGetParam with success', (context, done) => {
    const expectedResponse = {
        'value': {
            'iu_model': 'AZ123'
        },
        'read_res': 'ack',
        'device_id': '39FFBB9D6EBA',
        'device_sub_id': 0,
        'req_id': '',
        'modified_by': '',
        'set_level': '03',
        'cause': '',
        'result': 'OK',
        'error': ''
    };
    context.mock.method(
        clientWithFahrenheit._apiClient,
        'postGetParam',
        (hostname, deviceId, deviceSubId, list, callback) => {
            callback({'error': null, 'response': expectedResponse});
        }
    );
    context.after(() => {
        const mockedMethod = clientWithFahrenheit._apiClient.postGetParam.mock;

        assert.strictEqual(mockedMethod.calls.length, 2);
        assert.strictEqual(mockedMethod.calls[0].arguments.length, 5);
        assert.strictEqual(mockedMethod.calls[0].arguments[0], '1.2.3.4');
        assert.strictEqual(mockedMethod.calls[0].arguments[1], '39FFBB9D6EBA');
        assert.strictEqual(mockedMethod.calls[0].arguments[2], '0');
        assert.strictEqual(mockedMethod.calls[0].arguments[3], airstage.constants.PARAMETER_NAMES);
        assert.strictEqual(mockedMethod.calls[1].arguments.length, 5);
        assert.strictEqual(mockedMethod.calls[1].arguments[0], '2.3.4.5');
        assert.strictEqual(mockedMethod.calls[1].arguments[1], '96658F1BF601');
        assert.strictEqual(mockedMethod.calls[1].arguments[2], '0');
        assert.strictEqual(mockedMethod.calls[1].arguments[3], airstage.constants.PARAMETER_NAMES);
    });
    clientWithFahrenheit.resetDeviceCache();

    clientWithFahrenheit.getDevices(0, (error, result) => {
        assert.strictEqual(error, null);
        assert.strictEqual(Object.keys(result).length, 1);
        assert.strictEqual(Object.keys(result.parameters).length, 2);
        assert.strictEqual(Object.keys(result.parameters['39FFBB9D6EBA']).length, 1);
        assert.strictEqual(result.parameters['39FFBB9D6EBA']['iu_model'], 'AZ123');
        assert.strictEqual(Object.keys(result.parameters['96658F1BF601']).length, 1);
        assert.strictEqual(result.parameters['96658F1BF601']['iu_model'], 'AZ123');

        done();
    });
});

test('airstage.lan.Client#refreshDeviceCache calls _apiClient.postGetParam with success', (context, done) => {
    const expectedResponse = {
        'value': {
            'iu_model': 'AZ123'
        },
        'read_res': 'ack',
        'device_id': '39FFBB9D6EBA',
        'device_sub_id': 0,
        'req_id': '',
        'modified_by': '',
        'set_level': '03',
        'cause': '',
        'result': 'OK',
        'error': ''
    };
    context.mock.method(
        clientWithFahrenheit._apiClient,
        'postGetParam',
        (hostname, deviceId, deviceSubId, list, callback) => {
            callback({'error': null, 'response': expectedResponse});
        }
    );
    context.after(() => {
        const mockedMethod = clientWithFahrenheit._apiClient.postGetParam.mock;

        assert.strictEqual(mockedMethod.calls.length, 2);
        assert.strictEqual(mockedMethod.calls[0].arguments.length, 5);
        assert.strictEqual(mockedMethod.calls[0].arguments[0], '1.2.3.4');
        assert.strictEqual(mockedMethod.calls[0].arguments[1], '39FFBB9D6EBA');
        assert.strictEqual(mockedMethod.calls[0].arguments[2], '0');
        assert.strictEqual(mockedMethod.calls[0].arguments[3], airstage.constants.PARAMETER_NAMES);
        assert.strictEqual(mockedMethod.calls[1].arguments.length, 5);
        assert.strictEqual(mockedMethod.calls[1].arguments[0], '2.3.4.5');
        assert.strictEqual(mockedMethod.calls[1].arguments[1], '96658F1BF601');
        assert.strictEqual(mockedMethod.calls[1].arguments[2], '0');
        assert.strictEqual(mockedMethod.calls[1].arguments[3], airstage.constants.PARAMETER_NAMES);
    });
    clientWithFahrenheit.resetDeviceCache();

    clientWithFahrenheit.refreshDeviceCache((error, result) => {
        assert.strictEqual(error, null);
        assert.strictEqual(Object.keys(result).length, 1);
        assert.strictEqual(Object.keys(result.parameters).length, 2);
        assert.strictEqual(Object.keys(result.parameters['39FFBB9D6EBA']).length, 1);
        assert.strictEqual(result.parameters['39FFBB9D6EBA']['iu_model'], 'AZ123');
        assert.strictEqual(Object.keys(result.parameters['96658F1BF601']).length, 1);
        assert.strictEqual(result.parameters['96658F1BF601']['iu_model'], 'AZ123');

        done();
    });
});

test('airstage.lan.Client#refreshDeviceCache calls _apiClient.postGetParam with error', (context, done) => {
    const expectedError = 'Error';
    context.mock.method(
        clientWithFahrenheit._apiClient,
        'postGetParam',
        (hostname, deviceId, deviceSubId, list, callback) => {
            callback({'error': expectedError, 'response': null});
        }
    );
    context.after(() => {
        const mockedMethod = clientWithFahrenheit._apiClient.postGetParam.mock;

        assert.strictEqual(mockedMethod.calls.length, 2);
        assert.strictEqual(mockedMethod.calls[0].arguments.length, 5);
        assert.strictEqual(mockedMethod.calls[0].arguments[0], '1.2.3.4');
        assert.strictEqual(mockedMethod.calls[0].arguments[1], '39FFBB9D6EBA');
        assert.strictEqual(mockedMethod.calls[0].arguments[2], '0');
        assert.strictEqual(mockedMethod.calls[0].arguments[3], airstage.constants.PARAMETER_NAMES);
        assert.strictEqual(mockedMethod.calls[1].arguments.length, 5);
        assert.strictEqual(mockedMethod.calls[1].arguments[0], '2.3.4.5');
        assert.strictEqual(mockedMethod.calls[1].arguments[1], '96658F1BF601');
        assert.strictEqual(mockedMethod.calls[1].arguments[2], '0');
        assert.strictEqual(mockedMethod.calls[1].arguments[3], airstage.constants.PARAMETER_NAMES);
    });
    clientWithFahrenheit.resetDeviceCache();

    clientWithFahrenheit.refreshDeviceCache((error, result) => {
        assert.strictEqual(Object.keys(error).length, 2);
        assert.strictEqual(error['39FFBB9D6EBA'], expectedError);
        assert.strictEqual(error['96658F1BF601'], expectedError);
        assert.strictEqual(result, null);

        done();
    });
});
