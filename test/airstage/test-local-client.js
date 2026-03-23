'use strict';

const assert = require('node:assert');
const { mock, test } = require('node:test');
const LocalClient = require('../../src/airstage/local/client');
const airstageConstants = require('../../src/airstage/constants');

const mockDevices = [
    {
        name: 'Test Device',
        ipAddress: '192.168.1.100',
        deviceId: 'a0b1c2d3e4f5',  // Should be normalized to uppercase
        deviceSubId: 0
    }
];

test('LocalClient#constructor normalizes device IDs to uppercase', () => {
    const client = new LocalClient(mockDevices);

    assert.strictEqual(client.devices.has('A0B1C2D3E4F5'), true);
    assert.strictEqual(client.devices.has('a0b1c2d3e4f5'), false);

    const device = client.devices.get('A0B1C2D3E4F5');
    assert.strictEqual(device.deviceId, 'A0B1C2D3E4F5');
    assert.strictEqual(device.name, 'Test Device');
    assert.strictEqual(device.ipAddress, '192.168.1.100');
});

test('LocalClient#_encodeTemperature converts celsius to API value', () => {
    const client = new LocalClient(mockDevices);

    assert.strictEqual(client._encodeTemperature(22), '220');
    assert.strictEqual(client._encodeTemperature(18.5), '185');
    assert.strictEqual(client._encodeTemperature(24), '240');
});

test('LocalClient#_decodeTemperature converts API value to celsius', () => {
    const client = new LocalClient(mockDevices);

    assert.strictEqual(client._decodeTemperature('220'), 22);
    assert.strictEqual(client._decodeTemperature('185'), 18.5);
    assert.strictEqual(client._decodeTemperature('240'), 24);
});

test('LocalClient#_decodeFahrenheitToCelsius converts fahrenheit×100 to celsius', () => {
    const client = new LocalClient(mockDevices);

    // 72°F = 22.22°C
    const celsius = client._decodeFahrenheitToCelsius('7200');
    assert.ok(Math.abs(celsius - 22.22) < 0.01);

    // 68°F = 20°C
    const celsius2 = client._decodeFahrenheitToCelsius('6800');
    assert.ok(Math.abs(celsius2 - 20) < 0.01);
});

test('LocalClient#getName returns device name from config', (context, done) => {
    const client = new LocalClient(mockDevices);

    client.getName('A0B1C2D3E4F5', (error, name) => {
        assert.strictEqual(error, null);
        assert.strictEqual(name, 'Test Device');
        done();
    });
});

test('LocalClient#getName returns error for unknown device', (context, done) => {
    const client = new LocalClient(mockDevices);

    client.getName('UNKNOWN', (error, name) => {
        assert.ok(error);
        assert.strictEqual(name, null);
        done();
    });
});

test('LocalClient#getPowerState makes correct request and parses response', (context, done) => {
    const client = new LocalClient(mockDevices);
    const http = require('http');
    const origRequest = http.request;

    let capturedOptions = null;
    let capturedPayload = null;

    http.request = (options, callback) => {
        capturedOptions = options;

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
            write: (data) => { capturedPayload = JSON.parse(data); },
            end: () => {}
        };
    };

    client.getPowerState('A0B1C2D3E4F5', (error, powerState) => {
        assert.strictEqual(error, null);
        assert.strictEqual(powerState, airstageConstants.TOGGLE_ON);

        // Verify request was made correctly
        assert.strictEqual(capturedOptions.hostname, '192.168.1.100');
        assert.strictEqual(capturedOptions.port, 80);
        assert.strictEqual(capturedOptions.path, '/GetParam');
        assert.strictEqual(capturedPayload.device_id, 'A0B1C2D3E4F5');
        assert.strictEqual(capturedPayload.device_sub_id, 0);
        assert.strictEqual(capturedPayload.set_level, '03');
        assert.deepStrictEqual(capturedPayload.list, ['iu_onoff']);

        http.request = origRequest;
        done();
    });
});

test('LocalClient#setPowerState makes correct request', (context, done) => {
    const client = new LocalClient(mockDevices);
    const http = require('http');
    const origRequest = http.request;

    let capturedPayload = null;

    http.request = (options, callback) => {
        const mockResponse = {
            on: (event, handler) => {
                if (event === 'data') {
                    handler('{"result":"OK"}');
                } else if (event === 'end') {
                    handler();
                }
            }
        };

        setTimeout(() => callback(mockResponse), 0);

        return {
            on: () => {},
            write: (data) => { capturedPayload = JSON.parse(data); },
            end: () => {}
        };
    };

    client.setPowerState('A0B1C2D3E4F5', airstageConstants.TOGGLE_ON, (error) => {
        assert.strictEqual(error, null);

        // Verify SetParam request
        assert.strictEqual(capturedPayload.set_level, '02');
        assert.strictEqual(capturedPayload.value.iu_onoff, '1');

        http.request = origRequest;
        done();
    });
});

