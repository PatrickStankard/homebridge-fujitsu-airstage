'use strict';

const assert = require('node:assert');
const { mock, test } = require('node:test');
const airstage = require('./../../src/airstage');

const clientWithAccessToken = new airstage.Client(
    'us',
    'United States',
    'en',
    'example@example.com',
    'password',
    null,
    null,
    'existingAccessToken',
    '2099-01-01',
    'existingRefreshToken'
);
const clientWithoutAccessToken = new airstage.Client(
    'us',
    'United States',
    'en',
    'example@example.com',
    'password'
);

test('airstage.Client#refreshTokenOrAuthenticate calls _apiClient.postUsersMeRefreshToken with success', (context, done) => {
    const expectedResponse = {
        'accessToken': 'testAccessToken',
        'expiresIn': 3600,
        'refreshToken': 'testRefreshToken'
    };
    context.mock.method(
        clientWithAccessToken._apiClient,
        'postUsersMeRefreshToken',
        (refreshToken, callback) => {
            callback({'error': null, 'response': expectedResponse});
        }
    );
    context.after(() => {
        const mockedMethod = clientWithAccessToken._apiClient.postUsersMeRefreshToken.mock;

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments[0], 'existingRefreshToken');
    });

    clientWithAccessToken.refreshTokenOrAuthenticate((error, result) => {
        assert.strictEqual(error, null);
        assert.strictEqual(result, expectedResponse);

        done();
    });
});

test('airstage.Client#refreshTokenOrAuthenticate calls _apiClient.postUsersMeRefreshToken with error', (context, done) => {
    const expectedError = 'Error';
    context.mock.method(
        clientWithAccessToken._apiClient,
        'postUsersMeRefreshToken',
        (refreshToken, callback) => {
            callback({'error': expectedError, 'response': null});
        }
    );
    context.after(() => {
        const mockedMethod = clientWithAccessToken._apiClient.postUsersMeRefreshToken.mock;

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments[0], 'existingRefreshToken');
    });

    clientWithAccessToken.refreshTokenOrAuthenticate((error, result) => {
        assert.strictEqual(error, expectedError);
        assert.strictEqual(result, null);

        done();
    });
});

test('airstage.Client#refreshTokenOrAuthenticate calls _apiClient.postUsersSignIn with success', (context, done) => {
    const expectedResponse = {
        'accessToken': 'testAccessToken',
        'expiresIn': 3600,
        'refreshToken': 'testRefreshToken'
    };
    context.mock.method(
        clientWithoutAccessToken._apiClient,
        'postUsersSignIn',
        (email, password, callback) => {
            callback({'error': null, 'response': expectedResponse});
        }
    );
    context.after(() => {
        const mockedMethod = clientWithoutAccessToken._apiClient.postUsersSignIn.mock;

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments[0], 'example@example.com');
        assert.strictEqual(mockedMethod.calls[0].arguments[1], 'password');
    });

    clientWithoutAccessToken.refreshTokenOrAuthenticate((error, result) => {
        assert.strictEqual(error, null);
        assert.strictEqual(result, expectedResponse);

        done();
    });
});

test('airstage.Client#refreshTokenOrAuthenticate calls _apiClient.postUsersSignIn with error', (context, done) => {
    const expectedError = 'Error';
    context.mock.method(
        clientWithoutAccessToken._apiClient,
        'postUsersSignIn',
        (email, password, callback) => {
            callback({'error': expectedError, 'response': null});
        }
    );
    context.after(() => {
        const mockedMethod = clientWithoutAccessToken._apiClient.postUsersSignIn.mock;

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments[0], 'example@example.com');
        assert.strictEqual(mockedMethod.calls[0].arguments[1], 'password');
    });

    clientWithoutAccessToken.refreshTokenOrAuthenticate((error, result) => {
        assert.strictEqual(error, expectedError);
        assert.strictEqual(result, null);

        done();
    });
});

test('airstage.Client#refreshTokenOrAuthenticate returns error', (context, done) => {
    const client = new airstage.Client(
        'us',
        'United States',
        'en'
    );
    const expectedResponse = {
        'accessToken': 'testAccessToken',
        'expiresIn': 3600,
        'refreshToken': 'testRefreshToken'
    };
    context.mock.method(
        client._apiClient,
        'postUsersMeRefreshToken'
    );
    context.mock.method(
        client._apiClient,
        'postUsersSignIn'
    );
    context.after(() => {
        const mockedRefreshMethod = client._apiClient.postUsersMeRefreshToken.mock;
        const mockedAuthenticateMethod = client._apiClient.postUsersSignIn.mock;

        assert.strictEqual(mockedRefreshMethod.calls.length, 0);
        assert.strictEqual(mockedAuthenticateMethod.calls.length, 0);
    });

    client.refreshTokenOrAuthenticate((error, result) => {
        assert.strictEqual(error, 'Could not refresh token or authenticate');
        assert.strictEqual(result, null);

        done();
    });
});

test('airstage.Client#authenticate calls _apiClient.postUsersSignIn with success', (context, done) => {
    const expectedResponse = {
        'accessToken': 'testAccessToken',
        'expiresIn': 3600,
        'refreshToken': 'testRefreshToken'
    };
    context.mock.method(
        clientWithAccessToken._apiClient,
        'postUsersSignIn',
        (email, password, callback) => {
            callback({'error': null, 'response': expectedResponse});
        }
    );
    context.after(() => {
        const mockedMethod = clientWithAccessToken._apiClient.postUsersSignIn.mock;

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments[0], 'example@example.com');
        assert.strictEqual(mockedMethod.calls[0].arguments[1], 'password');
    });

    clientWithAccessToken.authenticate((error, result) => {
        assert.strictEqual(error, null);
        assert.strictEqual(result, expectedResponse);

        done();
    });
});

test('airstage.Client#authenticate calls _apiClient.postUsersSignIn with error', (context, done) => {
    const expectedError = 'Error';
    context.mock.method(
        clientWithAccessToken._apiClient,
        'postUsersSignIn',
        (email, password, callback) => {
            callback({'error': expectedError, 'response': null});
        }
    );
    context.after(() => {
        const mockedMethod = clientWithAccessToken._apiClient.postUsersSignIn.mock;

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments[0], 'example@example.com');
        assert.strictEqual(mockedMethod.calls[0].arguments[1], 'password');
    });

    clientWithAccessToken.authenticate((error, result) => {
        assert.strictEqual(error, expectedError);
        assert.strictEqual(result, null);

        done();
    });
});

test('airstage.Client#refreshToken calls _apiClient.postUsersMeRefreshToken with success', (context, done) => {
    const expectedResponse = {
        'accessToken': 'testAccessToken',
        'expiresIn': 3600,
        'refreshToken': 'testRefreshToken'
    };
    context.mock.method(
        clientWithAccessToken._apiClient,
        'postUsersMeRefreshToken',
        (refreshToken, callback) => {
            callback({'error': null, 'response': expectedResponse});
        }
    );
    context.after(() => {
        const mockedMethod = clientWithAccessToken._apiClient.postUsersMeRefreshToken.mock;

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments[0], 'existingRefreshToken');
    });

    clientWithAccessToken.refreshToken((error, result) => {
        assert.strictEqual(error, null);
        assert.strictEqual(result, expectedResponse);

        done();
    });
});

