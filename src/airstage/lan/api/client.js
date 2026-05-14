'use strict';

const http = require('node:http');
const constants = require('./constants');

class Client {

    constructor(
        userAgent = null
    ) {
        this.userAgent = userAgent || constants.DEFAULT_USER_AGENT;
    }

    // POST http://[hostname]/GetParam
    postGetParam(hostname, deviceId, deviceSubId, list, callback) {
        const requestBody = {
            'device_id': deviceId,
            'device_sub_id': deviceSubId,
            'req_id': '',
            'modified_by': '',
            'set_level': constants.SET_LEVEL_GET,
            'list': list
        };

        this._makePostRequest(
            hostname,
            constants.PATH_GET_PARAM,
            requestBody,
            callback
        );
    }

    // POST http://[hostname]/SetParam
    postSetParam(hostname, deviceId, deviceSubId, value, callback) {
        const requestBody = {
            'device_id': deviceId,
            'device_sub_id': deviceSubId,
            'req_id': '',
            'modified_by': '',
            'set_level': constants.SET_LEVEL_SET,
            'value': value
        };

        this._makePostRequest(
            hostname,
            constants.PATH_SET_PARAM,
            requestBody,
            callback
        );
    }

    _makePostRequest(hostname, path, requestBody, callback) {
        this._makeRequestWithRequestBody(
            constants.REQUEST_METHOD_POST,
            hostname,
            path,
            requestBody,
            callback
        );
    }

    _makeRequestWithRequestBody(method, hostname, path, requestBody, callback) {
        const requestBodyJson = JSON.stringify(requestBody);
        let request = null;
        let requestOptions = null;
        let requestHeaders = structuredClone(constants.REQUEST_HEADERS_POST);

        requestHeaders[constants.REQUEST_HEADER_USER_AGENT] = this.userAgent;
        requestHeaders[constants.REQUEST_HEADER_CONTENT_LENGTH] = requestBodyJson.length;

        requestOptions = {
            'hostname': hostname,
            'path': path,
            'method': method,
            'headers': requestHeaders
        };

        this._makeHttpRequest(requestOptions, requestBodyJson, callback);
    }

    _makeHttpRequest(requestOptions, requestBodyJson, callback) {
        let result = structuredClone(constants.REQUEST_RESULT);

        const request = http.request(requestOptions, (response) => {
            result.statusCode = response.statusCode;

            response.on('data', (chunk) => {
                result.response += chunk;
            });

            response.on('end', () => {
                if (result.response) {
                    result.response = JSON.parse(result.response);
                }

                callback(result);
            });
        }).on('error', (error) => {
            result.error = error;
            callback(result);
        });

        if (requestBodyJson) {
            request.write(requestBodyJson);
        }

        request.end();
    }
}

module.exports = Client;
