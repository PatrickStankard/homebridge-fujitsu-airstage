'use strict';

const assert = require('node:assert');
const { mock, test } = require('node:test');
const airstage = require('./../../../../src/airstage');

const client = new airstage.lan.api.Client();

test('airstage.lan.api.Client#postGetParam calls _makeHttpRequest with success', (context, done) => {
    const expectedResponse = {
        'value': {
            'iu_fan_spd': '0'
        },
        'read_res': 'ack',
        'device_id': '1CCE512CA9C9',
        'device_sub_id': 0,
        'req_id': '',
        'modified_by': '',
        'set_level': '03',
        'cause': '',
        'result': 'OK',
        'error': ''
    };
    context.mock.method(
        client,
        '_makeHttpRequest',
        (requestOptions, requestBodyJson, callback) => {
            let result = structuredClone(airstage.lan.api.constants.REQUEST_RESULT);
            result.response = expectedResponse;

            callback(result);
        }
    );
    context.after(() => {
        const mockedMethod = client._makeHttpRequest.mock;
        const requestOptions = mockedMethod.calls[0].arguments[0];
        const requestBody = JSON.parse(mockedMethod.calls[0].arguments[1]);

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(requestOptions.method, 'POST');
        assert.strictEqual(requestOptions.hostname, '127.0.0.1');
        assert.strictEqual(requestOptions.path, '/GetParam');
        assert.strictEqual(requestBody.device_id, '1CCE512CA9C9');
        assert.strictEqual(requestBody.device_sub_id, '0');
        assert.strictEqual(requestBody.req_id, '');
        assert.strictEqual(requestBody.modified_by, '');
        assert.strictEqual(requestBody.set_level, '03');
        assert.strictEqual(requestBody.list.length, 1);
        assert.strictEqual(requestBody.list[0], 'iu_fan_spd');
    });

    client.postGetParam('127.0.0.1', '1CCE512CA9C9', '0', ['iu_fan_spd'], (result) => {
        assert.strictEqual(result.error, null);
        assert.strictEqual(result.response, expectedResponse);

        done();
    });
});

test('airstage.lan.api.Client#postGetParam calls _makeHttpRequest with error', (context, done) => {
    const expectedError = 'Error';
    context.mock.method(
        client,
        '_makeHttpRequest',
        (requestOptions, requestBodyJson, callback) => {
            let result = structuredClone(airstage.lan.api.constants.REQUEST_RESULT);
            result.error = expectedError;

            callback(result);
        }
    );
    context.after(() => {
        const mockedMethod = client._makeHttpRequest.mock;
        const requestOptions = mockedMethod.calls[0].arguments[0];
        const requestBody = JSON.parse(mockedMethod.calls[0].arguments[1]);

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(requestOptions.method, 'POST');
        assert.strictEqual(requestOptions.hostname, '127.0.0.1');
        assert.strictEqual(requestOptions.path, '/GetParam');
        assert.strictEqual(requestBody.device_id, '1CCE512CA9C9');
        assert.strictEqual(requestBody.device_sub_id, '0');
        assert.strictEqual(requestBody.req_id, '');
        assert.strictEqual(requestBody.modified_by, '');
        assert.strictEqual(requestBody.set_level, '03');
        assert.strictEqual(requestBody.list.length, 1);
        assert.strictEqual(requestBody.list[0], 'iu_fan_spd');
    });

    client.postGetParam('127.0.0.1', '1CCE512CA9C9', '0', ['iu_fan_spd'], (result) => {
        assert.strictEqual(result.error, expectedError);
        assert.strictEqual(result.response, '');

        done();
    });
});

test('airstage.lan.api.Client#postSetParam calls _makeHttpRequest with success', (context, done) => {
    const expectedResponse = {
        'value': {
            'iu_onoff': '1'
        },
        'write_res': 'ack',
        'read_res': 'ack',
        'device_id': '1CCE512CA9C9',
        'device_sub_id': 0,
        'req_id': '',
        'modified_by': '',
        'set_level': '02',
        'cause': '',
        'result': 'OK',
        'error': ''
    };
    context.mock.method(
        client,
        '_makeHttpRequest',
        (requestOptions, requestBodyJson, callback) => {
            let result = structuredClone(airstage.lan.api.constants.REQUEST_RESULT);
            result.response = expectedResponse;

            callback(result);
        }
    );
    context.after(() => {
        const mockedMethod = client._makeHttpRequest.mock;
        const requestOptions = mockedMethod.calls[0].arguments[0];
        const requestBody = JSON.parse(mockedMethod.calls[0].arguments[1]);

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(requestOptions.method, 'POST');
        assert.strictEqual(requestOptions.hostname, '127.0.0.1');
        assert.strictEqual(requestOptions.path, '/SetParam');
        assert.strictEqual(requestBody.device_id, '1CCE512CA9C9');
        assert.strictEqual(requestBody.device_sub_id, '0');
        assert.strictEqual(requestBody.req_id, '');
        assert.strictEqual(requestBody.modified_by, '');
        assert.strictEqual(requestBody.set_level, '02');
        assert.strictEqual(Object.keys(requestBody.value).length, 1);
        assert.strictEqual(requestBody.value['iu_fan_spd'], '1');
    });

    client.postSetParam('127.0.0.1', '1CCE512CA9C9', '0', {'iu_fan_spd': '1'}, (result) => {
        assert.strictEqual(result.error, null);
        assert.strictEqual(result.response, expectedResponse);

        done();
    });
});

test('airstage.lan.api.Client#postSetParam calls _makeHttpRequest with error', (context, done) => {
    const expectedError = 'Error';
    context.mock.method(
        client,
        '_makeHttpRequest',
        (requestOptions, requestBodyJson, callback) => {
            let result = structuredClone(airstage.lan.api.constants.REQUEST_RESULT);
            result.error = expectedError;

            callback(result);
        }
    );
    context.after(() => {
        const mockedMethod = client._makeHttpRequest.mock;
        const requestOptions = mockedMethod.calls[0].arguments[0];
        const requestBody = JSON.parse(mockedMethod.calls[0].arguments[1]);

        assert.strictEqual(mockedMethod.calls.length, 1);
        assert.strictEqual(requestOptions.method, 'POST');
        assert.strictEqual(requestOptions.hostname, '127.0.0.1');
        assert.strictEqual(requestOptions.path, '/SetParam');
        assert.strictEqual(requestBody.device_id, '1CCE512CA9C9');
        assert.strictEqual(requestBody.device_sub_id, '0');
        assert.strictEqual(requestBody.req_id, '');
        assert.strictEqual(requestBody.modified_by, '');
        assert.strictEqual(requestBody.set_level, '02');
        assert.strictEqual(Object.keys(requestBody.value).length, 1);
        assert.strictEqual(requestBody.value['iu_fan_spd'], '1');
    });

    client.postSetParam('127.0.0.1', '1CCE512CA9C9', '0', {'iu_fan_spd': '1'}, (result) => {
        assert.strictEqual(result.error, expectedError);
        assert.strictEqual(result.response, '');

        done();
    });
});