test('airstage.Client#refreshToken calls _apiClient.postUsersMeRefreshToken with error', (context, done) => {
    const expectedError = 'Error';
    context.mock.method(
        clientWithAccessToken._apiClient,
        'postUsersMeRefreshToken',
        (refreshToken, callback) => {
            callback({'error': expectedError, 'response': null});
        }
    );
    context.after(() => {
        const mockedMethod = clientWithAccessToken._apiClient.postUsersMeRefreshToken.mock;

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments[0], 'existingRefreshToken');
    });

    clientWithAccessToken.refreshToken((error, result) => {
        assert.strictEqual(error, expectedError);
        assert.strictEqual(result, null);

        done();
    });
});

test('airstage.Client#getTemperatureScale calls _apiClient.getUsersMe with success', (context, done) => {
    const expectedResponse = {
        'tempUnit': 'F'
    };
    context.mock.method(
        clientWithAccessToken._apiClient,
        'getUsersMe',
        (callback) => {
            callback({'error': null, 'response': expectedResponse});
        }
    );
    context.after(() => {
        const mockedMethod = clientWithAccessToken._apiClient.getUsersMe.mock;

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments.length, 1);
    });
    clientWithAccessToken.resetUserCache();

    clientWithAccessToken.getTemperatureScale((error, result) => {
        assert.strictEqual(error, null);
        assert.strictEqual(result, expectedResponse.tempUnit);

        done();
    });
});

test('airstage.Client#getTemperatureScale calls _apiClient.getUsersMe with error', (context, done) => {
    const expectedError = 'Error';
    context.mock.method(
        clientWithAccessToken._apiClient,
        'getUsersMe',
        (callback) => {
            callback({'error': expectedError, 'response': null});
        }
    );
    context.after(() => {
        const mockedMethod = clientWithAccessToken._apiClient.getUsersMe.mock;

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments.length, 1);
    });
    clientWithAccessToken.resetUserCache();

    clientWithAccessToken.getTemperatureScale((error, result) => {
        assert.strictEqual(error, expectedError);
        assert.strictEqual(result, null);

        done();
    });
});

test('airstage.Client#setTemperatureScale calls _apiClient.putUsersMe with success', (context, done) => {
    const expectedResponse = {
        'tempUnit': 'F'
    };
    context.mock.method(
        clientWithAccessToken._apiClient,
        'putUsersMe',
        (parameterName, parameterValue, callback) => {
            callback({'error': null, 'response': expectedResponse});
        }
    );
    context.after(() => {
        const mockedMethod = clientWithAccessToken._apiClient.putUsersMe.mock;

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments.length, 3);
        assert.strictEqual(mockedMethod.calls[0].arguments[0], 'tempUnit');
        assert.strictEqual(mockedMethod.calls[0].arguments[1], 'F');
    });
    clientWithAccessToken.resetUserCache();

    clientWithAccessToken.setTemperatureScale('F', (error, result) => {
        assert.strictEqual(error, null);
        assert.strictEqual(result, expectedResponse.tempUnit);

        done();
    });
});

test('airstage.Client#setTemperatureScale calls _apiClient.putUsersMe with error', (context, done) => {
    const expectedError = 'Error';
    context.mock.method(
        clientWithAccessToken._apiClient,
        'putUsersMe',
        (parameterName, parameterValue, callback) => {
            assert.strictEqual(parameterName, 'tempUnit');
            assert.strictEqual(parameterValue, 'F');

            callback({'error': expectedError, 'response': null});
        }
    );
    context.after(() => {
        const mockedMethod = clientWithAccessToken._apiClient.putUsersMe.mock;

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments.length, 3);
        assert.strictEqual(mockedMethod.calls[0].arguments[0], 'tempUnit');
        assert.strictEqual(mockedMethod.calls[0].arguments[1], 'F');
    });
    clientWithAccessToken.resetUserCache();

    clientWithAccessToken.setTemperatureScale('F', (error, result) => {
        assert.strictEqual(error, expectedError);
        assert.strictEqual(result, null);

        done();
    });
});

test('airstage.Client#getName calls _apiClient.getDevice with success', (context, done) => {
    const expectedResponse = {
        'deviceName': 'My Device'
    };
    context.mock.method(
        clientWithAccessToken._apiClient,
        'getDevice',
        (deviceId, callback) => {
            callback({'error': null, 'response': expectedResponse});
        }
    );
    context.after(() => {
        const mockedMethod = clientWithAccessToken._apiClient.getDevice.mock;

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments.length, 2);
        assert.strictEqual(mockedMethod.calls[0].arguments[0], '12345');
    });
    clientWithAccessToken.resetDeviceCache('12345');

    clientWithAccessToken.getName('12345', (error, result) => {
        assert.strictEqual(error, null);
        assert.strictEqual(result, expectedResponse.deviceName);

        done();
    });
});

test('airstage.Client#getName calls _apiClient.getDevice with error', (context, done) => {
    const expectedError = 'Error';
    context.mock.method(
        clientWithAccessToken._apiClient,
        'getDevice',
        (deviceId, callback) => {
            callback({'error': expectedError, 'response': null});
        }
    );
    context.after(() => {
        const mockedMethod = clientWithAccessToken._apiClient.getDevice.mock;

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments.length, 2);
        assert.strictEqual(mockedMethod.calls[0].arguments[0], '12345');
    });
    clientWithAccessToken.resetDeviceCache('12345');

    clientWithAccessToken.getName('12345', (error, result) => {
        assert.strictEqual(error, expectedError);
        assert.strictEqual(result, null);

        done();
    });
});

test('airstage.Client#getConnectionStatus calls _apiClient.getDevice with success', (context, done) => {
    const expectedResponse = {
        'connectionStatus': 'Online'
    };
    context.mock.method(
        clientWithAccessToken._apiClient,
        'getDevice',
        (deviceId, callback) => {
            callback({'error': null, 'response': expectedResponse});
        }
    );
    context.after(() => {
        const mockedMethod = clientWithAccessToken._apiClient.getDevice.mock;

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments.length, 2);
        assert.strictEqual(mockedMethod.calls[0].arguments[0], '12345');
    });
    clientWithAccessToken.resetDeviceCache('12345');

    clientWithAccessToken.getConnectionStatus('12345', (error, result) => {
        assert.strictEqual(error, null);
        assert.strictEqual(result, expectedResponse.connectionStatus);

        done();
    });
});

test('airstage.Client#getConnectionStatus calls _apiClient.getDevice with error', (context, done) => {
    const expectedError = 'Error';
    context.mock.method(
        clientWithAccessToken._apiClient,
        'getDevice',
        (deviceId, callback) => {
            callback({'error': expectedError, 'response': null});
        }
    );
    context.after(() => {
        const mockedMethod = clientWithAccessToken._apiClient.getDevice.mock;

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments.length, 2);
        assert.strictEqual(mockedMethod.calls[0].arguments[0], '12345');
    });
    clientWithAccessToken.resetDeviceCache('12345');

    clientWithAccessToken.getConnectionStatus('12345', (error, result) => {
        assert.strictEqual(error, expectedError);
        assert.strictEqual(result, null);

        done();
    });
});

test('airstage.Client#getModel calls _apiClient.getDevice with success', (context, done) => {
    const expectedResponse = {
        'parameters': [
            {
                'name': 'iu_model',
                'value': 'AZ123'
            }
        ]
    };
    context.mock.method(
        clientWithAccessToken._apiClient,
        'getDevice',
        (deviceId, callback) => {
            callback({'error': null, 'response': expectedResponse});
        }
    );
    context.after(() => {
        const mockedMethod = clientWithAccessToken._apiClient.getDevice.mock;

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments.length, 2);
        assert.strictEqual(mockedMethod.calls[0].arguments[0], '12345');
    });
    clientWithAccessToken.resetDeviceCache('12345');

    clientWithAccessToken.getModel('12345', (error, result) => {
        assert.strictEqual(error, null);
        assert.strictEqual(result, expectedResponse.parameters[0].value);

        done();
    });
});

