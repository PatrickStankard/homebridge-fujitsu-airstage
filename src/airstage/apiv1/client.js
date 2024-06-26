'use strict';

const crypto = require('node:crypto');
const https = require('node:https');
const querystring = require('node:querystring');
const constants = require('./constants');

class Client {

    constructor(
        region,
        country,
        language,
        osVersion = null,
        userAgent = null,
        accessToken = null,
        accessTokenExpiry = null,
        refreshToken = null
    ) {
        if (typeof accessTokenExpiry === 'string') {
            accessTokenExpiry = new Date(accessTokenExpiry);
        }

        this.region = region;
        this.country = country;
        this.language = language;
        this.osVersion = osVersion || constants.DEFAULT_OS_VERSION;
        this.userAgent = userAgent || constants.DEFAULT_USER_AGENT;
        this.accessToken = accessToken;
        this.accessTokenExpiry = accessTokenExpiry;
        this.refreshToken = refreshToken;
    }

    // POST /apiv1/users/sign_in
    postUsersSignIn(email, password, callback) {
        const requestBody = {
            'user': {
                'country': this.country,
                'deviceToken': this._generateDeviceToken(),
                'email': email,
                'language': this.language,
                'osVersion': this.osVersion,
                'password': password,
                'ssid': this._generateSsid()
            }
        };

        this._makePostRequest(
            constants.PATH_USERS_SIGN_IN,
            requestBody,
            (function(result) {
                this._storeAccessToken(result);

                callback(result);
            }).bind(this)
        );
    }

    // POST /apiv1/users/me/refresh_token
    postUsersMeRefreshToken(refreshToken, callback) {
        const requestBody = {
            'user': {
                'refreshToken': refreshToken
            }
        };

        this._makePostRequest(
            constants.PATH_USERS_ME_REFRESH_TOKEN,
            requestBody,
            (function(result) {
                this._storeAccessToken(result);

                callback(result);
            }).bind(this)
        );
    }

    // GET /apiv1/users/me
    getUsersMe(callback) {
        this._makeGetRequest(
            constants.PATH_USERS_ME,
            null,
            callback
        );
    }

    // PUT /apiv1/users/me
    putUsersMe(parameterName, parameterValue, callback) {
        let requestBody = {
            'user': {}
        };

        requestBody['user'][parameterName] = parameterValue;

        this._makePutRequest(
            constants.PATH_USERS_ME,
            requestBody,
            callback
        );
    }

    // GET /apiv1/devices/all
    getDevicesAll(limit, callback) {
        const params = {
            'limit': limit || constants.DEFAULT_DEVICES_ALL_LIMIT
        };

        this._makeGetRequest(
            constants.PATH_DEVICES_ALL,
            params,
            callback
        );
    }

    // GET /apiv1/devices/all/authorize_request/type
    getDevicesAllAuthorizeRequestType(callback) {
        this._makeGetRequest(
            constants.PATH_DEVICES_ALL_AUTHORIZE_REQUEST_TYPE,
            null,
            callback
        );
    }

    // GET /apiv1/devices/[deviceId]
    getDevice(deviceId, callback) {
        const path = constants.PATH_DEVICES_ONE
            .replace('%1', deviceId);

        this._makeGetRequest(
            path,
            null,
            callback
        );
    }

    // POST /apiv1/devices/[deviceId]/set_parameters_request
    postDevicesSetParametersRequest(deviceId, deviceSubId, parameterName, parameterValue, callback) {
        const path = constants.PATH_DEVICES_SET_PARAMETERS_REQUEST
            .replace('%1', deviceId);
        const requestBody = {
            'deviceSubId': deviceSubId,
            'parameters': [
                {
                    'desiredValue': parameterValue,
                    'name': parameterName
                }
            ]
        };

        this._makePostRequest(
            path,
            requestBody,
            callback
        );
    }

    // GET /apiv1/devices/[deviceId]/requests
    getDevicesRequests(deviceId, callback) {
        const path = constants.PATH_DEVICES_REQUESTS_ALL
            .replace('%1', deviceId);

        this._makeGetRequest(
            path,
            null,
            callback
        );
    }

