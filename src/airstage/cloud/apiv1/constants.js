'use strict';

// Supported regions
module.exports.REGION_US = 'us';
module.exports.REGION_EU = 'eu';

// API hostnames
module.exports.HOSTNAME_US = 'bke.us.airstagelight.com';
module.exports.HOSTNAME_EU = 'bke.euro.airstagelight.com';

// Default values
module.exports.DEFAULT_DEVICES_ALL_LIMIT = 100;
module.exports.DEFAULT_OS_VERSION = 'iOS 17.4.1';
module.exports.DEFAULT_USER_AGENT = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148';

// API endpoint paths
module.exports.PATH_DEVICES_ONE = '/apiv1/devices/%1';
module.exports.PATH_DEVICES_ALL = '/apiv1/devices/all';
module.exports.PATH_DEVICES_ALL_AUTHORIZE_REQUEST_TYPE = '/apiv1/devices/all/authorize_request/type';
module.exports.PATH_DEVICES_SET_PARAMETERS_REQUEST = '/apiv1/devices/%1/set_parameters_request'
module.exports.PATH_DEVICES_REQUESTS_ALL = '/apiv1/devices/%1/requests'
module.exports.PATH_DEVICES_REQUESTS_ONE = '/apiv1/devices/%1/requests/%2'
module.exports.PATH_GROUPS = '/apiv1/groups';
module.exports.PATH_USERS_ME = '/apiv1/users/me';
module.exports.PATH_USERS_ME_REFRESH_TOKEN = '/apiv1/users/me/refresh_token';
module.exports.PATH_USERS_SIGN_IN = '/apiv1/users/sign_in';

// Request methods
module.exports.REQUEST_METHOD_GET = 'GET';
module.exports.REQUEST_METHOD_POST = 'POST';
module.exports.REQUEST_METHOD_PUT = 'PUT';

// Request header keys
module.exports.REQUEST_HEADER_AUTHORIZATION = 'authorization';
module.exports.REQUEST_HEADER_CONTENT_LENGTH = 'content-length';
module.exports.REQUEST_HEADER_USER_AGENT = 'user-agent';

// Metadata keys
module.exports.METADATA_CONNECTION_STATUS = 'connectionStatus';
module.exports.METADATA_DEVICE_NAME = 'deviceName';

module.exports.METADATA_KEYS = [
    module.exports.METADATA_CONNECTION_STATUS,
    module.exports.METADATA_DEVICE_NAME
];

// Parameter statuses
module.exports.PARAMETER_STATUS_WAITING = 'waiting';
module.exports.PARAMETER_STATUS_COMPLETE = 'complete';

// Parameter results
module.exports.PARAMETER_RESULT_SUCCESS = 'success';

// User attributes
module.exports.USER_TEMPERATURE_SCALE = 'tempUnit';

// Message codes
module.exports.MESSAGE_CODE_INVALID_LOGIN = 'AIRSTAGE_POST_USERS_SIGNIN_EMAIL_PASSWORD_INVALID';
module.exports.MESSAGE_CODE_INVALID_TOKEN = 'AIRSTAGE_COMMON_TOKEN_INVALID';

// Request header templates
module.exports.REQUEST_HEADERS_POST_PUT = {
    'content-type': 'application/json',
    'accept': 'application/json, text/plain, */*',
    'sec-fetch-site': 'cross-site',
    'accept-encoding': 'gzip, deflate, br',
    'accept-language': 'en-US,en;q=0.9',
    'sec-fetch-mode': 'cors',
    'origin': 'file://',
    'sec-fetch-dest': 'empty'
};

module.exports.REQUEST_HEADERS_GET = {
    'accept': 'application/json, text/plain, */*',
    'sec-fetch-site': 'cross-site',
    'sec-fetch-dest': 'empty',
    'accept-language': 'en-US,en;q=0.9',
    'sec-fetch-mode': 'cors',
    'accept-encoding': 'gzip, deflate, br'
};

// Result template
module.exports.REQUEST_RESULT = {
    'error': null,
    'statusCode': null,
    'response': ''
};
