'use strict';

const assert = require('node:assert');
const { mock, test } = require('node:test');
const airstage = require('./../../../src/airstage');

const clientWithAccessToken = new airstage.apiv1.Client(
    'us',
    'United States',
    'en',
    null,
    null,
    'existingAccessToken',
    new Date('2099-01-01'),
    'existingRefreshToken'
);

test('airstage.apiv1.Client#postUsersSignIn calls _makeHttpsRequest with success', (context, done) => {
    const clientWithoutAccessToken = new airstage.apiv1.Client('us', 'United States', 'en');
    const expectedResponse = {
        'accessToken': 'testAccessToken',
        'expiresIn': 3600,
        'refreshToken': 'testRefreshToken'
    };
    context.mock.method(
        clientWithoutAccessToken,
        '_makeHttpsRequest',
        (requestOptions, requestBodyJson, callback) => {
            let result = structuredClone(airstage.apiv1.constants.REQUEST_RESULT);
            result.response = expectedResponse;

            callback(result);
        }
    );
    context.after(() => {
        const mockedMethod = clientWithoutAccessToken._makeHttpsRequest.mock;
        const requestOptions = mockedMethod.calls[0].arguments[0];
        const requestBody = JSON.parse(mockedMethod.calls[0].arguments[1]);

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(requestOptions.method, 'POST');
        assert.strictEqual(requestOptions.path, '/apiv1/users/sign_in');
        assert.strictEqual(requestBody.user.country, 'United States');
        assert.strictEqual(requestBody.user.email, 'test@example.com');
        assert.strictEqual(requestBody.user.language, 'en');
        assert.strictEqual(requestBody.user.password, 'password123');
    });

    clientWithoutAccessToken.postUsersSignIn('test@example.com', 'password123', (result) => {
        assert.strictEqual(result.error, null);
        assert.strictEqual(result.response, expectedResponse);

        done();
    });
});

test('airstage.apiv1.Client#postUsersSignIn calls _makeHttpsRequest with error', (context, done) => {
    const clientWithoutAccessToken = new airstage.apiv1.Client('us', 'United States', 'en');
    const expectedError = 'Error';
    context.mock.method(
        clientWithoutAccessToken,
        '_makeHttpsRequest',
        (requestOptions, requestBodyJson, callback) => {
            let result = structuredClone(airstage.apiv1.constants.REQUEST_RESULT);
            result.error = expectedError;

            callback(result);
        }
    );
    context.after(() => {
        const mockedMethod = clientWithoutAccessToken._makeHttpsRequest.mock;
        const requestOptions = mockedMethod.calls[0].arguments[0];
        const requestBody = JSON.parse(mockedMethod.calls[0].arguments[1]);

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(requestOptions.method, 'POST');
        assert.strictEqual(requestOptions.path, '/apiv1/users/sign_in');
        assert.strictEqual(requestBody.user.country, 'United States');
        assert.strictEqual(requestBody.user.email, 'test@example.com');
        assert.strictEqual(requestBody.user.language, 'en');
        assert.strictEqual(requestBody.user.password, 'password123');
    });

    clientWithoutAccessToken.postUsersSignIn('test@example.com', 'password123', (result) => {
        assert.strictEqual(result.error, expectedError);
        assert.strictEqual(result.response, '');

        done();
    });
});

test('airstage.apiv1.Client#postUsersMeRefreshToken calls _makeHttpsRequest with success', (context, done) => {
    const clientWithRefreshToken = new airstage.apiv1.Client(
        'us',
        'United States',
        'en',
        null,
        null,
        'existingAccessToken',
        new Date('2099-01-01'),
        'existingRefreshToken'
    );
    const expectedResponse = {
        'accessToken': 'testAccessToken',
        'expiresIn': 3600,
        'refreshToken': 'testRefreshToken'
    };
    context.mock.method(
        clientWithRefreshToken,
        '_makeHttpsRequest',
        (requestOptions, requestBodyJson, callback) => {
            let result = structuredClone(airstage.apiv1.constants.REQUEST_RESULT);
            result.response = expectedResponse;

            callback(result);
        }
    );
    context.after(() => {
        const mockedMethod = clientWithRefreshToken._makeHttpsRequest.mock;
        const requestOptions = mockedMethod.calls[0].arguments[0];
        const requestBody = JSON.parse(mockedMethod.calls[0].arguments[1]);

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(requestOptions.method, 'POST');
        assert.strictEqual(requestOptions.path, '/apiv1/users/me/refresh_token');
        assert.strictEqual(requestOptions.headers.authorization, 'Bearer existingAccessToken');
        assert.strictEqual(requestBody.user.refreshToken, 'existingRefreshToken');
    });

    clientWithRefreshToken.postUsersMeRefreshToken('existingRefreshToken', (result) => {
        assert.strictEqual(result.error, null);
        assert.strictEqual(result.response, expectedResponse);

        done();
    });
});

