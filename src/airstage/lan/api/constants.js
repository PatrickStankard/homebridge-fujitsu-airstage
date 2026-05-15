'use strict';

// Default values
module.exports.DEFAULT_USER_AGENT = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148';

// API endpoint paths
module.exports.PATH_GET_PARAM = '/GetParam';
module.exports.PATH_SET_PARAM = '/SetParam';

// Request methods
module.exports.REQUEST_METHOD_POST = 'POST';

// Set level values
module.exports.SET_LEVEL_GET = '03';
module.exports.SET_LEVEL_SET = '02';

// Request header keys
module.exports.REQUEST_HEADER_AUTHORIZATION = 'authorization';
module.exports.REQUEST_HEADER_CONTENT_LENGTH = 'content-length';
module.exports.REQUEST_HEADER_USER_AGENT = 'user-agent';

// Parameter results
module.exports.PARAMETER_RESULT_SUCCESS = 'OK';

// Request header templates
module.exports.REQUEST_HEADERS_POST = {
    'content-type': 'application/json',
    'accept': 'application/json, text/plain, */*',
    'sec-fetch-site': 'cross-site',
    'accept-encoding': 'gzip, deflate, br',
    'accept-language': 'en-US,en;q=0.9',
    'sec-fetch-mode': 'cors',
    'origin': 'file://',
    'sec-fetch-dest': 'empty'
};

// Result template
module.exports.REQUEST_RESULT = {
    'error': null,
    'statusCode': null,
    'response': ''
};