test('airstage.Client#getModel calls _apiClient.getDevice with error', (context, done) => {
    const expectedError = 'Error';
    context.mock.method(
        clientWithAccessToken._apiClient,
        'getDevice',
        (deviceId, callback) => {
            callback({'error': expectedError, 'response': null});
        }
    );
    context.after(() => {
        const mockedMethod = clientWithAccessToken._apiClient.getDevice.mock;

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments.length, 2);
        assert.strictEqual(mockedMethod.calls[0].arguments[0], '12345');
    });
    clientWithAccessToken.resetDeviceCache('12345');

    clientWithAccessToken.getModel('12345', (error, result) => {
        assert.strictEqual(error, expectedError);
        assert.strictEqual(result, null);

        done();
    });
});

test('airstage.Client#getPowerState calls _apiClient.getDevice with success', (context, done) => {
    const expectedResponse = {
        'parameters': [
            {
                'name': 'iu_onoff',
                'value': '1'
            }
        ]
    };
    context.mock.method(
        clientWithAccessToken._apiClient,
        'getDevice',
        (deviceId, callback) => {
            callback({'error': null, 'response': expectedResponse});
        }
    );
    context.after(() => {
        const mockedMethod = clientWithAccessToken._apiClient.getDevice.mock;

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments.length, 2);
        assert.strictEqual(mockedMethod.calls[0].arguments[0], '12345');
    });
    clientWithAccessToken.resetDeviceCache('12345');

    clientWithAccessToken.getPowerState('12345', (error, result) => {
        assert.strictEqual(error, null);
        assert.strictEqual(result, 'ON');

        done();
    });
});

test('airstage.Client#getPowerState calls _apiClient.getDevice with error', (context, done) => {
    const expectedError = 'Error';
    context.mock.method(
        clientWithAccessToken._apiClient,
        'getDevice',
        (deviceId, callback) => {
            callback({'error': expectedError, 'response': null});
        }
    );
    context.after(() => {
        const mockedMethod = clientWithAccessToken._apiClient.getDevice.mock;

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments.length, 2);
        assert.strictEqual(mockedMethod.calls[0].arguments[0], '12345');
    });
    clientWithAccessToken.resetDeviceCache('12345');

    clientWithAccessToken.getPowerState('12345', (error, result) => {
        assert.strictEqual(error, expectedError);
        assert.strictEqual(result, null);

        done();
    });
});

test('airstage.Client#setPowerState calls _apiClient.postDevicesSetParametersRequest with success', (context, done) => {
    const expectedResponse = {'reqId': '54321'};
    const expectedGetDevicesRequestResponse = {
        'status': 'complete',
        'result': 'success',
        'parameters': [
            {
                'name': 'iu_onoff',
                'value': '1'
            }
        ]
    };
    context.mock.method(
        clientWithAccessToken._apiClient,
        'postDevicesSetParametersRequest',
        (deviceId, deviceSubId, parameterName, parameterValue, callback) => {
            callback({'error': null, 'response': expectedResponse});
        }
    );
    context.mock.method(
        clientWithAccessToken._apiClient,
        'getDevicesRequest',
        (deviceId, requestId, callback) => {
            callback({'error': null, 'response': expectedGetDevicesRequestResponse});
        }
    );
    context.after(() => {
        const mockedMethod = clientWithAccessToken._apiClient.postDevicesSetParametersRequest.mock;

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments.length, 5);
        assert.strictEqual(mockedMethod.calls[0].arguments[0], '12345');
        assert.strictEqual(mockedMethod.calls[0].arguments[1], '0');
        assert.strictEqual(mockedMethod.calls[0].arguments[2], 'iu_onoff');
        assert.strictEqual(mockedMethod.calls[0].arguments[3], '1');
    });
    clientWithAccessToken.resetDeviceCache('12345');

    clientWithAccessToken.setPowerState('12345', 'ON', (error, result) => {
        assert.strictEqual(error, null);
        assert.strictEqual(result, 'ON');

        done();
    });
});

test('airstage.Client#setPowerState calls _apiClient.postDevicesSetParametersRequest with error', (context, done) => {
    const expectedError = 'Error';
    context.mock.method(
        clientWithAccessToken._apiClient,
        'postDevicesSetParametersRequest',
        (deviceId, deviceSubId, parameterName, parameterValue, callback) => {
            callback({'error': expectedError, 'response': null});
        }
    );
    context.after(() => {
        const mockedMethod = clientWithAccessToken._apiClient.postDevicesSetParametersRequest.mock;

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments.length, 5);
        assert.strictEqual(mockedMethod.calls[0].arguments[0], '12345');
        assert.strictEqual(mockedMethod.calls[0].arguments[1], '0');
        assert.strictEqual(mockedMethod.calls[0].arguments[2], 'iu_onoff');
        assert.strictEqual(mockedMethod.calls[0].arguments[3], '1');
    });
    clientWithAccessToken.resetDeviceCache('12345');

    clientWithAccessToken.setPowerState('12345', 'ON', (error, result) => {
        assert.strictEqual(error, expectedError);
        assert.strictEqual(result, null);

        done();
    });
});

test('airstage.Client#getOperationMode calls _apiClient.getDevice with success', (context, done) => {
    const expectedResponse = {
        'parameters': [
            {
                'name': 'iu_op_mode',
                'value': '1'
            }
        ]
    };
    context.mock.method(
        clientWithAccessToken._apiClient,
        'getDevice',
        (deviceId, callback) => {
            callback({'error': null, 'response': expectedResponse});
        }
    );
    context.after(() => {
        const mockedMethod = clientWithAccessToken._apiClient.getDevice.mock;

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments.length, 2);
        assert.strictEqual(mockedMethod.calls[0].arguments[0], '12345');
    });
    clientWithAccessToken.resetDeviceCache('12345');

    clientWithAccessToken.getOperationMode('12345', (error, result) => {
        assert.strictEqual(error, null);
        assert.strictEqual(result, 'COOL');

        done();
    });
});

test('airstage.Client#getOperationMode calls _apiClient.getDevice with error', (context, done) => {
    const expectedError = 'Error';
    context.mock.method(
        clientWithAccessToken._apiClient,
        'getDevice',
        (deviceId, callback) => {
            callback({'error': expectedError, 'response': null});
        }
    );
    context.after(() => {
        const mockedMethod = clientWithAccessToken._apiClient.getDevice.mock;

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments.length, 2);
        assert.strictEqual(mockedMethod.calls[0].arguments[0], '12345');
    });
    clientWithAccessToken.resetDeviceCache('12345');

    clientWithAccessToken.getOperationMode('12345', (error, result) => {
        assert.strictEqual(error, expectedError);
        assert.strictEqual(result, null);

        done();
    });
});