test('airstage.apiv1.Client#postUsersMeRefreshToken calls _makeHttpsRequest with error', (context, done) => {
    const clientWithRefreshToken = new airstage.apiv1.Client(
        'us',
        'United States',
        'en',
        null,
        null,
        'existingAccessToken',
        new Date('2099-01-01'),
        'existingRefreshToken'
    );
    const expectedError = 'Error';
    context.mock.method(
        clientWithRefreshToken,
        '_makeHttpsRequest',
        (requestOptions, requestBodyJson, callback) => {
            let result = structuredClone(airstage.apiv1.constants.REQUEST_RESULT);
            result.error = expectedError;

            callback(result);
        }
    );
    context.after(() => {
        const mockedMethod = clientWithRefreshToken._makeHttpsRequest.mock;
        const requestOptions = mockedMethod.calls[0].arguments[0];
        const requestBody = JSON.parse(mockedMethod.calls[0].arguments[1]);

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(requestOptions.method, 'POST');
        assert.strictEqual(requestOptions.path, '/apiv1/users/me/refresh_token');
        assert.strictEqual(requestOptions.headers.authorization, 'Bearer existingAccessToken');
        assert.strictEqual(requestBody.user.refreshToken, 'existingRefreshToken');
    });

    clientWithRefreshToken.postUsersMeRefreshToken('existingRefreshToken', (result) => {
        assert.strictEqual(result.error, expectedError);
        assert.strictEqual(result.response, '');

        done();
    });
});

test('airstage.apiv1.Client#getUsersMe calls _makeHttpsRequest with success', (context, done) => {
    const expectedResponse = {
        'tempUnit': 'F'
    };
    context.mock.method(
        clientWithAccessToken,
        '_makeHttpsRequest',
        (requestOptions, requestBodyJson, callback) => {
            let result = structuredClone(airstage.apiv1.constants.REQUEST_RESULT);
            result.response = expectedResponse;

            callback(result);
        }
    );
    context.after(() => {
        const mockedMethod = clientWithAccessToken._makeHttpsRequest.mock;
        const requestOptions = mockedMethod.calls[0].arguments[0];

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(requestOptions.method, 'GET');
        assert.strictEqual(requestOptions.path, '/apiv1/users/me');
        assert.strictEqual(requestOptions.headers.authorization, 'Bearer existingAccessToken');
    });

    clientWithAccessToken.getUsersMe((result) => {
        assert.strictEqual(result.error, null);
        assert.strictEqual(result.response, expectedResponse);

        done();
    });
});

test('airstage.apiv1.Client#getUsersMe calls _makeHttpsRequest with error', (context, done) => {
    const expectedError = 'Error';
    context.mock.method(
        clientWithAccessToken,
        '_makeHttpsRequest',
        (requestOptions, requestBodyJson, callback) => {
            let result = structuredClone(airstage.apiv1.constants.REQUEST_RESULT);
            result.error = expectedError;

            callback(result);
        }
    );
    context.after(() => {
        const mockedMethod = clientWithAccessToken._makeHttpsRequest.mock;
        const requestOptions = mockedMethod.calls[0].arguments[0];

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(requestOptions.method, 'GET');
        assert.strictEqual(requestOptions.path, '/apiv1/users/me');
        assert.strictEqual(requestOptions.headers.authorization, 'Bearer existingAccessToken');
    });

    clientWithAccessToken.getUsersMe((result) => {
        assert.strictEqual(result.error, expectedError);
        assert.strictEqual(result.response, '');

        done();
    });
});

