'use strict';

const assert = require('node:assert');
const { mock, test } = require('node:test');
const airstage = require('./../../../src/airstage');

const clientWithAccessToken = new airstage.cloud.Client(
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
const clientWithoutAccessToken = new airstage.cloud.Client(
    'us',
    'United States',
    'en',
    'example@example.com',
    'password'
);

test('airstage.cloud.Client#refreshTokenOrAuthenticate calls _apiClient.postUsersMeRefreshToken with success', (context, done) => {
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

test('airstage.cloud.Client#refreshTokenOrAuthenticate calls _apiClient.postUsersMeRefreshToken with error', (context, done) => {
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

test('airstage.cloud.Client#refreshTokenOrAuthenticate calls _apiClient.postUsersSignIn with success', (context, done) => {
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

test('airstage.cloud.Client#refreshTokenOrAuthenticate calls _apiClient.postUsersSignIn with error', (context, done) => {
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

test('airstage.cloud.Client#refreshTokenOrAuthenticate returns error', (context, done) => {
    const client = new airstage.cloud.Client(
        'us',
        'United States',
        'en'
    );
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

test('airstage.cloud.Client#authenticate calls _apiClient.postUsersSignIn with success', (context, done) => {
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

test('airstage.cloud.Client#authenticate calls _apiClient.postUsersSignIn with "Invalid email or password" error', (context, done) => {
    const expectedError = 'Invalid email or password';
    context.mock.method(
        clientWithAccessToken._apiClient,
        'postUsersSignIn',
        (email, password, callback) => {
            callback({
                'statusCode': 401,
                'error': null,
                'response': {
                    'messageCode': 'AIRSTAGE_POST_USERS_SIGNIN_EMAIL_PASSWORD_INVALID'
                }
            });
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

test('airstage.cloud.Client#authenticate calls _apiClient.postUsersSignIn with error', (context, done) => {
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

test('airstage.cloud.Client#refreshToken calls _apiClient.postUsersMeRefreshToken with success', (context, done) => {
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

test('airstage.cloud.Client#refreshToken calls _apiClient.postUsersMeRefreshToken with "Invalid access token" error', (context, done) => {
    const expectedError = 'Invalid access token';
    context.mock.method(
        clientWithAccessToken._apiClient,
        'postUsersMeRefreshToken',
        (refreshToken, callback) => {
            callback({
                'statusCode': 403,
                'error': null,
                'response': {
                    'messageCode': 'AIRSTAGE_COMMON_TOKEN_INVALID'
                }
            });
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

test('airstage.cloud.Client#refreshToken calls _apiClient.postUsersMeRefreshToken with error', (context, done) => {
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

test('airstage.cloud.Client#getTemperatureScale calls _apiClient.getUsersMe with success', (context, done) => {
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
    clientWithAccessToken.resetUserMetadataCache();

    clientWithAccessToken.getTemperatureScale((error, result) => {
        assert.strictEqual(error, null);
        assert.strictEqual(result, expectedResponse.tempUnit);

        done();
    });
});

test('airstage.cloud.Client#getTemperatureScale calls _apiClient.getUsersMe with error', (context, done) => {
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
    clientWithAccessToken.resetUserMetadataCache();

    clientWithAccessToken.getTemperatureScale((error, result) => {
        assert.strictEqual(error, expectedError);
        assert.strictEqual(result, null);

        done();
    });
});

test('airstage.cloud.Client#setTemperatureScale calls _apiClient.putUsersMe with success', (context, done) => {
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
    clientWithAccessToken.resetUserMetadataCache();

    clientWithAccessToken.setTemperatureScale('F', (error, result) => {
        assert.strictEqual(error, null);
        assert.strictEqual(result, expectedResponse.tempUnit);

        done();
    });
});

test('airstage.cloud.Client#setTemperatureScale calls _apiClient.putUsersMe with "Invalid access token" error', (context, done) => {
    const expectedError = 'Invalid access token';
    context.mock.method(
        clientWithAccessToken._apiClient,
        'putUsersMe',
        (parameterName, parameterValue, callback) => {
            callback({
                'statusCode': 403,
                'error': null,
                'response': {
                    'messageCode': 'AIRSTAGE_COMMON_TOKEN_INVALID'
                }
            });
        }
    );
    context.after(() => {
        const mockedMethod = clientWithAccessToken._apiClient.putUsersMe.mock;

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(mockedMethod.calls[0].arguments.length, 3);
        assert.strictEqual(mockedMethod.calls[0].arguments[0], 'tempUnit');
        assert.strictEqual(mockedMethod.calls[0].arguments[1], 'F');
    });
    clientWithAccessToken.resetUserMetadataCache();

    clientWithAccessToken.setTemperatureScale('F', (error, result) => {
        assert.strictEqual(error, expectedError);
        assert.strictEqual(result, null);

        done();
    });
});

test('airstage.cloud.Client#setTemperatureScale calls _apiClient.putUsersMe with error', (context, done) => {
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
    clientWithAccessToken.resetUserMetadataCache();

    clientWithAccessToken.setTemperatureScale('F', (error, result) => {
        assert.strictEqual(error, expectedError);
        assert.strictEqual(result, null);

        done();
    });
});

test('airstage.cloud.Client#getName calls _apiClient.getDevice with success', (context, done) => {
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

test('airstage.cloud.Client#getName calls _apiClient.getDevice with error', (context, done) => {
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

test('airstage.cloud.Client#getConnectionStatus calls _apiClient.getDevice with success', (context, done) => {
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

test('airstage.cloud.Client#getConnectionStatus calls _apiClient.getDevice with error', (context, done) => {
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

test('airstage.cloud.Client#getModel calls _apiClient.getDevice with success', (context, done) => {
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

test('airstage.cloud.Client#getModel calls _apiClient.getDevice with error', (context, done) => {
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

test('airstage.cloud.Client#getPowerState calls _apiClient.getDevice with success', (context, done) => {
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

test('airstage.cloud.Client#getPowerState calls _apiClient.getDevice with error', (context, done) => {
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

test('airstage.cloud.Client#setPowerState calls _apiClient.postDevicesSetParametersRequest with success', (context, done) => {
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

test('airstage.cloud.Client#setPowerState calls _apiClient.postDevicesSetParametersRequest with error', (context, done) => {
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

test('airstage.cloud.Client#getOperationMode calls _apiClient.getDevice with success', (context, done) => {
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

test('airstage.cloud.Client#getOperationMode calls _apiClient.getDevice with error', (context, done) => {
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

test('airstage.cloud.Client#setOperationMode calls _apiClient.postDevicesSetParametersRequest with success', (context, done) => {
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

test('airstage.cloud.Client#setOperationMode updates fan speed in device cache to AUTO when DRY with success', (context, done) => {
    const expectedResponse = {'reqId': '54321'};
    const expectedGetDevicesRequestResponse = {
        'status': 'complete',
        'result': 'success',
        'parameters': [
            {
                'name': 'iu_op_mode',
                'value': '2'
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
        assert.strictEqual(mockedMethod.calls[0].arguments[3], '2');
    });
    clientWithAccessToken.resetDeviceCache('12345');

    clientWithAccessToken.setOperationMode('12345', 'DRY', (error, result) => {
        assert.strictEqual(error, null);
        assert.strictEqual(result, 'DRY');

        clientWithAccessToken.getFanSpeed('12345', (error, result) => {
            assert.strictEqual(error, null);
            assert.strictEqual(result, 'AUTO');

            done();
        });
    });
});

test('airstage.cloud.Client#setOperationMode calls _apiClient.postDevicesSetParametersRequest with error', (context, done) => {
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

test('airstage.cloud.Client#getIndoorTemperature calls _apiClient.getDevice with success', (context, done) => {
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

test('airstage.cloud.Client#getIndoorTemperature calls _apiClient.getDevice with error', (context, done) => {
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

test('airstage.cloud.Client#getTargetTemperature calls _apiClient.getDevice with success', (context, done) => {
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

test('airstage.cloud.Client#getTargetTemperature calls _apiClient.getDevice with error', (context, done) => {
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

test('airstage.cloud.Client#setTargetTemperature calls _apiClient.postDevicesSetParametersRequest with success', (context, done) => {
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

test('airstage.cloud.Client#setTargetTemperature calls _apiClient.postDevicesSetParametersRequest with error', (context, done) => {
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

test('airstage.cloud.Client#getTemperatureDelta calls _apiClient.getDevice with success', (context, done) => {
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

test('airstage.cloud.Client#getTemperatureDelta calls _apiClient.getDevice with error', (context, done) => {
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

test('airstage.cloud.Client#getFanSpeed calls _apiClient.getDevice with success', (context, done) => {
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

test('airstage.cloud.Client#getFanSpeed calls _apiClient.getDevice with error', (context, done) => {
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

test('airstage.cloud.Client#setFanSpeed calls _apiClient.postDevicesSetParametersRequest with success', (context, done) => {
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

test('airstage.cloud.Client#setFanSpeed calls _apiClient.postDevicesSetParametersRequest with error', (context, done) => {
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

test('airstage.cloud.Client#getAirflowVerticalDirection calls _apiClient.getDevice with success', (context, done) => {
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

test('airstage.cloud.Client#getAirflowVerticalDirection calls _apiClient.getDevice with error', (context, done) => {
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

test('airstage.cloud.Client#setAirflowVerticalDirection with 0 calls _apiClient.postDevicesSetParametersRequest with success', (context, done) => {
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

    clientWithAccessToken.setAirflowVerticalDirection('12345', 0, (error, result) => {
        assert.strictEqual(error, null);
        assert.strictEqual(result, 1);

        done();
    });
});

test('airstage.cloud.Client#setAirflowVerticalDirection with 1 calls _apiClient.postDevicesSetParametersRequest with success', (context, done) => {
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

test('airstage.cloud.Client#setAirflowVerticalDirection with 5 calls _apiClient.postDevicesSetParametersRequest with success', (context, done) => {
    const expectedResponse = {'reqId': '54321'};
    const expectedGetDevicesRequestResponse = {
        'status': 'complete',
        'result': 'success',
        'parameters': [
            {
                'name': 'iu_af_dir_vrt',
                'value': '4'
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
        assert.strictEqual(mockedMethod.calls[0].arguments[3], '4');
    });
    clientWithAccessToken.resetDeviceCache('12345');

    clientWithAccessToken.setAirflowVerticalDirection('12345', 5, (error, result) => {
        assert.strictEqual(error, null);
        assert.strictEqual(result, 4);

        done();
    });
});

test('airstage.cloud.Client#setAirflowVerticalDirection calls _apiClient.postDevicesSetParametersRequest with error', (context, done) => {
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

test('airstage.cloud.Client#getAirflowVerticalSwingState calls _apiClient.getDevice with success', (context, done) => {
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

test('airstage.cloud.Client#getAirflowVerticalSwingState calls _apiClient.getDevice with error', (context, done) => {
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

test('airstage.cloud.Client#setAirflowVerticalSwingState calls _apiClient.postDevicesSetParametersRequest with success', (context, done) => {
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

test('airstage.cloud.Client#setAirflowVerticalSwingState calls _apiClient.postDevicesSetParametersRequest with error', (context, done) => {
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

test('airstage.cloud.Client#getPowerfulState calls _apiClient.getDevice with success', (context, done) => {
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

test('airstage.cloud.Client#getPowerfulState calls _apiClient.getDevice with error', (context, done) => {
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

test('airstage.cloud.Client#setPowerfulState calls _apiClient.postDevicesSetParametersRequest with success', (context, done) => {
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

test('airstage.cloud.Client#setPowerfulState calls _apiClient.postDevicesSetParametersRequest with error', (context, done) => {
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

test('airstage.cloud.Client#getEconomyState calls _apiClient.getDevice with success', (context, done) => {
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

test('airstage.cloud.Client#getEconomyState calls _apiClient.getDevice with error', (context, done) => {
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

test('airstage.cloud.Client#setEconomyState calls _apiClient.postDevicesSetParametersRequest with success', (context, done) => {
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

test('airstage.cloud.Client#setEconomyState calls _apiClient.postDevicesSetParametersRequest with error', (context, done) => {
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

test('airstage.cloud.Client#getEnergySavingFanState calls _apiClient.getDevice with success', (context, done) => {
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

test('airstage.cloud.Client#getEnergySavingFanState calls _apiClient.getDevice with error', (context, done) => {
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

test('airstage.cloud.Client#setEnergySavingFanState calls _apiClient.postDevicesSetParametersRequest with success', (context, done) => {
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

test('airstage.cloud.Client#setEnergySavingFanState calls _apiClient.postDevicesSetParametersRequest with error', (context, done) => {
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

test('airstage.cloud.Client#getMinimumHeatState calls _apiClient.getDevice with success', (context, done) => {
    const expectedResponse = {
        'parameters': [
            {
                'name': 'iu_min_heat',
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

    clientWithAccessToken.getMinimumHeatState('12345', (error, result) => {
        assert.strictEqual(error, null);
        assert.strictEqual(result, 'ON');

        done();
    });
});

test('airstage.cloud.Client#getMinimumHeatState calls _apiClient.getDevice with error', (context, done) => {
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

    clientWithAccessToken.getMinimumHeatState('12345', (error, result) => {
        assert.strictEqual(error, expectedError);
        assert.strictEqual(result, null);

        done();
    });
});

test('airstage.cloud.Client#setMinimumHeatState with "ON" calls _apiClient.postDevicesSetParametersRequest with success', (context, done) => {
    const expectedResponse = {'reqId': '54321'};
    const expectedGetDevicesRequestResponse = {
        'status': 'complete',
        'result': 'success',
        'parameters': [
            {
                'name': 'iu_min_heat',
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
        assert.strictEqual(mockedMethod.calls[0].arguments[2], 'iu_min_heat');
        assert.strictEqual(mockedMethod.calls[0].arguments[3], '1');
    });
    clientWithAccessToken.resetDeviceCache('12345');

    clientWithAccessToken.setMinimumHeatState('12345', 'ON', (error, result) => {
        assert.strictEqual(error, null);
        assert.strictEqual(result, 'ON');

        clientWithAccessToken.getPowerState('12345', (error, powerState) => {
            assert.strictEqual(error, null);
            assert.strictEqual(powerState, 'ON');

            clientWithAccessToken.getFanSpeed('12345', (error, fanSpeed) => {
                assert.strictEqual(error, null);
                assert.strictEqual(fanSpeed, 'AUTO');

                clientWithAccessToken.getOperationMode('12345', (error, operationMode) => {
                    assert.strictEqual(error, null);
                    assert.strictEqual(operationMode, 'HEAT');

                    clientWithAccessToken.getTargetTemperature('12345', 'F', (error, targetTemperature) => {
                        assert.strictEqual(error, null);
                        assert.strictEqual(targetTemperature, 50);

                        done();
                    });
                });
            });
        });
    });
});

test('airstage.cloud.Client#setMinimumHeatState with "OFF" calls _apiClient.postDevicesSetParametersRequest with success', (context, done) => {
    const expectedResponse = {'reqId': '54321'};
    const expectedGetDevicesRequestResponse = {
        'status': 'complete',
        'result': 'success',
        'parameters': [
            {
                'name': 'iu_min_heat',
                'value': '0'
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
        assert.strictEqual(mockedMethod.calls[0].arguments[2], 'iu_min_heat');
        assert.strictEqual(mockedMethod.calls[0].arguments[3], '0');
    });
    clientWithAccessToken.resetDeviceCache('12345');

    clientWithAccessToken.setMinimumHeatState('12345', 'OFF', (error, result) => {
        assert.strictEqual(error, null);
        assert.strictEqual(result, 'OFF');

        clientWithAccessToken.getPowerState('12345', (error, powerState) => {
            assert.strictEqual(error, null);
            assert.strictEqual(powerState, 'OFF');

            done();
        });
    });
});

test('airstage.cloud.Client#setMinimumHeatState calls _apiClient.postDevicesSetParametersRequest with error', (context, done) => {
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
        assert.strictEqual(mockedMethod.calls[0].arguments[2], 'iu_min_heat');
        assert.strictEqual(mockedMethod.calls[0].arguments[3], '1');
    });
    clientWithAccessToken.resetDeviceCache('12345');

    clientWithAccessToken.setMinimumHeatState('12345', 'ON', (error, result) => {
        assert.strictEqual(error, expectedError);
        assert.strictEqual(result, null);

        done();
    });
});

test('airstage.cloud.Client#getAccessToken returns access token', (context) => {
    const accessToken = clientWithAccessToken.getAccessToken();

    assert.strictEqual(accessToken, 'existingAccessToken');
});

test('airstage.cloud.Client#getAccessTokenExpiry returns access token expiry', (context) => {
    const accessTokenExpiry = clientWithAccessToken.getAccessTokenExpiry();

    assert.strictEqual(accessTokenExpiry.toISOString(), '2099-01-01T00:00:00.000Z');
});

test('airstage.cloud.Client#getRefreshToken returns access token', (context) => {
    const refreshToken = clientWithAccessToken.getRefreshToken();

    assert.strictEqual(refreshToken, 'existingRefreshToken');
});

test('airstage.cloud.Client#getParameter calls _apiClient.getDevice with "Parameter not available" error', (context, done) => {
    const expectedResponse = {
        'parameters': [
            {
                'name': 'iu_indoor_tmp',
                'value': '65535'
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

    clientWithAccessToken.getParameter('12345', 'iu_indoor_tmp', (error, result) => {
        assert.strictEqual(error, 'Parameter not available: iu_indoor_tmp');
        assert.strictEqual(result, null);

        done();
    });
});

test('airstage.cloud.Client#getParameter with "Could not determine hostname" error', (context, done) => {
    const clientWithInvalidRegion = new airstage.cloud.Client(
        'cn',
        'China',
        'en',
        null,
        null,
        null,
        null,
        'existingAccessToken',
        '2099-01-01',
        'existingRefreshToken'
    );

    clientWithInvalidRegion.getParameter('12345', 'iu_indoor_tmp', (error, result) => {
        assert.strictEqual(error, 'Could not determine hostname for region: cn');
        assert.strictEqual(result, null);

        done();
    });
});

test('airstage.cloud.Client#getParameter with "Access token not set" error', (context, done) => {
    clientWithoutAccessToken.getParameter('12345', 'iu_indoor_tmp', (error, result) => {
        assert.strictEqual(error, 'Access token not set');
        assert.strictEqual(result, null);

        done();
    });
});

test('airstage.cloud.Client#setParameter calls _apiClient.postDevicesSetParametersRequest with "Invalid access token" error', (context, done) => {
    const expectedError = 'Invalid access token';
    context.mock.method(
        clientWithAccessToken._apiClient,
        'postDevicesSetParametersRequest',
        (deviceId, deviceSubId, name, value, callback) => {
            callback({
                'statusCode': 403,
                'error': null,
                'response': {
                    'messageCode': 'AIRSTAGE_COMMON_TOKEN_INVALID'
                }
            });
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

    clientWithAccessToken.setParameter('12345', 'iu_onoff', '1', (error, result) => {
        assert.strictEqual(error, expectedError);
        assert.strictEqual(result, null);

        done();
    });
});