test('airstage.Client#setOperationMode calls _apiClient.postDevicesSetParametersRequest with success', (context, done) => {
    const expectedResponse = {'reqId': '54321'};
    const expectedGetDevicesRequestResponse = {
        'status': 'complete',
        'result': 'success',
        'parameters': [
            {
                'name': 'iu_op_mode',
                'value': '1'
            }
        ]
    };
    context.mock.method(
        clientWithAccessToken._apiClient,
        'postDevicesSetParametersRequest',
        (deviceId, deviceSubId, parameterName, parameterValue, callback) => {
            callback({'error': null, 'response': expectedResponse});
        }
    );
    context.mock.method(
        clientWithAccessToken._apiClient,
        'getDevicesRequest',
        (deviceId, requestId, callback) => {
            callback({'error': null, 'response': expectedGetDevicesRequestResponse});
        }
    );
    context.after(() => {
        const mockedMethod = clientWithAccessToken._apiClient.postDevicesSetParametersRequest.mock;

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments.length, 5);
        assert.strictEqual(mockedMethod.calls[0].arguments[0], '12345');
        assert.strictEqual(mockedMethod.calls[0].arguments[1], '0');
        assert.strictEqual(mockedMethod.calls[0].arguments[2], 'iu_op_mode');
        assert.strictEqual(mockedMethod.calls[0].arguments[3], '1');
    });
    clientWithAccessToken.resetDeviceCache('12345');

    clientWithAccessToken.setOperationMode('12345', 'COOL', (error, result) => {
        assert.strictEqual(error, null);
        assert.strictEqual(result, 'COOL');

        done();
    });
});

test('airstage.Client#setOperationMode calls _apiClient.postDevicesSetParametersRequest with error', (context, done) => {
    const expectedError = 'Error';
    context.mock.method(
        clientWithAccessToken._apiClient,
        'postDevicesSetParametersRequest',
        (deviceId, deviceSubId, parameterName, parameterValue, callback) => {
            callback({'error': expectedError, 'response': null});
        }
    );
    context.after(() => {
        const mockedMethod = clientWithAccessToken._apiClient.postDevicesSetParametersRequest.mock;

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments.length, 5);
        assert.strictEqual(mockedMethod.calls[0].arguments[0], '12345');
        assert.strictEqual(mockedMethod.calls[0].arguments[1], '0');
        assert.strictEqual(mockedMethod.calls[0].arguments[2], 'iu_op_mode');
        assert.strictEqual(mockedMethod.calls[0].arguments[3], '1');
    });
    clientWithAccessToken.resetDeviceCache('12345');

    clientWithAccessToken.setOperationMode('12345', 'COOL', (error, result) => {
        assert.strictEqual(error, expectedError);
        assert.strictEqual(result, null);

        done();
    });
});

test('airstage.Client#getIndoorTemperature calls _apiClient.getDevice with success', (context, done) => {
    const expectedResponse = {
        'parameters': [
            {
                'name': 'iu_indoor_tmp',
                'value': '7200'
            }
        ]
    };
    context.mock.method(
        clientWithAccessToken._apiClient,
        'getDevice',
        (deviceId, callback) => {
            callback({'error': null, 'response': expectedResponse});
        }
    );
    context.after(() => {
        const mockedMethod = clientWithAccessToken._apiClient.getDevice.mock;

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments.length, 2);
        assert.strictEqual(mockedMethod.calls[0].arguments[0], '12345');
    });
    clientWithAccessToken.resetDeviceCache('12345');

    clientWithAccessToken.getIndoorTemperature('12345', 'F', (error, result) => {
        assert.strictEqual(error, null);
        assert.strictEqual(result, 72);

        done();
    });
});

test('airstage.Client#getIndoorTemperature calls _apiClient.getDevice with error', (context, done) => {
    const expectedError = 'Error';
    context.mock.method(
        clientWithAccessToken._apiClient,
        'getDevice',
        (deviceId, callback) => {
            callback({'error': expectedError, 'response': null});
        }
    );
    context.after(() => {
        const mockedMethod = clientWithAccessToken._apiClient.getDevice.mock;

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments.length, 2);
        assert.strictEqual(mockedMethod.calls[0].arguments[0], '12345');
    });
    clientWithAccessToken.resetDeviceCache('12345');

    clientWithAccessToken.getIndoorTemperature('12345', 'F', (error, result) => {
        assert.strictEqual(error, expectedError);
        assert.strictEqual(result, null);

        done();
    });
});

test('airstage.Client#getTargetTemperature calls _apiClient.getDevice with success', (context, done) => {
    const expectedResponse = {
        'parameters': [
            {
                'name': 'iu_set_tmp',
                'value': '220'
            }
        ]
    };
    context.mock.method(
        clientWithAccessToken._apiClient,
        'getDevice',
        (deviceId, callback) => {
            callback({'error': null, 'response': expectedResponse});
        }
    );
    context.after(() => {
        const mockedMethod = clientWithAccessToken._apiClient.getDevice.mock;

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments.length, 2);
        assert.strictEqual(mockedMethod.calls[0].arguments[0], '12345');
    });
    clientWithAccessToken.resetDeviceCache('12345');

    clientWithAccessToken.getTargetTemperature('12345', 'F', (error, result) => {
        assert.strictEqual(error, null);
        assert.strictEqual(result, 72);

        done();
    });
});

test('airstage.Client#getTargetTemperature calls _apiClient.getDevice with error', (context, done) => {
    const expectedError = 'Error';
    context.mock.method(
        clientWithAccessToken._apiClient,
        'getDevice',
        (deviceId, callback) => {
            callback({'error': expectedError, 'response': null});
        }
    );
    context.after(() => {
        const mockedMethod = clientWithAccessToken._apiClient.getDevice.mock;

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments.length, 2);
        assert.strictEqual(mockedMethod.calls[0].arguments[0], '12345');
    });
    clientWithAccessToken.resetDeviceCache('12345');

    clientWithAccessToken.getTargetTemperature('12345', 'F', (error, result) => {
        assert.strictEqual(error, expectedError);
        assert.strictEqual(result, null);

        done();
    });
});

test('airstage.Client#setTargetTemperature calls _apiClient.postDevicesSetParametersRequest with success', (context, done) => {
    const expectedResponse = {'reqId': '54321'};
    const expectedGetDevicesRequestResponse = {
        'status': 'complete',
        'result': 'success',
        'parameters': [
            {
                'name': 'iu_set_tmp',
                'value': '220'
            }
        ]
    };
    context.mock.method(
        clientWithAccessToken._apiClient,
        'postDevicesSetParametersRequest',
        (deviceId, deviceSubId, parameterName, parameterValue, callback) => {
            callback({'error': null, 'response': expectedResponse});
        }
    );
    context.mock.method(
        clientWithAccessToken._apiClient,
        'getDevicesRequest',
        (deviceId, requestId, callback) => {
            callback({'error': null, 'response': expectedGetDevicesRequestResponse});
        }
    );
    context.after(() => {
        const mockedMethod = clientWithAccessToken._apiClient.postDevicesSetParametersRequest.mock;

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments.length, 5);
        assert.strictEqual(mockedMethod.calls[0].arguments[0], '12345');
        assert.strictEqual(mockedMethod.calls[0].arguments[1], '0');
        assert.strictEqual(mockedMethod.calls[0].arguments[2], 'iu_set_tmp');
        assert.strictEqual(mockedMethod.calls[0].arguments[3], '220');
    });
    clientWithAccessToken.resetDeviceCache('12345');

    clientWithAccessToken.setTargetTemperature('12345', 72, 'F', (error, result) => {
        assert.strictEqual(error, null);
        assert.strictEqual(result, 72);

        done();
    });
});