test('airstage.apiv1.Client#putUsersMe calls _makeHttpsRequest with success', (context, done) => {
    const expectedResponse = {
        'tempUnit': 'F'
    };
    context.mock.method(
        clientWithAccessToken,
        '_makeHttpsRequest',
        (requestOptions, requestBodyJson, callback) => {
            let result = structuredClone(airstage.apiv1.constants.REQUEST_RESULT);
            result.response = expectedResponse;

            callback(result);
        }
    );
    context.after(() => {
        const mockedMethod = clientWithAccessToken._makeHttpsRequest.mock;
        const requestOptions = mockedMethod.calls[0].arguments[0];
        const requestBody = JSON.parse(mockedMethod.calls[0].arguments[1]);

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(requestOptions.method, 'PUT');
        assert.strictEqual(requestOptions.path, '/apiv1/users/me');
        assert.strictEqual(requestOptions.headers.authorization, 'Bearer existingAccessToken');
        assert.strictEqual(requestBody.user.tempUnit, 'F');
    });

    clientWithAccessToken.putUsersMe('tempUnit', 'F', (result) => {
        assert.strictEqual(result.error, null);
        assert.strictEqual(result.response, expectedResponse);

        done();
    });
});

test('airstage.apiv1.Client#putUsersMe calls _makeHttpsRequest with error', (context, done) => {
    const expectedError = 'Error';
    context.mock.method(
        clientWithAccessToken,
        '_makeHttpsRequest',
        (requestOptions, requestBodyJson, callback) => {
            let result = structuredClone(airstage.apiv1.constants.REQUEST_RESULT);
            result.error = expectedError;

            callback(result);
        }
    );
    context.after(() => {
        const mockedMethod = clientWithAccessToken._makeHttpsRequest.mock;
        const requestOptions = mockedMethod.calls[0].arguments[0];
        const requestBody = JSON.parse(mockedMethod.calls[0].arguments[1]);

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(requestOptions.method, 'PUT');
        assert.strictEqual(requestOptions.path, '/apiv1/users/me');
        assert.strictEqual(requestOptions.headers.authorization, 'Bearer existingAccessToken');
        assert.strictEqual(requestBody.user.tempUnit, 'F');
    });

    clientWithAccessToken.putUsersMe('tempUnit', 'F', (result) => {
        assert.strictEqual(result.error, expectedError);
        assert.strictEqual(result.response, '');

        done();
    });
});

test('airstage.apiv1.Client#getDevicesAll calls _makeHttpsRequest with success', (context, done) => {
    const expectedResponse = {
        'devices': []
    };
    context.mock.method(
        clientWithAccessToken,
        '_makeHttpsRequest',
        (requestOptions, requestBodyJson, callback) => {
            let result = structuredClone(airstage.apiv1.constants.REQUEST_RESULT);
            result.response = expectedResponse;

            callback(result);
        }
    );
    context.after(() => {
        const mockedMethod = clientWithAccessToken._makeHttpsRequest.mock;
        const requestOptions = mockedMethod.calls[0].arguments[0];

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(requestOptions.method, 'GET');
        assert.strictEqual(requestOptions.path, '/apiv1/devices/all?limit=100');
        assert.strictEqual(requestOptions.headers.authorization, 'Bearer existingAccessToken');
    });

    clientWithAccessToken.getDevicesAll(null, (result) => {
        assert.strictEqual(result.error, null);
        assert.strictEqual(result.response, expectedResponse);

        done();
    });
});

test('airstage.apiv1.Client#getDevicesAll calls _makeHttpsRequest with error', (context, done) => {
    const expectedError = 'Error';
    context.mock.method(
        clientWithAccessToken,
        '_makeHttpsRequest',
        (requestOptions, requestBodyJson, callback) => {
            let result = structuredClone(airstage.apiv1.constants.REQUEST_RESULT);
            result.error = expectedError;

            callback(result);
        }
    );
    context.after(() => {
        const mockedMethod = clientWithAccessToken._makeHttpsRequest.mock;
        const requestOptions = mockedMethod.calls[0].arguments[0];

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(requestOptions.method, 'GET');
        assert.strictEqual(requestOptions.path, '/apiv1/devices/all?limit=100');
        assert.strictEqual(requestOptions.headers.authorization, 'Bearer existingAccessToken');
    });

    clientWithAccessToken.getDevicesAll(null, (result) => {
        assert.strictEqual(result.error, expectedError);
        assert.strictEqual(result.response, '');

        done();
    });
});

