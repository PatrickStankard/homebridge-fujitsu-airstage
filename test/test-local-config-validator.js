'use strict';

const assert = require('node:assert');
const { mock, test } = require('node:test');
const LocalConfigValidator = require('../src/utils/local-config-validator');

test('LocalConfigValidator#detectDeviceId returns uppercase device ID from ARP', async () => {
    const arp = require('node-arp');
    const origGetMAC = arp.getMAC;

    arp.getMAC = (ipAddress, callback) => {
        callback(null, 'a0:b1:c2:d3:e4:f5');
    };

    const result = await LocalConfigValidator.detectDeviceId('192.168.1.100');

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.deviceId, 'A0B1C2D3E4F5');

    arp.getMAC = origGetMAC;
});

test('LocalConfigValidator#detectDeviceId handles uppercase MAC from ARP', async () => {
    const arp = require('node-arp');
    const origGetMAC = arp.getMAC;

    arp.getMAC = (ipAddress, callback) => {
        callback(null, 'A0:B1:C2:D3:E4:F5');
    };

    const result = await LocalConfigValidator.detectDeviceId('192.168.1.100');

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.deviceId, 'A0B1C2D3E4F5');

    arp.getMAC = origGetMAC;
});

test('LocalConfigValidator#detectDeviceId handles MAC address without zero-padding from ARP', async () => {
    const arp = require('node-arp');
    const origGetMAC = arp.getMAC;

    // node-arp may return MAC addresses without zero-padding (e.g., "9:3" instead of "09:03")
    arp.getMAC = (ipAddress, callback) => {
        callback(null, 'cc:47:40:9:3:2b');
    };

    const result = await LocalConfigValidator.detectDeviceId('192.168.1.100');

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.deviceId, 'CC474009032B');

    arp.getMAC = origGetMAC;
});

test('LocalConfigValidator#detectDeviceId handles mixed zero-padding from ARP', async () => {
    const arp = require('node-arp');
    const origGetMAC = arp.getMAC;

    // Exact format from user's error: "cc:47:40:09:3:2b" (4th octet has zero, 5th doesn't)
    arp.getMAC = (ipAddress, callback) => {
        callback(null, 'cc:47:40:09:3:2b');
    };

    const result = await LocalConfigValidator.detectDeviceId('192.168.1.100');

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.deviceId, 'CC474009032B');

    arp.getMAC = origGetMAC;
});

test('LocalConfigValidator#detectDeviceId returns error on ARP failure', async () => {
    const arp = require('node-arp');
    const origGetMAC = arp.getMAC;

    arp.getMAC = (ipAddress, callback) => {
        callback(new Error('ARP lookup failed'), null);
    };

    const result = await LocalConfigValidator.detectDeviceId('192.168.1.100');

    assert.strictEqual(result.success, false);
    assert.ok(result.error.includes('ARP lookup failed'));
    assert.ok(result.details);

    arp.getMAC = origGetMAC;
});

test('LocalConfigValidator#detectDeviceId returns error when MAC is invalid format', async () => {
    const arp = require('node-arp');
    const origGetMAC = arp.getMAC;

    arp.getMAC = (ipAddress, callback) => {
        callback(null, 'invalid');
    };

    const result = await LocalConfigValidator.detectDeviceId('192.168.1.100');

    assert.strictEqual(result.success, false);
    assert.ok(result.error.includes('Invalid MAC address format'));
    assert.ok(result.details);

    arp.getMAC = origGetMAC;
});

test('LocalConfigValidator#detectDeviceId returns error when MAC not in ARP cache', async () => {
    const arp = require('node-arp');
    const origGetMAC = arp.getMAC;

    arp.getMAC = (ipAddress, callback) => {
        callback(null, null);
    };

    const result = await LocalConfigValidator.detectDeviceId('192.168.1.100');

    assert.strictEqual(result.success, false);
    assert.ok(result.error.includes('No MAC address found in ARP table'));
    assert.ok(result.details.includes('HTTP connectivity was confirmed'));

    arp.getMAC = origGetMAC;
});