test('airstage.Client#setTargetTemperature calls _apiClient.postDevicesSetParametersRequest with error', (context, done) => {
    const expectedError = 'Error';
    context.mock.method(
        clientWithAccessToken._apiClient,
        'postDevicesSetParametersRequest',
        (deviceId, deviceSubId, parameterName, parameterValue, callback) => {
            callback({'error': expectedError, 'response': null});
        }
    );
    context.after(() => {
        const mockedMethod = clientWithAccessToken._apiClient.postDevicesSetParametersRequest.mock;

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments.length, 5);
        assert.strictEqual(mockedMethod.calls[0].arguments[0], '12345');
        assert.strictEqual(mockedMethod.calls[0].arguments[1], '0');
        assert.strictEqual(mockedMethod.calls[0].arguments[2], 'iu_set_tmp');
        assert.strictEqual(mockedMethod.calls[0].arguments[3], '220');
    });
    clientWithAccessToken.resetDeviceCache('12345');

    clientWithAccessToken.setTargetTemperature('12345', 72, 'F', (error, result) => {
        assert.strictEqual(error, expectedError);
        assert.strictEqual(result, null);

        done();
    });
});

test('airstage.Client#getTemperatureDelta calls _apiClient.getDevice with success', (context, done) => {
    const expectedResponse = {
        'parameters': [
            {
                'name': 'iu_indoor_tmp',
                'value': '7400'
            },
            {
                'name': 'iu_set_tmp',
                'value': '220'
            }
        ]
    };
    context.mock.method(
        clientWithAccessToken._apiClient,
        'getDevice',
        (deviceId, callback) => {
            callback({'error': null, 'response': expectedResponse});
        }
    );
    context.after(() => {
        const mockedMethod = clientWithAccessToken._apiClient.getDevice.mock;

        assert.strictEqual(mockedMethod.calls.length, 2);
        assert.strictEqual(mockedMethod.calls[0].arguments.length, 2);
        assert.strictEqual(mockedMethod.calls[0].arguments[0], '12345');
    });
    clientWithAccessToken.resetDeviceCache('12345');

    clientWithAccessToken.getTemperatureDelta('12345', 'F', (error, result) => {
        assert.strictEqual(error, null);
        assert.strictEqual(result, 4);

        done();
    });
});

test('airstage.Client#getTemperatureDelta calls _apiClient.getDevice with error', (context, done) => {
    const expectedError = 'Error';
    context.mock.method(
        clientWithAccessToken._apiClient,
        'getDevice',
        (deviceId, callback) => {
            callback({'error': expectedError, 'response': null});
        }
    );
    context.after(() => {
        const mockedMethod = clientWithAccessToken._apiClient.getDevice.mock;

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments.length, 2);
        assert.strictEqual(mockedMethod.calls[0].arguments[0], '12345');
    });
    clientWithAccessToken.resetDeviceCache('12345');

    clientWithAccessToken.getTemperatureDelta('12345', 'F', (error, result) => {
        assert.strictEqual(error, expectedError);
        assert.strictEqual(result, null);

        done();
    });
});

test('airstage.Client#getFanSpeed calls _apiClient.getDevice with success', (context, done) => {
    const expectedResponse = {
        'parameters': [
            {
                'name': 'iu_fan_spd',
                'value': '11'
            }
        ]
    };
    context.mock.method(
        clientWithAccessToken._apiClient,
        'getDevice',
        (deviceId, callback) => {
            callback({'error': null, 'response': expectedResponse});
        }
    );
    context.after(() => {
        const mockedMethod = clientWithAccessToken._apiClient.getDevice.mock;

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments.length, 2);
        assert.strictEqual(mockedMethod.calls[0].arguments[0], '12345');
    });
    clientWithAccessToken.resetDeviceCache('12345');

    clientWithAccessToken.getFanSpeed('12345', (error, result) => {
        assert.strictEqual(error, null);
        assert.strictEqual(result, 'HIGH');

        done();
    });
});

test('airstage.Client#getFanSpeed calls _apiClient.getDevice with error', (context, done) => {
    const expectedError = 'Error';
    context.mock.method(
        clientWithAccessToken._apiClient,
        'getDevice',
        (deviceId, callback) => {
            callback({'error': expectedError, 'response': null});
        }
    );
    context.after(() => {
        const mockedMethod = clientWithAccessToken._apiClient.getDevice.mock;

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments.length, 2);
        assert.strictEqual(mockedMethod.calls[0].arguments[0], '12345');
    });
    clientWithAccessToken.resetDeviceCache('12345');

    clientWithAccessToken.getFanSpeed('12345', (error, result) => {
        assert.strictEqual(error, expectedError);
        assert.strictEqual(result, null);

        done();
    });
});

test('airstage.Client#setFanSpeed calls _apiClient.postDevicesSetParametersRequest with success', (context, done) => {
    const expectedResponse = {'reqId': '54321'};
    const expectedGetDevicesRequestResponse = {
        'status': 'complete',
        'result': 'success',
        'parameters': [
            {
                'name': 'iu_fan_spd',
                'value': '11'
            }
        ]
    };
    context.mock.method(
        clientWithAccessToken._apiClient,
        'postDevicesSetParametersRequest',
        (deviceId, deviceSubId, parameterName, parameterValue, callback) => {
            callback({'error': null, 'response': expectedResponse});
        }
    );
    context.mock.method(
        clientWithAccessToken._apiClient,
        'getDevicesRequest',
        (deviceId, requestId, callback) => {
            callback({'error': null, 'response': expectedGetDevicesRequestResponse});
        }
    );
    context.after(() => {
        const mockedMethod = clientWithAccessToken._apiClient.postDevicesSetParametersRequest.mock;

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments.length, 5);
        assert.strictEqual(mockedMethod.calls[0].arguments[0], '12345');
        assert.strictEqual(mockedMethod.calls[0].arguments[1], '0');
        assert.strictEqual(mockedMethod.calls[0].arguments[2], 'iu_fan_spd');
        assert.strictEqual(mockedMethod.calls[0].arguments[3], '11');
    });
    clientWithAccessToken.resetDeviceCache('12345');

    clientWithAccessToken.setFanSpeed('12345', 'HIGH', (error, result) => {
        assert.strictEqual(error, null);
        assert.strictEqual(result, 'HIGH');

        done();
    });
});

test('airstage.Client#setFanSpeed calls _apiClient.postDevicesSetParametersRequest with error', (context, done) => {
    const expectedError = 'Error';
    context.mock.method(
        clientWithAccessToken._apiClient,
        'postDevicesSetParametersRequest',
        (deviceId, deviceSubId, parameterName, parameterValue, callback) => {
            callback({'error': expectedError, 'response': null});
        }
    );
    context.after(() => {
        const mockedMethod = clientWithAccessToken._apiClient.postDevicesSetParametersRequest.mock;

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments.length, 5);
        assert.strictEqual(mockedMethod.calls[0].arguments[0], '12345');
        assert.strictEqual(mockedMethod.calls[0].arguments[1], '0');
        assert.strictEqual(mockedMethod.calls[0].arguments[2], 'iu_fan_spd');
        assert.strictEqual(mockedMethod.calls[0].arguments[3], '11');
    });
    clientWithAccessToken.resetDeviceCache('12345');

    clientWithAccessToken.setFanSpeed('12345', 'HIGH', (error, result) => {
        assert.strictEqual(error, expectedError);
        assert.strictEqual(result, null);

        done();
    });
});