test('airstage.apiv1.Client#getDevicesAllAuthorizeRequestType calls _makeHttpsRequest with success', (context, done) => {
    const expectedResponse = '';
    context.mock.method(
        clientWithAccessToken,
        '_makeHttpsRequest',
        (requestOptions, requestBodyJson, callback) => {
            let result = structuredClone(airstage.apiv1.constants.REQUEST_RESULT);
            result.response = expectedResponse;

            callback(result);
        }
    );
    context.after(() => {
        const mockedMethod = clientWithAccessToken._makeHttpsRequest.mock;
        const requestOptions = mockedMethod.calls[0].arguments[0];

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(requestOptions.method, 'GET');
        assert.strictEqual(requestOptions.path, '/apiv1/devices/all/authorize_request/type');
        assert.strictEqual(requestOptions.headers.authorization, 'Bearer existingAccessToken');
    });

    clientWithAccessToken.getDevicesAllAuthorizeRequestType((result) => {
        assert.strictEqual(result.error, null);
        assert.strictEqual(result.response, expectedResponse);

        done();
    });
});

test('airstage.apiv1.Client#getDevicesAllAuthorizeRequestType calls _makeHttpsRequest with error', (context, done) => {
    const expectedError = 'Error';
    context.mock.method(
        clientWithAccessToken,
        '_makeHttpsRequest',
        (requestOptions, requestBodyJson, callback) => {
            let result = structuredClone(airstage.apiv1.constants.REQUEST_RESULT);
            result.error = expectedError;

            callback(result);
        }
    );
    context.after(() => {
        const mockedMethod = clientWithAccessToken._makeHttpsRequest.mock;
        const requestOptions = mockedMethod.calls[0].arguments[0];

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(requestOptions.method, 'GET');
        assert.strictEqual(requestOptions.path, '/apiv1/devices/all/authorize_request/type');
        assert.strictEqual(requestOptions.headers.authorization, 'Bearer existingAccessToken');
    });

    clientWithAccessToken.getDevicesAllAuthorizeRequestType((result) => {
        assert.strictEqual(result.error, expectedError);
        assert.strictEqual(result.response, '');

        done();
    });
});

test('airstage.apiv1.Client#getDevice calls _makeHttpsRequest with success', (context, done) => {
    const expectedResponse = {
        'deviceName': 'My Device'
    };

    context.mock.method(
        clientWithAccessToken,
        '_makeHttpsRequest',
        (requestOptions, requestBodyJson, callback) => {
            let result = structuredClone(airstage.apiv1.constants.REQUEST_RESULT);
            result.response = expectedResponse;

            callback(result);
        }
    );
    context.after(() => {
        const mockedMethod = clientWithAccessToken._makeHttpsRequest.mock;
        const requestOptions = mockedMethod.calls[0].arguments[0];

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(requestOptions.method, 'GET');
        assert.strictEqual(requestOptions.path, '/apiv1/devices/12345');
        assert.strictEqual(requestOptions.headers.authorization, 'Bearer existingAccessToken');
    });

    clientWithAccessToken.getDevice('12345', (result) => {
        assert.strictEqual(result.error, null);
        assert.strictEqual(result.response, expectedResponse);

        done();
    });
});

test('airstage.apiv1.Client#getDevice calls _makeHttpsRequest with error', (context, done) => {
    const expectedError = 'Error';

    context.mock.method(
        clientWithAccessToken,
        '_makeHttpsRequest',
        (requestOptions, requestBodyJson, callback) => {
            let result = structuredClone(airstage.apiv1.constants.REQUEST_RESULT);
            result.error = expectedError;

            callback(result);
        }
    );
    context.after(() => {
        const mockedMethod = clientWithAccessToken._makeHttpsRequest.mock;
        const requestOptions = mockedMethod.calls[0].arguments[0];

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(requestOptions.method, 'GET');
        assert.strictEqual(requestOptions.path, '/apiv1/devices/12345');
        assert.strictEqual(requestOptions.headers.authorization, 'Bearer existingAccessToken');
    });

    clientWithAccessToken.getDevice('12345', (result) => {
        assert.strictEqual(result.error, expectedError);
        assert.strictEqual(result.response, '');

        done();
    });
});