    // GET /apiv1/devices/[deviceId]/requests/[requestId]
    getDevicesRequest(deviceId, requestId, callback) {
        const path = constants.PATH_DEVICES_REQUESTS_ONE
            .replace('%1', deviceId)
            .replace('%2', requestId);

        this._makeGetRequest(
            path,
            null,
            callback
        );
    }

    // GET /apiv1/groups
    getGroups(callback) {
        this._makeGetRequest(
            constants.PATH_GROUPS,
            null,
            callback
        );
    }

    _makePostRequest(path, requestBody, callback) {
        this._makeRequestWithRequestBody(
            constants.REQUEST_METHOD_POST,
            path,
            requestBody,
            callback
        );
    }

    _makePutRequest(path, requestBody, callback) {
        this._makeRequestWithRequestBody(
            constants.REQUEST_METHOD_PUT,
            path,
            requestBody,
            callback
        );
    }

    _makeGetRequest(path, params, callback) {
        let queryStringParams = '';
        let request = null;
        let requestOptions = null;
        let requestHeaders = structuredClone(constants.REQUEST_HEADERS_GET);

        if (params !== null) {
            queryStringParams = querystring.stringify(params);
        }

        if (queryStringParams !== '') {
            path = path + '?' + queryStringParams;
        }

        requestHeaders[constants.REQUEST_HEADER_USER_AGENT] = this.userAgent;

        if (this.accessToken) {
            requestHeaders[constants.REQUEST_HEADER_AUTHORIZATION] = 'Bearer ' + this.accessToken;
        } else {
            const result = structuredClone(constants.REQUEST_RESULT);
            result.error = 'Access token not set';

            return callback(result);
        }

        requestOptions = {
            'hostname': null,
            'path': path,
            'method': constants.REQUEST_METHOD_GET,
            'headers': requestHeaders
        };

        this._makeHttpsRequest(requestOptions, null, callback);
    }

    _makeRequestWithRequestBody(method, path, requestBody, callback) {
        const requestBodyJson = JSON.stringify(requestBody);
        let request = null;
        let requestOptions = null;
        let requestHeaders = structuredClone(constants.REQUEST_HEADERS_POST_PUT);

        requestHeaders[constants.REQUEST_HEADER_USER_AGENT] = this.userAgent;
        requestHeaders[constants.REQUEST_HEADER_CONTENT_LENGTH] = requestBodyJson.length;

        if (this.accessToken) {
            requestHeaders[constants.REQUEST_HEADER_AUTHORIZATION] = 'Bearer ' + this.accessToken;
        } else if (path !== constants.PATH_USERS_SIGN_IN) {
            const result = structuredClone(constants.REQUEST_RESULT);
            result.error = 'Access token not set';

            return callback(result);
        }

        requestOptions = {
            'hostname': null,
            'path': path,
            'method': method,
            'headers': requestHeaders
        };

        this._makeHttpsRequest(requestOptions, requestBodyJson, callback);
    }

    _makeHttpsRequest(requestOptions, requestBodyJson, callback) {
        const hostname = this._getHostname();
        let result = structuredClone(constants.REQUEST_RESULT);

        if (hostname === null) {
            result.error = 'Could not determine hostname for region: ' + this.region;

            return callback(result);
        }

        requestOptions.hostname = hostname;

        const request = https.request(requestOptions, (response) => {
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

    _storeAccessToken(result) {
        if (result.response) {
            if (result.response.accessToken) {
                this.accessToken = result.response.accessToken;
            }

            if (result.response.expiresIn) {
                this.accessTokenExpiry = new Date();
                this.accessTokenExpiry.setSeconds(
                    this.accessTokenExpiry.getSeconds() + result.response.expiresIn
                );
            }

            if (result.response.refreshToken) {
                this.refreshToken = result.response.refreshToken;
            }
        }
    }

    _generateDeviceToken() {
        return (
            crypto.randomBytes(11).toString('hex') +
            ':' +
            crypto.randomBytes(70).toString('hex')
        );
    }

    _generateSsid() {
        return crypto.randomUUID();
    }

    _getHostname() {
        let hostname = null;

        if (this.region === constants.REGION_US) {
            hostname = constants.HOSTNAME_US;
        } else if (this.region === constants.REGION_EU) {
            hostname = constants.HOSTNAME_EU;
        }

        return hostname;
    }
}

module.exports = Client;