test('airstage.Client#getAirflowVerticalDirection calls _apiClient.getDevice with success', (context, done) => {
    const expectedResponse = {
        'parameters': [
            {
                'name': 'iu_af_dir_vrt',
                'value': '1'
            }
        ]
    };
    context.mock.method(
        clientWithAccessToken._apiClient,
        'getDevice',
        (deviceId, callback) => {
            callback({'error': null, 'response': expectedResponse});
        }
    );
    context.after(() => {
        const mockedMethod = clientWithAccessToken._apiClient.getDevice.mock;

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments.length, 2);
        assert.strictEqual(mockedMethod.calls[0].arguments[0], '12345');
    });
    clientWithAccessToken.resetDeviceCache('12345');

    clientWithAccessToken.getAirflowVerticalDirection('12345', (error, result) => {
        assert.strictEqual(error, null);
        assert.strictEqual(result, 1);

        done();
    });
});

test('airstage.Client#getAirflowVerticalDirection calls _apiClient.getDevice with error', (context, done) => {
    const expectedError = 'Error';
    context.mock.method(
        clientWithAccessToken._apiClient,
        'getDevice',
        (deviceId, callback) => {
            callback({'error': expectedError, 'response': null});
        }
    );
    context.after(() => {
        const mockedMethod = clientWithAccessToken._apiClient.getDevice.mock;

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments.length, 2);
        assert.strictEqual(mockedMethod.calls[0].arguments[0], '12345');
    });
    clientWithAccessToken.resetDeviceCache('12345');

    clientWithAccessToken.getAirflowVerticalDirection('12345', (error, result) => {
        assert.strictEqual(error, expectedError);
        assert.strictEqual(result, null);

        done();
    });
});

test('airstage.Client#setAirflowVerticalDirection calls _apiClient.postDevicesSetParametersRequest with success', (context, done) => {
    const expectedResponse = {'reqId': '54321'};
    const expectedGetDevicesRequestResponse = {
        'status': 'complete',
        'result': 'success',
        'parameters': [
            {
                'name': 'iu_af_dir_vrt',
                'value': '1'
            }
        ]
    };
    context.mock.method(
        clientWithAccessToken._apiClient,
        'postDevicesSetParametersRequest',
        (deviceId, deviceSubId, parameterName, parameterValue, callback) => {
            callback({'error': null, 'response': expectedResponse});
        }
    );
    context.mock.method(
        clientWithAccessToken._apiClient,
        'getDevicesRequest',
        (deviceId, requestId, callback) => {
            callback({'error': null, 'response': expectedGetDevicesRequestResponse});
        }
    );
    context.after(() => {
        const mockedMethod = clientWithAccessToken._apiClient.postDevicesSetParametersRequest.mock;

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments.length, 5);
        assert.strictEqual(mockedMethod.calls[0].arguments[0], '12345');
        assert.strictEqual(mockedMethod.calls[0].arguments[1], '0');
        assert.strictEqual(mockedMethod.calls[0].arguments[2], 'iu_af_dir_vrt');
        assert.strictEqual(mockedMethod.calls[0].arguments[3], '1');
    });
    clientWithAccessToken.resetDeviceCache('12345');

    clientWithAccessToken.setAirflowVerticalDirection('12345', 1, (error, result) => {
        assert.strictEqual(error, null);
        assert.strictEqual(result, 1);

        done();
    });
});

test('airstage.Client#setAirflowVerticalDirection calls _apiClient.postDevicesSetParametersRequest with error', (context, done) => {
    const expectedError = 'Error';
    context.mock.method(
        clientWithAccessToken._apiClient,
        'postDevicesSetParametersRequest',
        (deviceId, deviceSubId, parameterName, parameterValue, callback) => {
            callback({'error': expectedError, 'response': null});
        }
    );
    context.after(() => {
        const mockedMethod = clientWithAccessToken._apiClient.postDevicesSetParametersRequest.mock;

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments.length, 5);
        assert.strictEqual(mockedMethod.calls[0].arguments[0], '12345');
        assert.strictEqual(mockedMethod.calls[0].arguments[1], '0');
        assert.strictEqual(mockedMethod.calls[0].arguments[2], 'iu_af_dir_vrt');
        assert.strictEqual(mockedMethod.calls[0].arguments[3], '1');
    });
    clientWithAccessToken.resetDeviceCache('12345');

    clientWithAccessToken.setAirflowVerticalDirection('12345', 1, (error, result) => {
        assert.strictEqual(error, expectedError);
        assert.strictEqual(result, null);

        done();
    });
});

test('airstage.Client#getAirflowVerticalSwingState calls _apiClient.getDevice with success', (context, done) => {
    const expectedResponse = {
        'parameters': [
            {
                'name': 'iu_af_swg_vrt',
                'value': '1'
            }
        ]
    };
    context.mock.method(
        clientWithAccessToken._apiClient,
        'getDevice',
        (deviceId, callback) => {
            callback({'error': null, 'response': expectedResponse});
        }
    );
    context.after(() => {
        const mockedMethod = clientWithAccessToken._apiClient.getDevice.mock;

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments.length, 2);
        assert.strictEqual(mockedMethod.calls[0].arguments[0], '12345');
    });
    clientWithAccessToken.resetDeviceCache('12345');

    clientWithAccessToken.getAirflowVerticalSwingState('12345', (error, result) => {
        assert.strictEqual(error, null);
        assert.strictEqual(result, 'ON');

        done();
    });
});

test('airstage.Client#getAirflowVerticalSwingState calls _apiClient.getDevice with error', (context, done) => {
    const expectedError = 'Error';
    context.mock.method(
        clientWithAccessToken._apiClient,
        'getDevice',
        (deviceId, callback) => {
            callback({'error': expectedError, 'response': null});
        }
    );
    context.after(() => {
        const mockedMethod = clientWithAccessToken._apiClient.getDevice.mock;

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments.length, 2);
        assert.strictEqual(mockedMethod.calls[0].arguments[0], '12345');
    });
    clientWithAccessToken.resetDeviceCache('12345');

    clientWithAccessToken.getAirflowVerticalSwingState('12345', (error, result) => {
        assert.strictEqual(error, expectedError);
        assert.strictEqual(result, null);

        done();
    });
});

test('airstage.Client#setAirflowVerticalSwingState calls _apiClient.postDevicesSetParametersRequest with success', (context, done) => {
    const expectedResponse = {'reqId': '54321'};
    const expectedGetDevicesRequestResponse = {
        'status': 'complete',
        'result': 'success',
        'parameters': [
            {
                'name': 'iu_af_swg_vrt',
                'value': '1'
            }
        ]
    };
    context.mock.method(
        clientWithAccessToken._apiClient,
        'postDevicesSetParametersRequest',
        (deviceId, deviceSubId, parameterName, parameterValue, callback) => {
            callback({'error': null, 'response': expectedResponse});
        }
    );
    context.mock.method(
        clientWithAccessToken._apiClient,
        'getDevicesRequest',
        (deviceId, requestId, callback) => {
            callback({'error': null, 'response': expectedGetDevicesRequestResponse});
        }
    );
    context.after(() => {
        const mockedMethod = clientWithAccessToken._apiClient.postDevicesSetParametersRequest.mock;

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments.length, 5);
        assert.strictEqual(mockedMethod.calls[0].arguments[0], '12345');
        assert.strictEqual(mockedMethod.calls[0].arguments[1], '0');
        assert.strictEqual(mockedMethod.calls[0].arguments[2], 'iu_af_swg_vrt');
        assert.strictEqual(mockedMethod.calls[0].arguments[3], '1');
    });
    clientWithAccessToken.resetDeviceCache('12345');

    clientWithAccessToken.setAirflowVerticalSwingState('12345', 'ON', (error, result) => {
        assert.strictEqual(error, null);
        assert.strictEqual(result, 'ON');

        done();
    });
});