test('LocalConfigValidator#validateDeviceConfig returns success on valid device', async () => {
    const http = require('http');
    const origRequest = http.request;

    http.request = (options, callback) => {
        const mockResponse = {
            on: (event, handler) => {
                if (event === 'data') {
                    handler('{"result":"OK","value":{"iu_onoff":"1"}}');
                } else if (event === 'end') {
                    handler();
                }
            }
        };

        setTimeout(() => callback(mockResponse), 0);

        return {
            on: () => {},
            write: () => {},
            end: () => {}
        };
    };

    const result = await LocalConfigValidator.validateDeviceConfig('192.168.1.100', 'A0B1C2D3E4F5', 0);

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.error, undefined);

    http.request = origRequest;
});

test('LocalConfigValidator#validateDeviceConfig returns error on device error response', async () => {
    const http = require('http');
    const origRequest = http.request;

    http.request = (options, callback) => {
        const mockResponse = {
            on: (event, handler) => {
                if (event === 'data') {
                    handler('{"result":"NG","error":"0002"}');
                } else if (event === 'end') {
                    handler();
                }
            }
        };

        setTimeout(() => callback(mockResponse), 0);

        return {
            on: () => {},
            write: () => {},
            end: () => {}
        };
    };

    const result = await LocalConfigValidator.validateDeviceConfig('192.168.1.100', 'A0B1C2D3E4F5', 0);

    assert.strictEqual(result.success, false);
    assert.ok(result.error.includes('Device error'));

    http.request = origRequest;
});

test('LocalConfigValidator#validateDeviceConfig returns error on network failure', async () => {
    const http = require('http');
    const origRequest = http.request;

    http.request = (options, callback) => {
        const mockRequest = {
            on: (event, handler) => {
                if (event === 'error') {
                    setTimeout(() => handler(new Error('Connection refused')), 0);
                }
            },
            write: () => {},
            end: () => {}
        };

        return mockRequest;
    };

    const result = await LocalConfigValidator.validateDeviceConfig('192.168.1.100', 'A0B1C2D3E4F5', 0);

    assert.strictEqual(result.success, false);
    assert.ok(result.error.includes('Connection failed'));

    http.request = origRequest;
});

test('LocalConfigValidator#validateDeviceConfig returns error on timeout', async () => {
    const http = require('http');
    const origRequest = http.request;

    http.request = (options, callback) => {
        const mockRequest = {
            on: (event, handler) => {
                if (event === 'timeout') {
                    setTimeout(() => {
                        handler();
                    }, 0);
                }
            },
            destroy: () => {},
            write: () => {},
            end: () => {}
        };

        return mockRequest;
    };

    const result = await LocalConfigValidator.validateDeviceConfig('192.168.1.100', 'A0B1C2D3E4F5', 0);

    assert.strictEqual(result.success, false);
    assert.ok(result.error.includes('timeout'));

    http.request = origRequest;
});

test('LocalConfigValidator#normalizeDeviceId converts to uppercase and removes colons', () => {
    assert.strictEqual(
        LocalConfigValidator.normalizeDeviceId('a0:b1:c2:d3:e4:f5'),
        'A0B1C2D3E4F5'
    );
    assert.strictEqual(
        LocalConfigValidator.normalizeDeviceId('A0:B1:C2:D3:E4:F5'),
        'A0B1C2D3E4F5'
    );
    assert.strictEqual(
        LocalConfigValidator.normalizeDeviceId('a0b1c2d3e4f5'),
        'A0B1C2D3E4F5'
    );
});

test('LocalConfigValidator#isValidDeviceIdFormat validates correct format', () => {
    assert.strictEqual(LocalConfigValidator.isValidDeviceIdFormat('A0B1C2D3E4F5'), true);
    assert.strictEqual(LocalConfigValidator.isValidDeviceIdFormat('a0b1c2d3e4f5'), true);
    assert.strictEqual(LocalConfigValidator.isValidDeviceIdFormat('A0:B1:C2:D3:E4:F5'), true);
    assert.strictEqual(LocalConfigValidator.isValidDeviceIdFormat('invalid'), false);
    assert.strictEqual(LocalConfigValidator.isValidDeviceIdFormat('A0B1C2D3E4F'), false);
    assert.strictEqual(LocalConfigValidator.isValidDeviceIdFormat('G0B1C2D3E4F5'), false);
});