test('airstage.apiv1.Client#postDevicesSetParametersRequest calls _makeHttpsRequest with success', (context, done) => {
    const expectedResponse = {'reqId': '54321'};
    context.mock.method(
        clientWithAccessToken,
        '_makeHttpsRequest',
        (requestOptions, requestBodyJson, callback) => {
            let result = structuredClone(airstage.apiv1.constants.REQUEST_RESULT);
            result.response = expectedResponse;

            callback(result);
        }
    );
    context.after(() => {
        const mockedMethod = clientWithAccessToken._makeHttpsRequest.mock;
        const requestOptions = mockedMethod.calls[0].arguments[0];
        const requestBody = JSON.parse(mockedMethod.calls[0].arguments[1]);

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(requestOptions.method, 'POST');
        assert.strictEqual(requestOptions.path, '/apiv1/devices/12345/set_parameters_request');
        assert.strictEqual(requestOptions.headers.authorization, 'Bearer existingAccessToken');
        assert.strictEqual(requestBody.deviceSubId, '0');
        assert.strictEqual(requestBody.parameters[0].desiredValue, 'bar');
        assert.strictEqual(requestBody.parameters[0].name, 'foo');
    });

    clientWithAccessToken.postDevicesSetParametersRequest('12345', '0', 'foo', 'bar', (result) => {
        assert.strictEqual(result.error, null);
        assert.strictEqual(result.response, expectedResponse);

        done();
    });
});

test('airstage.apiv1.Client#postDevicesSetParametersRequest calls _makeHttpsRequest with error', (context, done) => {
    const expectedError = 'Error';
    context.mock.method(
        clientWithAccessToken,
        '_makeHttpsRequest',
        (requestOptions, requestBodyJson, callback) => {
            let result = structuredClone(airstage.apiv1.constants.REQUEST_RESULT);
            result.error = expectedError;

            callback(result);
        }
    );
    context.after(() => {
        const mockedMethod = clientWithAccessToken._makeHttpsRequest.mock;
        const requestOptions = mockedMethod.calls[0].arguments[0];
        const requestBody = JSON.parse(mockedMethod.calls[0].arguments[1]);

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(requestOptions.method, 'POST');
        assert.strictEqual(requestOptions.path, '/apiv1/devices/12345/set_parameters_request');
        assert.strictEqual(requestOptions.headers.authorization, 'Bearer existingAccessToken');
        assert.strictEqual(requestBody.deviceSubId, '0');
        assert.strictEqual(requestBody.parameters[0].desiredValue, 'bar');
        assert.strictEqual(requestBody.parameters[0].name, 'foo');
    });

    clientWithAccessToken.postDevicesSetParametersRequest('12345', '0', 'foo', 'bar', (result) => {
        assert.strictEqual(result.error, expectedError);
        assert.strictEqual(result.response, '');

        done();
    });
});

test('airstage.apiv1.Client#getDevicesRequests calls _makeHttpsRequest with success', (context, done) => {
    const expectedResponse = '';
    context.mock.method(
        clientWithAccessToken,
        '_makeHttpsRequest',
        (requestOptions, requestBodyJson, callback) => {
            let result = structuredClone(airstage.apiv1.constants.REQUEST_RESULT);
            result.response = expectedResponse;

            callback(result);
        }
    );
    context.after(() => {
        const mockedMethod = clientWithAccessToken._makeHttpsRequest.mock;
        const requestOptions = mockedMethod.calls[0].arguments[0];

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(requestOptions.method, 'GET');
        assert.strictEqual(requestOptions.path, '/apiv1/devices/12345/requests');
        assert.strictEqual(requestOptions.headers.authorization, 'Bearer existingAccessToken');
    });

    clientWithAccessToken.getDevicesRequests('12345', (result) => {
        assert.strictEqual(result.error, null);
        assert.strictEqual(result.response, expectedResponse);

        done();
    });
});

test('airstage.apiv1.Client#getDevicesRequests calls _makeHttpsRequest with error', (context, done) => {
    const expectedError = 'Error';
    context.mock.method(
        clientWithAccessToken,
        '_makeHttpsRequest',
        (requestOptions, requestBodyJson, callback) => {
            let result = structuredClone(airstage.apiv1.constants.REQUEST_RESULT);
            result.error = expectedError;

            callback(result);
        }
    );
    context.after(() => {
        const mockedMethod = clientWithAccessToken._makeHttpsRequest.mock;
        const requestOptions = mockedMethod.calls[0].arguments[0];

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(requestOptions.method, 'GET');
        assert.strictEqual(requestOptions.path, '/apiv1/devices/12345/requests');
        assert.strictEqual(requestOptions.headers.authorization, 'Bearer existingAccessToken');
    });

    clientWithAccessToken.getDevicesRequests('12345', (result) => {
        assert.strictEqual(result.error, expectedError);
        assert.strictEqual(result.response, '');

        done();
    });
});