test('airstage.Client#setAirflowVerticalSwingState calls _apiClient.postDevicesSetParametersRequest with error', (context, done) => {
    const expectedError = 'Error';
    context.mock.method(
        clientWithAccessToken._apiClient,
        'postDevicesSetParametersRequest',
        (deviceId, deviceSubId, parameterName, parameterValue, callback) => {
            callback({'error': expectedError, 'response': null});
        }
    );
    context.after(() => {
        const mockedMethod = clientWithAccessToken._apiClient.postDevicesSetParametersRequest.mock;

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments.length, 5);
        assert.strictEqual(mockedMethod.calls[0].arguments[0], '12345');
        assert.strictEqual(mockedMethod.calls[0].arguments[1], '0');
        assert.strictEqual(mockedMethod.calls[0].arguments[2], 'iu_af_swg_vrt');
        assert.strictEqual(mockedMethod.calls[0].arguments[3], '1');
    });
    clientWithAccessToken.resetDeviceCache('12345');

    clientWithAccessToken.setAirflowVerticalSwingState('12345', 'ON', (error, result) => {
        assert.strictEqual(error, expectedError);
        assert.strictEqual(result, null);

        done();
    });
});

test('airstage.Client#getPowerfulState calls _apiClient.getDevice with success', (context, done) => {
    const expectedResponse = {
        'parameters': [
            {
                'name': 'iu_powerful',
                'value': '1'
            }
        ]
    };
    context.mock.method(
        clientWithAccessToken._apiClient,
        'getDevice',
        (deviceId, callback) => {
            callback({'error': null, 'response': expectedResponse});
        }
    );
    context.after(() => {
        const mockedMethod = clientWithAccessToken._apiClient.getDevice.mock;

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments.length, 2);
        assert.strictEqual(mockedMethod.calls[0].arguments[0], '12345');
    });
    clientWithAccessToken.resetDeviceCache('12345');

    clientWithAccessToken.getPowerfulState('12345', (error, result) => {
        assert.strictEqual(error, null);
        assert.strictEqual(result, 'ON');

        done();
    });
});

test('airstage.Client#getPowerfulState calls _apiClient.getDevice with error', (context, done) => {
    const expectedError = 'Error';
    context.mock.method(
        clientWithAccessToken._apiClient,
        'getDevice',
        (deviceId, callback) => {
            callback({'error': expectedError, 'response': null});
        }
    );
    context.after(() => {
        const mockedMethod = clientWithAccessToken._apiClient.getDevice.mock;

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments.length, 2);
        assert.strictEqual(mockedMethod.calls[0].arguments[0], '12345');
    });
    clientWithAccessToken.resetDeviceCache('12345');

    clientWithAccessToken.getPowerfulState('12345', (error, result) => {
        assert.strictEqual(error, expectedError);
        assert.strictEqual(result, null);

        done();
    });
});

test('airstage.Client#setPowerfulState calls _apiClient.postDevicesSetParametersRequest with success', (context, done) => {
    const expectedResponse = {'reqId': '54321'};
    const expectedGetDevicesRequestResponse = {
        'status': 'complete',
        'result': 'success',
        'parameters': [
            {
                'name': 'iu_powerful',
                'value': '1'
            }
        ]
    };
    context.mock.method(
        clientWithAccessToken._apiClient,
        'postDevicesSetParametersRequest',
        (deviceId, deviceSubId, parameterName, parameterValue, callback) => {
            callback({'error': null, 'response': expectedResponse});
        }
    );
    context.mock.method(
        clientWithAccessToken._apiClient,
        'getDevicesRequest',
        (deviceId, requestId, callback) => {
            callback({'error': null, 'response': expectedGetDevicesRequestResponse});
        }
    );
    context.after(() => {
        const mockedMethod = clientWithAccessToken._apiClient.postDevicesSetParametersRequest.mock;

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments.length, 5);
        assert.strictEqual(mockedMethod.calls[0].arguments[0], '12345');
        assert.strictEqual(mockedMethod.calls[0].arguments[1], '0');
        assert.strictEqual(mockedMethod.calls[0].arguments[2], 'iu_powerful');
        assert.strictEqual(mockedMethod.calls[0].arguments[3], '1');
    });
    clientWithAccessToken.resetDeviceCache('12345');

    clientWithAccessToken.setPowerfulState('12345', 'ON', (error, result) => {
        assert.strictEqual(error, null);
        assert.strictEqual(result, 'ON');

        done();
    });
});

test('airstage.Client#setPowerfulState calls _apiClient.postDevicesSetParametersRequest with error', (context, done) => {
    const expectedError = 'Error';
    context.mock.method(
        clientWithAccessToken._apiClient,
        'postDevicesSetParametersRequest',
        (deviceId, deviceSubId, parameterName, parameterValue, callback) => {
            callback({'error': expectedError, 'response': null});
        }
    );
    context.after(() => {
        const mockedMethod = clientWithAccessToken._apiClient.postDevicesSetParametersRequest.mock;

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments.length, 5);
        assert.strictEqual(mockedMethod.calls[0].arguments[0], '12345');
        assert.strictEqual(mockedMethod.calls[0].arguments[1], '0');
        assert.strictEqual(mockedMethod.calls[0].arguments[2], 'iu_powerful');
        assert.strictEqual(mockedMethod.calls[0].arguments[3], '1');
    });
    clientWithAccessToken.resetDeviceCache('12345');

    clientWithAccessToken.setPowerfulState('12345', 'ON', (error, result) => {
        assert.strictEqual(error, expectedError);
        assert.strictEqual(result, null);

        done();
    });
});

test('airstage.Client#getEconomyState calls _apiClient.getDevice with success', (context, done) => {
    const expectedResponse = {
        'parameters': [
            {
                'name': 'iu_economy',
                'value': '1'
            }
        ]
    };
    context.mock.method(
        clientWithAccessToken._apiClient,
        'getDevice',
        (deviceId, callback) => {
            callback({'error': null, 'response': expectedResponse});
        }
    );
    context.after(() => {
        const mockedMethod = clientWithAccessToken._apiClient.getDevice.mock;

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments.length, 2);
        assert.strictEqual(mockedMethod.calls[0].arguments[0], '12345');
    });
    clientWithAccessToken.resetDeviceCache('12345');

    clientWithAccessToken.getEconomyState('12345', (error, result) => {
        assert.strictEqual(error, null);
        assert.strictEqual(result, 'ON');

        done();
    });
});

test('airstage.Client#getEconomyState calls _apiClient.getDevice with error', (context, done) => {
    const expectedError = 'Error';
    context.mock.method(
        clientWithAccessToken._apiClient,
        'getDevice',
        (deviceId, callback) => {
            callback({'error': expectedError, 'response': null});
        }
    );
    context.after(() => {
        const mockedMethod = clientWithAccessToken._apiClient.getDevice.mock;

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments.length, 2);
        assert.strictEqual(mockedMethod.calls[0].arguments[0], '12345');
    });
    clientWithAccessToken.resetDeviceCache('12345');

    clientWithAccessToken.getEconomyState('12345', (error, result) => {
        assert.strictEqual(error, expectedError);
        assert.strictEqual(result, null);

        done();
    });
});