test('LocalConfigValidator#isValidIpv4Format validates valid IPv4 addresses', () => {
    assert.strictEqual(LocalConfigValidator.isValidIpv4Format('192.168.1.1'), true);
    assert.strictEqual(LocalConfigValidator.isValidIpv4Format('10.0.0.1'), true);
    assert.strictEqual(LocalConfigValidator.isValidIpv4Format('172.16.254.1'), true);
    assert.strictEqual(LocalConfigValidator.isValidIpv4Format('127.0.0.1'), true);
    assert.strictEqual(LocalConfigValidator.isValidIpv4Format('255.255.255.255'), true);
    assert.strictEqual(LocalConfigValidator.isValidIpv4Format('0.0.0.0'), true);
});

test('LocalConfigValidator#isValidIpv4Format rejects invalid IPv4 addresses', () => {
    assert.strictEqual(LocalConfigValidator.isValidIpv4Format('256.1.1.1'), false);
    assert.strictEqual(LocalConfigValidator.isValidIpv4Format('999.999.999.999'), false);
    assert.strictEqual(LocalConfigValidator.isValidIpv4Format('192.168.1'), false);
    assert.strictEqual(LocalConfigValidator.isValidIpv4Format('192.168.1.1.1'), false);
    assert.strictEqual(LocalConfigValidator.isValidIpv4Format('hello'), false);
    assert.strictEqual(LocalConfigValidator.isValidIpv4Format('192.168.1.a'), false);
    assert.strictEqual(LocalConfigValidator.isValidIpv4Format(''), false);
    assert.strictEqual(LocalConfigValidator.isValidIpv4Format(null), false);
    assert.strictEqual(LocalConfigValidator.isValidIpv4Format(undefined), false);
    assert.strictEqual(LocalConfigValidator.isValidIpv4Format(12345), false);
});

test('LocalConfigValidator#checkHttpConnectivity returns success on reachable host', async () => {
    const http = require('http');
    const origRequest = http.request;

    http.request = (options, callback) => {
        const mockResponse = {
            statusCode: 200,
            on: () => {}
        };

        setTimeout(() => callback(mockResponse), 0);

        return {
            on: () => {},
            end: () => {}
        };
    };

    const result = await LocalConfigValidator.checkHttpConnectivity('192.168.1.100');

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.statusCode, 200);
    assert.strictEqual(result.error, undefined);

    http.request = origRequest;
});

test('LocalConfigValidator#checkHttpConnectivity accepts any HTTP status code', async () => {
    const http = require('http');
    const origRequest = http.request;

    http.request = (options, callback) => {
        const mockResponse = {
            statusCode: 404,
            on: () => {}
        };

        setTimeout(() => callback(mockResponse), 0);

        return {
            on: () => {},
            end: () => {}
        };
    };

    const result = await LocalConfigValidator.checkHttpConnectivity('192.168.1.100');

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.statusCode, 404);

    http.request = origRequest;
});

test('LocalConfigValidator#checkHttpConnectivity returns error on connection failure', async () => {
    const http = require('http');
    const origRequest = http.request;

    http.request = (options, callback) => {
        const mockRequest = {
            on: (event, handler) => {
                if (event === 'error') {
                    setTimeout(() => handler(new Error('ECONNREFUSED')), 0);
                }
            },
            end: () => {}
        };

        return mockRequest;
    };

    const result = await LocalConfigValidator.checkHttpConnectivity('192.168.1.100');

    assert.strictEqual(result.success, false);
    assert.ok(result.error.includes('ECONNREFUSED'));

    http.request = origRequest;
});

test('LocalConfigValidator#checkHttpConnectivity returns error on timeout', async () => {
    const http = require('http');
    const origRequest = http.request;

    http.request = (options, callback) => {
        const mockRequest = {
            on: (event, handler) => {
                if (event === 'timeout') {
                    setTimeout(() => handler(), 0);
                }
            },
            destroy: () => {},
            end: () => {}
        };

        return mockRequest;
    };

    const result = await LocalConfigValidator.checkHttpConnectivity('192.168.1.100');

    assert.strictEqual(result.success, false);
    assert.ok(result.error.includes('timeout'));

    http.request = origRequest;
});