test('LocalClient#getOperationMode parses mode correctly', (context, done) => {
    const client = new LocalClient(mockDevices);
    const http = require('http');
    const origRequest = http.request;

    http.request = (options, callback) => {
        const mockResponse = {
            on: (event, handler) => {
                if (event === 'data') {
                    handler('{"result":"OK","value":{"iu_op_mode":"1"}}');
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

    client.getOperationMode('A0B1C2D3E4F5', (error, mode) => {
        assert.strictEqual(error, null);
        assert.strictEqual(mode, airstageConstants.OPERATION_MODE_COOL);

        http.request = origRequest;
        done();
    });
});

test('LocalClient#getIndoorTemperature uses fahrenheit×100 decoding', (context, done) => {
    const client = new LocalClient(mockDevices);
    const http = require('http');
    const origRequest = http.request;

    http.request = (options, callback) => {
        const mockResponse = {
            on: (event, handler) => {
                if (event === 'data') {
                    // 72°F = 7200 in API (fahrenheit × 100)
                    handler('{"result":"OK","value":{"iu_indoor_tmp":"7200"}}');
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

    client.getIndoorTemperature('A0B1C2D3E4F5', airstageConstants.TEMPERATURE_SCALE_CELSIUS, (error, temp) => {
        assert.strictEqual(error, null);
        // 72°F = 22.22°C
        assert.ok(Math.abs(temp - 22.22) < 0.01);

        http.request = origRequest;
        done();
    });
});

test('LocalClient#getTargetTemperature uses celsius×10 decoding', (context, done) => {
    const client = new LocalClient(mockDevices);
    const http = require('http');
    const origRequest = http.request;

    http.request = (options, callback) => {
        const mockResponse = {
            on: (event, handler) => {
                if (event === 'data') {
                    handler('{"result":"OK","value":{"iu_set_tmp":"220"}}');
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

    client.getTargetTemperature('A0B1C2D3E4F5', airstageConstants.TEMPERATURE_SCALE_CELSIUS, (error, temp) => {
        assert.strictEqual(error, null);
        assert.strictEqual(temp, 22);

        http.request = origRequest;
        done();
    });
});

test('LocalClient#setTargetTemperature uses celsius×10 encoding', (context, done) => {
    const client = new LocalClient(mockDevices);
    const http = require('http');
    const origRequest = http.request;

    let capturedPayload = null;

    http.request = (options, callback) => {
        const mockResponse = {
            on: (event, handler) => {
                if (event === 'data') {
                    handler('{"result":"OK"}');
                } else if (event === 'end') {
                    handler();
                }
            }
        };

        setTimeout(() => callback(mockResponse), 0);

        return {
            on: () => {},
            write: (data) => { capturedPayload = JSON.parse(data); },
            end: () => {}
        };
    };

    client.setTargetTemperature('A0B1C2D3E4F5', 22, airstageConstants.TEMPERATURE_SCALE_CELSIUS, (error) => {
        assert.strictEqual(error, null);
        assert.strictEqual(capturedPayload.value.iu_set_tmp, '220');

        http.request = origRequest;
        done();
    });
});

test('LocalClient#getFanSpeed parses fan speed correctly', (context, done) => {
    const client = new LocalClient(mockDevices);
    const http = require('http');
    const origRequest = http.request;

    http.request = (options, callback) => {
        const mockResponse = {
            on: (event, handler) => {
                if (event === 'data') {
                    handler('{"result":"OK","value":{"iu_fan_spd":"0"}}');
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

    client.getFanSpeed('A0B1C2D3E4F5', (error, fanSpeed) => {
        assert.strictEqual(error, null);
        assert.strictEqual(fanSpeed, airstageConstants.FAN_SPEED_AUTO);

        http.request = origRequest;
        done();
    });
});

test('LocalClient#_makeRequest handles device not found error', async () => {
    const client = new LocalClient(mockDevices);

    try {
        await client._makeRequest('UNKNOWN', '/GetParam', {});
        assert.fail('Should have thrown error');
    } catch (error) {
        assert.ok(error.message.includes('not found'));
    }
});

test('LocalClient#_makeRequest handles network timeout', async () => {
    const client = new LocalClient(mockDevices);
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
            write: () => {},
            end: () => {}
        };

        return mockRequest;
    };

    try {
        await client._makeRequest('A0B1C2D3E4F5', '/GetParam', {});
        assert.fail('Should have thrown error');
    } catch (error) {
        assert.ok(error.message.includes('timeout'));
    }

    http.request = origRequest;
});

test('LocalClient#_makeRequest handles API error response', async () => {
    const client = new LocalClient(mockDevices);
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

    try {
        await client._makeRequest('A0B1C2D3E4F5', '/GetParam', {});
        assert.fail('Should have thrown error');
    } catch (error) {
        assert.ok(error.message.includes('API Error'));
    }

    http.request = origRequest;
});

test('LocalClient#getDevices returns list of configured devices', (context, done) => {
    const client = new LocalClient(mockDevices);

    client.getDevices((error, devices) => {
        assert.strictEqual(error, null);
        assert.strictEqual(devices.length, 1);
        assert.strictEqual(devices[0].deviceId, 'A0B1C2D3E4F5');
        assert.strictEqual(devices[0].name, 'Test Device');
        assert.strictEqual(devices[0].ipAddress, '192.168.1.100');
        done();
    });
});

test('LocalClient#refreshTokenOrAuthenticate is a no-op for local mode', (context, done) => {
    const client = new LocalClient(mockDevices);

    client.refreshTokenOrAuthenticate((error, result) => {
        assert.strictEqual(error, null);
        assert.strictEqual(result, null);
        done();
    });
});

test('LocalClient#getTemperatureScale returns Celsius by default when no configManager', (context, done) => {
    const client = new LocalClient(mockDevices);

    client.getTemperatureScale((error, scale) => {
        assert.strictEqual(error, null);
        assert.strictEqual(scale, airstageConstants.TEMPERATURE_SCALE_CELSIUS);
        done();
    });
});

test('LocalClient#getTemperatureScale returns stored scale from configManager', (context, done) => {
    const mockConfigManager = {
        getTemperatureScale: mock.fn(() => airstageConstants.TEMPERATURE_SCALE_FAHRENHEIT)
    };

    const client = new LocalClient(mockDevices, null, mockConfigManager);

    client.getTemperatureScale((error, scale) => {
        assert.strictEqual(error, null);
        assert.strictEqual(scale, airstageConstants.TEMPERATURE_SCALE_FAHRENHEIT);
        assert.strictEqual(mockConfigManager.getTemperatureScale.mock.calls.length, 1);
        done();
    });
});

test('LocalClient#getTemperatureScale returns Celsius when configManager returns null', (context, done) => {
    const mockConfigManager = {
        getTemperatureScale: mock.fn(() => null)
    };

    const client = new LocalClient(mockDevices, null, mockConfigManager);

    client.getTemperatureScale((error, scale) => {
        assert.strictEqual(error, null);
        assert.strictEqual(scale, airstageConstants.TEMPERATURE_SCALE_CELSIUS);
        done();
    });
});

test('LocalClient#setTemperatureScale returns error when no configManager', (context, done) => {
    const client = new LocalClient(mockDevices);

    client.setTemperatureScale(airstageConstants.TEMPERATURE_SCALE_FAHRENHEIT, (error, scale) => {
        assert.ok(error);
        assert.strictEqual(error.message, 'ConfigManager not available');
        done();
    });
});

test('LocalClient#setTemperatureScale saves scale for all devices', (context, done) => {
    const mockConfigManager = {
        saveTemperatureScale: mock.fn()
    };

    const multiDevices = [
        { name: 'Device 1', ipAddress: '192.168.1.100', deviceId: 'A0B1C2D3E4F5', deviceSubId: 0 },
        { name: 'Device 2', ipAddress: '192.168.1.101', deviceId: 'F5E4D3C2B1A0', deviceSubId: 0 }
    ];

    const client = new LocalClient(multiDevices, null, mockConfigManager);

    client.setTemperatureScale(airstageConstants.TEMPERATURE_SCALE_FAHRENHEIT, (error, scale) => {
        assert.strictEqual(error, null);
        assert.strictEqual(scale, airstageConstants.TEMPERATURE_SCALE_FAHRENHEIT);
        // Should save for both devices
        assert.strictEqual(mockConfigManager.saveTemperatureScale.mock.calls.length, 2);
        assert.strictEqual(mockConfigManager.saveTemperatureScale.mock.calls[0].arguments[0], 'A0B1C2D3E4F5');
        assert.strictEqual(mockConfigManager.saveTemperatureScale.mock.calls[0].arguments[1], airstageConstants.TEMPERATURE_SCALE_FAHRENHEIT);
        assert.strictEqual(mockConfigManager.saveTemperatureScale.mock.calls[1].arguments[0], 'F5E4D3C2B1A0');
        assert.strictEqual(mockConfigManager.saveTemperatureScale.mock.calls[1].arguments[1], airstageConstants.TEMPERATURE_SCALE_FAHRENHEIT);
        done();
    });
});