test('airstage.Client#setEconomyState calls _apiClient.postDevicesSetParametersRequest with success', (context, done) => {
    const expectedResponse = {'reqId': '54321'};
    const expectedGetDevicesRequestResponse = {
        'status': 'complete',
        'result': 'success',
        'parameters': [
            {
                'name': 'iu_economy',
                'value': '1'
            }
        ]
    };
    context.mock.method(
        clientWithAccessToken._apiClient,
        'postDevicesSetParametersRequest',
        (deviceId, deviceSubId, parameterName, parameterValue, callback) => {
            callback({'error': null, 'response': expectedResponse});
        }
    );
    context.mock.method(
        clientWithAccessToken._apiClient,
        'getDevicesRequest',
        (deviceId, requestId, callback) => {
            callback({'error': null, 'response': expectedGetDevicesRequestResponse});
        }
    );
    context.after(() => {
        const mockedMethod = clientWithAccessToken._apiClient.postDevicesSetParametersRequest.mock;

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments.length, 5);
        assert.strictEqual(mockedMethod.calls[0].arguments[0], '12345');
        assert.strictEqual(mockedMethod.calls[0].arguments[1], '0');
        assert.strictEqual(mockedMethod.calls[0].arguments[2], 'iu_economy');
        assert.strictEqual(mockedMethod.calls[0].arguments[3], '1');
    });
    clientWithAccessToken.resetDeviceCache('12345');

    clientWithAccessToken.setEconomyState('12345', 'ON', (error, result) => {
        assert.strictEqual(error, null);
        assert.strictEqual(result, 'ON');

        done();
    });
});

test('airstage.Client#setEconomyState calls _apiClient.postDevicesSetParametersRequest with error', (context, done) => {
    const expectedError = 'Error';
    context.mock.method(
        clientWithAccessToken._apiClient,
        'postDevicesSetParametersRequest',
        (deviceId, deviceSubId, parameterName, parameterValue, callback) => {
            callback({'error': expectedError, 'response': null});
        }
    );
    context.after(() => {
        const mockedMethod = clientWithAccessToken._apiClient.postDevicesSetParametersRequest.mock;

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments.length, 5);
        assert.strictEqual(mockedMethod.calls[0].arguments[0], '12345');
        assert.strictEqual(mockedMethod.calls[0].arguments[1], '0');
        assert.strictEqual(mockedMethod.calls[0].arguments[2], 'iu_economy');
        assert.strictEqual(mockedMethod.calls[0].arguments[3], '1');
    });
    clientWithAccessToken.resetDeviceCache('12345');

    clientWithAccessToken.setEconomyState('12345', 'ON', (error, result) => {
        assert.strictEqual(error, expectedError);
        assert.strictEqual(result, null);

        done();
    });
});

test('airstage.Client#getEnergySavingFanState calls _apiClient.getDevice with success', (context, done) => {
    const expectedResponse = {
        'parameters': [
            {
                'name': 'iu_fan_ctrl',
                'value': '1'
            }
        ]
    };
    context.mock.method(
        clientWithAccessToken._apiClient,
        'getDevice',
        (deviceId, callback) => {
            callback({'error': null, 'response': expectedResponse});
        }
    );
    context.after(() => {
        const mockedMethod = clientWithAccessToken._apiClient.getDevice.mock;

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments.length, 2);
        assert.strictEqual(mockedMethod.calls[0].arguments[0], '12345');
    });
    clientWithAccessToken.resetDeviceCache('12345');

    clientWithAccessToken.getEnergySavingFanState('12345', (error, result) => {
        assert.strictEqual(error, null);
        assert.strictEqual(result, 'ON');

        done();
    });
});

test('airstage.Client#getEnergySavingFanState calls _apiClient.getDevice with error', (context, done) => {
    const expectedError = 'Error';
    context.mock.method(
        clientWithAccessToken._apiClient,
        'getDevice',
        (deviceId, callback) => {
            callback({'error': expectedError, 'response': null});
        }
    );
    context.after(() => {
        const mockedMethod = clientWithAccessToken._apiClient.getDevice.mock;

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments.length, 2);
        assert.strictEqual(mockedMethod.calls[0].arguments[0], '12345');
    });
    clientWithAccessToken.resetDeviceCache('12345');

    clientWithAccessToken.getEnergySavingFanState('12345', (error, result) => {
        assert.strictEqual(error, expectedError);
        assert.strictEqual(result, null);

        done();
    });
});

test('airstage.Client#setEnergySavingFanState calls _apiClient.postDevicesSetParametersRequest with success', (context, done) => {
    const expectedResponse = {'reqId': '54321'};
    const expectedGetDevicesRequestResponse = {
        'status': 'complete',
        'result': 'success',
        'parameters': [
            {
                'name': 'iu_fan_ctrl',
                'value': '1'
            }
        ]
    };
    context.mock.method(
        clientWithAccessToken._apiClient,
        'postDevicesSetParametersRequest',
        (deviceId, deviceSubId, parameterName, parameterValue, callback) => {
            callback({'error': null, 'response': expectedResponse});
        }
    );
    context.mock.method(
        clientWithAccessToken._apiClient,
        'getDevicesRequest',
        (deviceId, requestId, callback) => {
            callback({'error': null, 'response': expectedGetDevicesRequestResponse});
        }
    );
    context.after(() => {
        const mockedMethod = clientWithAccessToken._apiClient.postDevicesSetParametersRequest.mock;

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments.length, 5);
        assert.strictEqual(mockedMethod.calls[0].arguments[0], '12345');
        assert.strictEqual(mockedMethod.calls[0].arguments[1], '0');
        assert.strictEqual(mockedMethod.calls[0].arguments[2], 'iu_fan_ctrl');
        assert.strictEqual(mockedMethod.calls[0].arguments[3], '1');
    });
    clientWithAccessToken.resetDeviceCache('12345');

    clientWithAccessToken.setEnergySavingFanState('12345', 'ON', (error, result) => {
        assert.strictEqual(error, null);
        assert.strictEqual(result, 'ON');

        done();
    });
});

test('airstage.Client#setEnergySavingFanState calls _apiClient.postDevicesSetParametersRequest with error', (context, done) => {
    const expectedError = 'Error';
    context.mock.method(
        clientWithAccessToken._apiClient,
        'postDevicesSetParametersRequest',
        (deviceId, deviceSubId, parameterName, parameterValue, callback) => {
            callback({'error': expectedError, 'response': null});
        }
    );
    context.after(() => {
        const mockedMethod = clientWithAccessToken._apiClient.postDevicesSetParametersRequest.mock;

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments.length, 5);
        assert.strictEqual(mockedMethod.calls[0].arguments[0], '12345');
        assert.strictEqual(mockedMethod.calls[0].arguments[1], '0');
        assert.strictEqual(mockedMethod.calls[0].arguments[2], 'iu_fan_ctrl');
        assert.strictEqual(mockedMethod.calls[0].arguments[3], '1');
    });
    clientWithAccessToken.resetDeviceCache('12345');

    clientWithAccessToken.setEnergySavingFanState('12345', 'ON', (error, result) => {
        assert.strictEqual(error, expectedError);
        assert.strictEqual(result, null);

        done();
    });
});

test('airstage.Client#getAccessToken returns access token', (context) => {
    const accessToken = clientWithAccessToken.getAccessToken();

    assert.strictEqual(accessToken, 'existingAccessToken');
});

test('airstage.Client#getAccessTokenExpiry returns access token expiry', (context) => {
    const accessTokenExpiry = clientWithAccessToken.getAccessTokenExpiry();

    assert.strictEqual(accessTokenExpiry.toISOString(), '2099-01-01T00:00:00.000Z');
});

test('airstage.Client#getRefreshToken returns access token', (context) => {
    const refreshToken = clientWithAccessToken.getRefreshToken();

    assert.strictEqual(refreshToken, 'existingRefreshToken');
});