test('airstage.apiv1.Client#getDevicesRequest calls _makeHttpsRequest with success', (context, done) => {
    const expectedResponse = {
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
        clientWithAccessToken,
        '_makeHttpsRequest',
        (requestOptions, requestBodyJson, callback) => {
            let result = structuredClone(airstage.apiv1.constants.REQUEST_RESULT);
            result.response = expectedResponse;

            callback(result);
        }
    );
    context.after(() => {
        const mockedMethod = clientWithAccessToken._makeHttpsRequest.mock;
        const requestOptions = mockedMethod.calls[0].arguments[0];

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(requestOptions.method, 'GET');
        assert.strictEqual(requestOptions.path, '/apiv1/devices/12345/requests/54321');
        assert.strictEqual(requestOptions.headers.authorization, 'Bearer existingAccessToken');
    });

    clientWithAccessToken.getDevicesRequest('12345', '54321', (result) => {
        assert.strictEqual(result.error, null);
        assert.strictEqual(result.response, expectedResponse);

        done();
    });
});

test('airstage.apiv1.Client#getDevicesRequest calls _makeHttpsRequest with error', (context, done) => {
    const expectedError = 'Error';
    context.mock.method(
        clientWithAccessToken,
        '_makeHttpsRequest',
        (requestOptions, requestBodyJson, callback) => {
            let result = structuredClone(airstage.apiv1.constants.REQUEST_RESULT);
            result.error = expectedError;

            callback(result);
        }
    );
    context.after(() => {
        const mockedMethod = clientWithAccessToken._makeHttpsRequest.mock;
        const requestOptions = mockedMethod.calls[0].arguments[0];

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(requestOptions.method, 'GET');
        assert.strictEqual(requestOptions.path, '/apiv1/devices/12345/requests/54321');
        assert.strictEqual(requestOptions.headers.authorization, 'Bearer existingAccessToken');
    });

    clientWithAccessToken.getDevicesRequest('12345', '54321', (result) => {
        assert.strictEqual(result.error, expectedError);
        assert.strictEqual(result.response, '');

        done();
    });
});

test('airstage.apiv1.Client#getGroups calls _makeHttpsRequest with success', (context, done) => {
    const expectedResponse = '';
    context.mock.method(
        clientWithAccessToken,
        '_makeHttpsRequest',
        (requestOptions, requestBodyJson, callback) => {
            let result = structuredClone(airstage.apiv1.constants.REQUEST_RESULT);
            result.response = expectedResponse;

            callback(result);
        }
    );
    context.after(() => {
        const mockedMethod = clientWithAccessToken._makeHttpsRequest.mock;
        const requestOptions = mockedMethod.calls[0].arguments[0];

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(requestOptions.method, 'GET');
        assert.strictEqual(requestOptions.path, '/apiv1/groups');
        assert.strictEqual(requestOptions.headers.authorization, 'Bearer existingAccessToken');
    });

    clientWithAccessToken.getGroups((result) => {
        assert.strictEqual(result.error, null);
        assert.strictEqual(result.response, expectedResponse);

        done();
    });
});

test('airstage.apiv1.Client#getGroups calls _makeHttpsRequest with error', (context, done) => {
    const expectedError = 'Error';
    context.mock.method(
        clientWithAccessToken,
        '_makeHttpsRequest',
        (requestOptions, requestBodyJson, callback) => {
            let result = structuredClone(airstage.apiv1.constants.REQUEST_RESULT);
            result.error = expectedError;

            callback(result);
        }
    );
    context.after(() => {
        const mockedMethod = clientWithAccessToken._makeHttpsRequest.mock;
        const requestOptions = mockedMethod.calls[0].arguments[0];

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(requestOptions.method, 'GET');
        assert.strictEqual(requestOptions.path, '/apiv1/groups');
        assert.strictEqual(requestOptions.headers.authorization, 'Bearer existingAccessToken');
    });

    clientWithAccessToken.getGroups((result) => {
        assert.strictEqual(result.error, expectedError);
        assert.strictEqual(result.response, '');

        done();
    });
});
