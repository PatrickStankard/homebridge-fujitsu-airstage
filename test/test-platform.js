'use strict';

const assert = require('node:assert');
const { mock, test } = require('node:test');
const hap = require('hap-nodejs');
const mockApi = {
    'hap': {
        'Service': hap.Service,
        'Characteristic': hap.Characteristic,
        'uuid': hap.uuid
    },
    'user': {
        'configPath': mock.fn(() => {
            return '/test/path';
        }),
        'persistPath': mock.fn(() => {
            // Use a temp directory for persistPath in tests
            return '/tmp';
        })
    }
};
const MockHomebridge = require('../src/test/mock-homebridge');
const Platform = require('../src/platform');

const mockHomebridge = new MockHomebridge();

// Inject the mock platformAccessory constructor into mockApi for all Platform tests
mockApi.platformAccessory = mockHomebridge.platform.api.platformAccessory;

// Inject the mock register/unregister/updatePlatformAccessories functions as well
mockApi.registerPlatformAccessories = mockHomebridge.platform.api.registerPlatformAccessories;
mockApi.unregisterPlatformAccessories = mockHomebridge.platform.api.unregisterPlatformAccessories;
mockApi.updatePlatformAccessories = mockHomebridge.platform.api.updatePlatformAccessories;
// Ensure the 'on' event mock is present for event registration
mockApi.on = mockHomebridge.platform.api.on;

const platformConfig = {
    'region': 'us',
    'country': 'United States',
    'language': 'en',
    'email': 'test@example.com',
    'password': 'test1234',
    'accessToken': 'testAccessToken',
    'accessTokenExpiry': '2022-01-01',
    'refreshToken': 'testRefreshToken',
    'rememberEmailAndPassword': true
};

test('Platform#constructor configures classes using platform config', async (context) => {
    const platform = new Platform(
        mockHomebridge.platform.log,
        platformConfig,
        mockApi,
        false // Do not start intervals in constructor
    );
    // Manually trigger event registration (but not intervals)
    await platform._init(false, false); // <-- Do NOT start intervals, only event registration

    assert.strictEqual(mockHomebridge.platform.log.success, mockHomebridge.platform.log.info);
    assert.strictEqual(platform.airstageClient.email, platformConfig.email);
    assert.strictEqual(platform.airstageClient.password, platformConfig.password);
    assert.strictEqual(platform.airstageClient._apiClient.region, platformConfig.region);
    assert.strictEqual(platform.airstageClient._apiClient.country, platformConfig.country);
    assert.strictEqual(platform.airstageClient._apiClient.language, platformConfig.language);
    assert.strictEqual(platform.airstageClient._apiClient.accessToken, platformConfig.accessToken);
    assert.strictEqual(
        platform.airstageClient._apiClient.accessTokenExpiry.toString(),
        new Date(platformConfig.accessTokenExpiry).toString()
    );
    assert.strictEqual(platform.airstageClient._apiClient.refreshToken, platformConfig.refreshToken);
    assert.strictEqual(platform.configManager.config, platformConfig);
    assert.deepStrictEqual(platform.configManager.api.hap, mockApi.hap);
    assert.strictEqual(platform.accessoryManager.platform, platform);
    const onMock = mockHomebridge.platform.api.on.mock;
    assert(onMock.calls.length > 0, 'Expected api.on to be called at least once');
    assert.strictEqual(
        onMock.calls[0].arguments[0],
        'didFinishLaunching'
    );
    assert.strictEqual(
        typeof onMock.calls[0].arguments[1],
        'function'
    );
});

test('Platform#configureAccessory pushes accessory to accessories', (context) => {
    const platformConfig = {
        'region': 'us',
        'country': 'United States',
        'language': 'en',
        'email': 'test@example.com',
        'password': 'test1234'
    };
    const platform = new Platform(
        mockHomebridge.platform.log,
        platformConfig,
        mockApi,
        false
    );

    platform.configureAccessory('foo');

    assert.strictEqual(platform.accessories.length, 1);
    assert.strictEqual(platform.accessories[0], 'foo');
});

test('Platform#discoverDevices when airstageClient.refreshTokenOrAuthenticate returns error', (context, done) => {
    const platformConfig = {
        'region': 'us',
        'country': 'United States',
        'language': 'en',
        'email': 'test@example.com',
        'password': 'test1234'
    };
    const platform = new Platform(
        mockHomebridge.platform.log,
        platformConfig,
        mockApi,
        false
    );
    context.mock.method(
        platform.airstageClient,
        'refreshTokenOrAuthenticate',
        (callback) => {
            callback('refreshTokenOrAuthenticate error');
        }
    );

    platform.discoverDevices(function(error) {
        assert.strictEqual(error, 'refreshTokenOrAuthenticate error');

        mockHomebridge.resetMocks();

        done();
    });
});

test('Platform#discoverDevices updates platform config with access token', (context, done) => {
    const platformConfig = {
        'platform': 'fujitsu-airstage',
        'region': 'us',
        'country': 'United States',
        'language': 'en',
        'email': 'test@example.com',
        'password': 'test1234'
    };
    const platform = new Platform(
        mockHomebridge.platform.log,
        platformConfig,
        mockApi,
        false
    );
    context.mock.method(
        platform.airstageClient,
        'refreshTokenOrAuthenticate',
        (callback) => {
            platform.airstageClient._apiClient.accessToken = 'testAccessToken';
            platform.airstageClient._apiClient.accessTokenExpiry = new Date('2022-01-01');
            platform.airstageClient._apiClient.refreshToken = 'testRefreshToken';

            callback(null);
        }
    );
    context.mock.method(
        platform.airstageClient,
        'getUserMetadata',
        (callback) => {
            callback(null);
        }
    );

    context.mock.method(
        platform.airstageClient,
        'getDevices',
        (limit, callback) => {
            callback(null, {'metadata': {}});
        }
    );
    context.mock.method(
        platform.configManager,
        '_readFileSync',
        (path) => {
            return JSON.stringify({
                'platforms': [platformConfig]
            });
        }
    );
    context.mock.method(
        platform.configManager,
        '_writeFileSync',
        (path, configString) => {
            const config = JSON.parse(configString);
            assert.strictEqual(config.platforms.length, 1);
            const updatedPlatformConfig = config.platforms[0];
            Object.keys(platformConfig).forEach(function(key) {
                assert.strictEqual(platformConfig[key], updatedPlatformConfig[key]);
            });
            assert.strictEqual(updatedPlatformConfig.accessToken, 'testAccessToken');
            assert.strictEqual(updatedPlatformConfig.accessTokenExpiry, '2022-01-01T00:00:00.000Z');
            assert.strictEqual(updatedPlatformConfig.refreshToken, 'testRefreshToken');

            return true;
        }
    );

    platform.discoverDevices(function(error) {
        assert.strictEqual(error, null);

        mockHomebridge.resetMocks();

        done();
    });
});

test('Platform#discoverDevices unsets access token in platform config on "Invalid access token" error', (context, done) => {
    const platformConfig = {
        'platform': 'fujitsu-airstage',
        'region': 'us',
        'country': 'United States',
        'language': 'en',
        'email': null,
        'password': null,
        'accessToken': 'testAccessToken',
        'accessTokenExpiry': new Date('2022-01-01'),
        'refreshToken': 'testRefreshToken'
    };
    const platform = new Platform(
        mockHomebridge.platform.log,
        platformConfig,
        mockApi,
        false
    );
    context.mock.method(
        platform.airstageClient,
        'refreshTokenOrAuthenticate',
        (callback) => {
            callback('Invalid access token');
        }
    );
    context.mock.method(
        platform.configManager,
        '_readFileSync',
        (path) => {
            return JSON.stringify({
                'platforms': [platformConfig]
            });
        }
    );
    context.mock.method(
        platform.configManager,
        '_writeFileSync',
        (path, configString) => {
            const config = JSON.parse(configString);
            assert.strictEqual(config.platforms.length, 1);
            const updatedPlatformConfig = config.platforms[0];
            Object.keys(platformConfig).forEach(function(key) {
                assert.strictEqual(platformConfig[key], updatedPlatformConfig[key]);
            });
            assert.strictEqual(updatedPlatformConfig.accessToken, null);
            assert.strictEqual(updatedPlatformConfig.accessTokenExpiry, null);
            assert.strictEqual(updatedPlatformConfig.refreshToken, null);

            return true;
        }
    );

    platform.discoverDevices(function(error) {
        assert.strictEqual(error, 'Invalid access token');

        mockHomebridge.resetMocks();

        done();
    });
});

test('Platform#discoverDevices registers accessory when enableThermostat is true', (context, done) => {
    const platformConfig = {
        'platform': 'fujitsu-airstage',
        'region': 'us',
        'country': 'United States',
        'language': 'en',
        'email': 'test@example.com',
        'password': 'test1234',
        'enableThermostat': true
    };
    const platform = new Platform(
        mockHomebridge.platform.log,
        platformConfig,
        mockApi,
        false
    );
    context.mock.method(
        platform.airstageClient,
        'refreshTokenOrAuthenticate',
        (callback) => {
            callback(null);
        }
    );
    context.mock.method(
        platform.airstageClient,
        'getUserMetadata',
        (callback) => {
            callback(null);
        }
    );

    context.mock.method(
        platform.airstageClient,
        'getDevices',
        (limit, callback) => {
            callback(null, {
                'metadata': {
                    'testDevice': {
                        'deviceName': 'Test Device'
                    }
                },
                'parameters': {
                    'testDevice': {
                        'iu_model': 'Fujitsu Mini Split'
                    }
                }
            });
        }
    );

    platform.discoverDevices(function(error) {
        assert.strictEqual(error, null);
        assert.strictEqual(platform.accessories.length, 1);
        const accessory = platform.accessories[0];
        assert.strictEqual(accessory.name, 'Test Device Thermostat');

        mockHomebridge.resetMocks();

        done();
    });
});

test('Platform#discoverDevices does not register accessory when enableThermostat is false', (context, done) => {
    const platformConfig = {
        'platform': 'fujitsu-airstage',
        'region': 'us',
        'country': 'United States',
        'language': 'en',
        'email': 'test@example.com',
        'password': 'test1234',
        'enableThermostat': false
    };
    const platform = new Platform(
        mockHomebridge.platform.log,
        platformConfig,
        mockApi,
        false
    );
    context.mock.method(
        platform.airstageClient,
        'refreshTokenOrAuthenticate',
        (callback) => {
            callback(null);
        }
    );
    context.mock.method(
        platform.airstageClient,
        'getUserMetadata',
        (callback) => {
            callback(null);
        }
    );

    context.mock.method(
        platform.airstageClient,
        'getDevices',
        (limit, callback) => {
            callback(null, {
                'metadata': {
                    'testDevice': {
                        'deviceName': 'Test Device'
                    }
                },
                'parameters': {
                    'testDevice': {
                        'iu_model': 'Fujitsu Mini Split'
                    }
                }
            });
        }
    );

    platform.discoverDevices(function(error) {
        assert.strictEqual(error, null);
        assert.strictEqual(platform.accessories.length, 0);

        mockHomebridge.resetMocks();

        done();
    });
});

test('Platform#discoverDevices registers accessory when enableFan is true', (context, done) => {
    const platformConfig = {
        'platform': 'fujitsu-airstage',
        'region': 'us',
        'country': 'United States',
        'language': 'en',
        'email': 'test@example.com',
        'password': 'test1234',
        'enableFan': true
    };
    const platform = new Platform(
        mockHomebridge.platform.log,
        platformConfig,
        mockApi,
        false
    );
    context.mock.method(
        platform.airstageClient,
        'refreshTokenOrAuthenticate',
        (callback) => {
            callback(null);
        }
    );
    context.mock.method(
        platform.airstageClient,
        'getUserMetadata',
        (callback) => {
            callback(null);
        }
    );

    context.mock.method(
        platform.airstageClient,
        'getDevices',
        (limit, callback) => {
            callback(null, {
                'metadata': {
                    'testDevice': {
                        'deviceName': 'Test Device'
                    }
                },
                'parameters': {
                    'testDevice': {
                        'iu_model': 'Fujitsu Mini Split'
                    }
                }
            });
        }
    );

    platform.discoverDevices(function(error) {
        assert.strictEqual(error, null);
        assert.strictEqual(platform.accessories.length, 1);
        const accessory = platform.accessories[0];
        assert.strictEqual(accessory.name, 'Test Device Fan');

        mockHomebridge.resetMocks();

        done();
    });
});

test('Platform#discoverDevices does not register accessory when enableFan is false', (context, done) => {
    const platformConfig = {
        'platform': 'fujitsu-airstage',
        'region': 'us',
        'country': 'United States',
        'language': 'en',
        'email': 'test@example.com',
        'password': 'test1234',
        'enableFan': false
    };
    const platform = new Platform(
        mockHomebridge.platform.log,
        platformConfig,
        mockApi,
        false
    );
    context.mock.method(
        platform.airstageClient,
        'refreshTokenOrAuthenticate',
        (callback) => {
            callback(null);
        }
    );
    context.mock.method(
        platform.airstageClient,
        'getUserMetadata',
        (callback) => {
            callback(null);
        }
    );

    context.mock.method(
        platform.airstageClient,
        'getDevices',
        (limit, callback) => {
            callback(null, {
                'metadata': {
                    'testDevice': {
                        'deviceName': 'Test Device'
                    }
                },
                'parameters': {
                    'testDevice': {
                        'iu_model': 'Fujitsu Mini Split'
                    }
                }
            });
        }
    );

    platform.discoverDevices(function(error) {
        assert.strictEqual(error, null);
        assert.strictEqual(platform.accessories.length, 0);

        mockHomebridge.resetMocks();

        done();
    });
});

test('Platform#discoverDevices registers accessory when enableVerticalAirflowDirection is true', (context, done) => {
    const platformConfig = {
        'platform': 'fujitsu-airstage',
        'region': 'us',
        'country': 'United States',
        'language': 'en',
        'email': 'test@example.com',
        'password': 'test1234',
        'enableVerticalAirflowDirection': true
    };
    const platform = new Platform(
        mockHomebridge.platform.log,
        platformConfig,
        mockApi,
        false
    );
    context.mock.method(
        platform.airstageClient,
        'refreshTokenOrAuthenticate',
        (callback) => {
            callback(null);
        }
    );
    context.mock.method(
        platform.airstageClient,
        'getUserMetadata',
        (callback) => {
            callback(null);
        }
    );

    context.mock.method(
        platform.airstageClient,
        'getDevices',
        (limit, callback) => {
            callback(null, {
                'metadata': {
                    'testDevice': {
                        'deviceName': 'Test Device'
                    }
                },
                'parameters': {
                    'testDevice': {
                        'iu_model': 'Fujitsu Mini Split'
                    }
                }
            });
        }
    );

    platform.discoverDevices(function(error) {
        assert.strictEqual(error, null);
        assert.strictEqual(platform.accessories.length, 1);
        const accessory = platform.accessories[0];
        assert.strictEqual(accessory.name, 'Test Device Vertical Airflow Direction');

        mockHomebridge.resetMocks();

        done();
    });
});

test('Platform#discoverDevices does not register accessory when enableVerticalAirflowDirection is false', (context, done) => {
    const platformConfig = {
        'platform': 'fujitsu-airstage',
        'region': 'us',
        'country': 'United States',
        'language': 'en',
        'email': 'test@example.com',
        'password': 'test1234',
        'enableVerticalAirflowDirection': false
    };
    const platform = new Platform(
        mockHomebridge.platform.log,
        platformConfig,
        mockApi,
        false
    );
    context.mock.method(
        platform.airstageClient,
        'refreshTokenOrAuthenticate',
        (callback) => {
            callback(null);
        }
    );
    context.mock.method(
        platform.airstageClient,
        'getUserMetadata',
        (callback) => {
            callback(null);
        }
    );

    context.mock.method(
        platform.airstageClient,
        'getDevices',
        (limit, callback) => {
            callback(null, {
                'metadata': {
                    'testDevice': {
                        'deviceName': 'Test Device'
                    }
                },
                'parameters': {
                    'testDevice': {
                        'iu_model': 'Fujitsu Mini Split'
                    }
                }
            });
        }
    );

    platform.discoverDevices(function(error) {
        assert.strictEqual(error, null);
        assert.strictEqual(platform.accessories.length, 0);

        mockHomebridge.resetMocks();

        done();
    });
});

test('Platform#discoverDevices registers accessory when enableDryModeSwitch is true', (context, done) => {
    const platformConfig = {
        'platform': 'fujitsu-airstage',
        'region': 'us',
        'country': 'United States',
        'language': 'en',
        'email': 'test@example.com',
        'password': 'test1234',
        'enableDryModeSwitch': true
    };
    const platform = new Platform(
        mockHomebridge.platform.log,
        platformConfig,
        mockApi,
        false
    );
    context.mock.method(
        platform.airstageClient,
        'refreshTokenOrAuthenticate',
        (callback) => {
            callback(null);
        }
    );
    context.mock.method(
        platform.airstageClient,
        'getUserMetadata',
        (callback) => {
            callback(null);
        }
    );

    context.mock.method(
        platform.airstageClient,
        'getDevices',
        (limit, callback) => {
            callback(null, {
                'metadata': {
                    'testDevice': {
                        'deviceName': 'Test Device'
                    }
                },
                'parameters': {
                    'testDevice': {
                        'iu_model': 'Fujitsu Mini Split'
                    }
                }
            });
        }
    );

    platform.discoverDevices(function(error) {
        assert.strictEqual(error, null);
        assert.strictEqual(platform.accessories.length, 1);
        const accessory = platform.accessories[0];
        assert.strictEqual(accessory.name, 'Test Device Dry Mode Switch');

        mockHomebridge.resetMocks();

        done();
    });
});

test('Platform#discoverDevices does not register accessory when enableDryModeSwitch is false', (context, done) => {
    const platformConfig = {
        'platform': 'fujitsu-airstage',
        'region': 'us',
        'country': 'United States',
        'language': 'en',
        'email': 'test@example.com',
        'password': 'test1234',
        'enableDryModeSwitch': false
    };
    const platform = new Platform(
        mockHomebridge.platform.log,
        platformConfig,
        mockApi,
        false
    );
    context.mock.method(
        platform.airstageClient,
        'refreshTokenOrAuthenticate',
        (callback) => {
            callback(null);
        }
    );
    context.mock.method(
        platform.airstageClient,
        'getUserMetadata',
        (callback) => {
            callback(null);
        }
    );

    context.mock.method(
        platform.airstageClient,
        'getDevices',
        (limit, callback) => {
            callback(null, {
                'metadata': {
                    'testDevice': {
                        'deviceName': 'Test Device'
                    }
                },
                'parameters': {
                    'testDevice': {
                        'iu_model': 'Fujitsu Mini Split'
                    }
                }
            });
        }
    );

    platform.discoverDevices(function(error) {
        assert.strictEqual(error, null);
        assert.strictEqual(platform.accessories.length, 0);

        mockHomebridge.resetMocks();

        done();
    });
});

test('Platform#discoverDevices registers accessory when enableEconomySwitch is true', (context, done) => {
    const platformConfig = {
        'platform': 'fujitsu-airstage',
        'region': 'us',
        'country': 'United States',
        'language': 'en',
        'email': 'test@example.com',
        'password': 'test1234',
        'enableEconomySwitch': true
    };
    const platform = new Platform(
        mockHomebridge.platform.log,
        platformConfig,
        mockApi,
        false
    );
    context.mock.method(
        platform.airstageClient,
        'refreshTokenOrAuthenticate',
        (callback) => {
            callback(null);
        }
    );
    context.mock.method(
        platform.airstageClient,
        'getUserMetadata',
        (callback) => {
            callback(null);
        }
    );

    context.mock.method(
        platform.airstageClient,
        'getDevices',
        (limit, callback) => {
            callback(null, {
                'metadata': {
                    'testDevice': {
                        'deviceName': 'Test Device'
                    }
                },
                'parameters': {
                    'testDevice': {
                        'iu_model': 'Fujitsu Mini Split'
                    }
                }
            });
        }
    );

    platform.discoverDevices(function(error) {
        assert.strictEqual(error, null);
        assert.strictEqual(platform.accessories.length, 1);
        const accessory = platform.accessories[0];
        assert.strictEqual(accessory.name, 'Test Device Economy Switch');

        mockHomebridge.resetMocks();

        done();
    });
});

test('Platform#discoverDevices does not register accessory when enableEconomySwitch is false', (context, done) => {
    const platformConfig = {
        'platform': 'fujitsu-airstage',
        'region': 'us',
        'country': 'United States',
        'language': 'en',
        'email': 'test@example.com',
        'password': 'test1234',
        'enableEconomySwitch': false
    };
    const platform = new Platform(
        mockHomebridge.platform.log,
        platformConfig,
        mockApi,
        false
    );
    context.mock.method(
        platform.airstageClient,
        'refreshTokenOrAuthenticate',
        (callback) => {
            callback(null);
        }
    );
    context.mock.method(
        platform.airstageClient,
        'getUserMetadata',
        (callback) => {
            callback(null);
        }
    );

    context.mock.method(
        platform.airstageClient,
        'getDevices',
        (limit, callback) => {
            callback(null, {
                'metadata': {
                    'testDevice': {
                        'deviceName': 'Test Device'
                    }
                },
                'parameters': {
                    'testDevice': {
                        'iu_model': 'Fujitsu Mini Split'
                    }
                }
            });
        }
    );

    platform.discoverDevices(function(error) {
        assert.strictEqual(error, null);
        assert.strictEqual(platform.accessories.length, 0);

        mockHomebridge.resetMocks();

        done();
    });
});

test('Platform#discoverDevices registers accessory when enableEnergySavingFanSwitch is true', (context, done) => {
    const platformConfig = {
        'platform': 'fujitsu-airstage',
        'region': 'us',
        'country': 'United States',
        'language': 'en',
        'email': 'test@example.com',
        'password': 'test1234',
        'enableEnergySavingFanSwitch': true
    };
    const platform = new Platform(
        mockHomebridge.platform.log,
        platformConfig,
        mockApi,
        false
    );
    context.mock.method(
        platform.airstageClient,
        'refreshTokenOrAuthenticate',
        (callback) => {
            callback(null);
        }
    );
    context.mock.method(
        platform.airstageClient,
        'getUserMetadata',
        (callback) => {
            callback(null);
        }
    );

    context.mock.method(
        platform.airstageClient,
        'getDevices',
        (limit, callback) => {
            callback(null, {
                'metadata': {
                    'testDevice': {
                        'deviceName': 'Test Device'
                    }
                },
                'parameters': {
                    'testDevice': {
                        'iu_model': 'Fujitsu Mini Split'
                    }
                }
            });
        }
    );

    platform.discoverDevices(function(error) {
        assert.strictEqual(error, null);
        assert.strictEqual(platform.accessories.length, 1);
        const accessory = platform.accessories[0];
        assert.strictEqual(accessory.name, 'Test Device Energy Saving Fan Switch');

        mockHomebridge.resetMocks();

        done();
    });
});

test('Platform#discoverDevices does not register accessory when enableEnergySavingFanSwitch is false', (context, done) => {
    const platformConfig = {
        'platform': 'fujitsu-airstage',
        'region': 'us',
        'country': 'United States',
        'language': 'en',
        'email': 'test@example.com',
        'password': 'test1234',
        'enableEnergySavingFanSwitch': false
    };
    const platform = new Platform(
        mockHomebridge.platform.log,
        platformConfig,
        mockApi,
        false
    );
    context.mock.method(
        platform.airstageClient,
        'refreshTokenOrAuthenticate',
        (callback) => {
            callback(null);
        }
    );
    context.mock.method(
        platform.airstageClient,
        'getUserMetadata',
        (callback) => {
            callback(null);
        }
    );

    context.mock.method(
        platform.airstageClient,
        'getDevices',
        (limit, callback) => {
            callback(null, {
                'metadata': {
                    'testDevice': {
                        'deviceName': 'Test Device'
                    }
                },
                'parameters': {
                    'testDevice': {
                        'iu_model': 'Fujitsu Mini Split'
                    }
                }
            });
        }
    );

    platform.discoverDevices(function(error) {
        assert.strictEqual(error, null);
        assert.strictEqual(platform.accessories.length, 0);

        mockHomebridge.resetMocks();

        done();
    });
});

test('Platform#discoverDevices registers accessory when enableFanModeSwitch is true', (context, done) => {
    const platformConfig = {
        'platform': 'fujitsu-airstage',
        'region': 'us',
        'country': 'United States',
        'language': 'en',
        'email': 'test@example.com',
        'password': 'test1234',
        'enableFanModeSwitch': true
    };
    const platform = new Platform(
        mockHomebridge.platform.log,
        platformConfig,
        mockApi,
        false
    );
    context.mock.method(
        platform.airstageClient,
        'refreshTokenOrAuthenticate',
        (callback) => {
            callback(null);
        }
    );
    context.mock.method(
        platform.airstageClient,
        'getUserMetadata',
        (callback) => {
            callback(null);
        }
    );

    context.mock.method(
        platform.airstageClient,
        'getDevices',
        (limit, callback) => {
            callback(null, {
                'metadata': {
                    'testDevice': {
                        'deviceName': 'Test Device'
                    }
                },
                'parameters': {
                    'testDevice': {
                        'iu_model': 'Fujitsu Mini Split'
                    }
                }
            });
        }
    );

    platform.discoverDevices(function(error) {
        assert.strictEqual(error, null);
        assert.strictEqual(platform.accessories.length, 1);
        const accessory = platform.accessories[0];
        assert.strictEqual(accessory.name, 'Test Device Fan Mode Switch');

        mockHomebridge.resetMocks();

        done();
    });
});

test('Platform#discoverDevices does not register accessory when enableFanModeSwitch is false', (context, done) => {
    const platformConfig = {
        'platform': 'fujitsu-airstage',
        'region': 'us',
        'country': 'United States',
        'language': 'en',
        'email': 'test@example.com',
        'password': 'test1234',
        'enableFanModeSwitch': false
    };
    const platform = new Platform(
        mockHomebridge.platform.log,
        platformConfig,
        mockApi,
        false
    );
    context.mock.method(
        platform.airstageClient,
        'refreshTokenOrAuthenticate',
        (callback) => {
            callback(null);
        }
    );
    context.mock.method(
        platform.airstageClient,
        'getUserMetadata',
        (callback) => {
            callback(null);
        }
    );

    context.mock.method(
        platform.airstageClient,
        'getDevices',
        (limit, callback) => {
            callback(null, {
                'metadata': {
                    'testDevice': {
                        'deviceName': 'Test Device'
                    }
                },
                'parameters': {
                    'testDevice': {
                        'iu_model': 'Fujitsu Mini Split'
                    }
                }
            });
        }
    );

    platform.discoverDevices(function(error) {
        assert.strictEqual(error, null);
        assert.strictEqual(platform.accessories.length, 0);

        mockHomebridge.resetMocks();

        done();
    });
});

test('Platform#discoverDevices registers accessory when enableMinimumHeatModeSwitch is true', (context, done) => {
    const platformConfig = {
        'platform': 'fujitsu-airstage',
        'region': 'us',
        'country': 'United States',
        'language': 'en',
        'email': 'test@example.com',
        'password': 'test1234',
        'enableMinimumHeatModeSwitch': true
    };
    const platform = new Platform(
        mockHomebridge.platform.log,
        platformConfig,
        mockApi,
        false
    );
    context.mock.method(
        platform.airstageClient,
        'refreshTokenOrAuthenticate',
        (callback) => {
            callback(null);
        }
    );
    context.mock.method(
        platform.airstageClient,
        'getUserMetadata',
        (callback) => {
            callback(null);
        }
    );

    context.mock.method(
        platform.airstageClient,
        'getDevices',
        (limit, callback) => {
            callback(null, {
                'metadata': {
                    'testDevice': {
                        'deviceName': 'Test Device'
                    }
                },
                'parameters': {
                    'testDevice': {
                        'iu_model': 'Fujitsu Mini Split'
                    }
                }
            });
        }
    );

    platform.discoverDevices(function(error) {
        assert.strictEqual(error, null);
        assert.strictEqual(platform.accessories.length, 1);
        const accessory = platform.accessories[0];
        assert.strictEqual(accessory.name, 'Test Device Minimum Heat Mode Switch');

        mockHomebridge.resetMocks();

        done();
    });
});

test('Platform#discoverDevices does not register accessory when enableMinimumHeatModeSwitch is false', (context, done) => {
    const platformConfig = {
        'platform': 'fujitsu-airstage',
        'region': 'us',
        'country': 'United States',
        'language': 'en',
        'email': 'test@example.com',
        'password': 'test1234',
        'enableMinimumHeatModeSwitch': false
    };
    const platform = new Platform(
        mockHomebridge.platform.log,
        platformConfig,
        mockApi,
        false
    );
    context.mock.method(
        platform.airstageClient,
        'refreshTokenOrAuthenticate',
        (callback) => {
            callback(null);
        }
    );
    context.mock.method(
        platform.airstageClient,
        'getUserMetadata',
        (callback) => {
            callback(null);
        }
    );

    context.mock.method(
        platform.airstageClient,
        'getDevices',
        (limit, callback) => {
            callback(null, {
                'metadata': {
                    'testDevice': {
                        'deviceName': 'Test Device'
                    }
                },
                'parameters': {
                    'testDevice': {
                        'iu_model': 'Fujitsu Mini Split'
                    }
                }
            });
        }
    );

    platform.discoverDevices(function(error) {
        assert.strictEqual(error, null);
        assert.strictEqual(platform.accessories.length, 0);

        mockHomebridge.resetMocks();

        done();
    });
});

test('Platform#discoverDevices registers accessory when enablePowerfulSwitch is true', (context, done) => {
    const platformConfig = {
        'platform': 'fujitsu-airstage',
        'region': 'us',
        'country': 'United States',
        'language': 'en',
        'email': 'test@example.com',
        'password': 'test1234',
        'enablePowerfulSwitch': true
    };
    const platform = new Platform(
        mockHomebridge.platform.log,
        platformConfig,
        mockApi,
        false
    );
    context.mock.method(
        platform.airstageClient,
        'refreshTokenOrAuthenticate',
        (callback) => {
            callback(null);
        }
    );
    context.mock.method(
        platform.airstageClient,
        'getUserMetadata',
        (callback) => {
            callback(null);
        }
    );

    context.mock.method(
        platform.airstageClient,
        'getDevices',
        (limit, callback) => {
            callback(null, {
                'metadata': {
                    'testDevice': {
                        'deviceName': 'Test Device'
                    }
                },
                'parameters': {
                    'testDevice': {
                        'iu_model': 'Fujitsu Mini Split'
                    }
                }
            });
        }
    );

    platform.discoverDevices(function(error) {
        assert.strictEqual(error, null);
        assert.strictEqual(platform.accessories.length, 1);
        const accessory = platform.accessories[0];
        assert.strictEqual(accessory.name, 'Test Device Powerful Switch');

        mockHomebridge.resetMocks();

        done();
    });
});

test('Platform#discoverDevices does not register accessory when enablePowerfulSwitch is false', (context, done) => {
    const platformConfig = {
        'platform': 'fujitsu-airstage',
        'region': 'us',
        'country': 'United States',
        'language': 'en',
        'email': 'test@example.com',
        'password': 'test1234',
        'enablePowerfulSwitch': false
    };
    const platform = new Platform(
        mockHomebridge.platform.log,
        platformConfig,
        mockApi,
        false
    );
    context.mock.method(
        platform.airstageClient,
        'refreshTokenOrAuthenticate',
        (callback) => {
            callback(null);
        }
    );
    context.mock.method(
        platform.airstageClient,
        'getUserMetadata',
        (callback) => {
            callback(null);
        }
    );

    context.mock.method(
        platform.airstageClient,
        'getDevices',
        (limit, callback) => {
            callback(null, {
                'metadata': {
                    'testDevice': {
                        'deviceName': 'Test Device'
                    }
                },
                'parameters': {
                    'testDevice': {
                        'iu_model': 'Fujitsu Mini Split'
                    }
                }
            });
        }
    );

    platform.discoverDevices(function(error) {
        assert.strictEqual(error, null);
        assert.strictEqual(platform.accessories.length, 0);

        mockHomebridge.resetMocks();

        done();
    });
});

test('Platform#_refreshAirstageClientToken logs error', (context) => {
    const platformConfig = { region: 'us', country: 'US', language: 'en', email: 'a', password: 'b' };
    const platform = new Platform(mockHomebridge.platform.log, platformConfig, mockApi, false);
    platform.airstageClient.refreshToken = (cb) => cb('fail');
    let errorLogged = false;
    platform.log.error = () => { errorLogged = true; };
    platform._refreshAirstageClientToken();
    assert.strictEqual(errorLogged, true);
});

test('Platform#_refreshAirstageClientToken logs debug on success', (context) => {
    const platformConfig = { region: 'us', country: 'US', language: 'en', email: 'a', password: 'b' };
    const platform = new Platform(mockHomebridge.platform.log, platformConfig, mockApi, false);
    platform.airstageClient.refreshToken = (cb) => cb(null);
    let debugLogged = false;
    platform.log.debug = () => { debugLogged = true; };
    platform._refreshAirstageClientToken();
    assert.strictEqual(debugLogged, true);
});

test('Platform#_refreshAirstageClientCache logs error on user metadata', (context) => {
    const platformConfig = { region: 'us', country: 'US', language: 'en', email: 'a', password: 'b' };
    const platform = new Platform(mockHomebridge.platform.log, platformConfig, mockApi, false);
    platform.airstageClient.refreshUserMetadataCache = (cb) => cb('fail');
    let errorLogged = false;
    platform.log.error = () => { errorLogged = true; };
    platform._refreshAirstageClientCache();
    assert.strictEqual(errorLogged, true);
});

test('Platform#_refreshAirstageClientCache logs error on device cache', (context) => {
    const platformConfig = { region: 'us', country: 'US', language: 'en', email: 'a', password: 'b' };
    const platform = new Platform(mockHomebridge.platform.log, platformConfig, mockApi, false);
    platform.airstageClient.refreshUserMetadataCache = (cb) => cb(null);
    platform.airstageClient.refreshDeviceCache = (cb) => cb('fail');
    let errorLogged = false;
    platform.log.error = () => { errorLogged = true; };
    platform._refreshAirstageClientCache();
    assert.strictEqual(errorLogged, true);
});

test('Platform#_refreshAirstageClientCache logs debug on success', (context) => {
    const platformConfig = { region: 'us', country: 'US', language: 'en', email: 'a', password: 'b' };
    const platform = new Platform(mockHomebridge.platform.log, platformConfig, mockApi, false);
    platform.airstageClient.refreshUserMetadataCache = (cb) => cb(null);
    platform.airstageClient.refreshDeviceCache = (cb) => cb(null, { metadata: {} });
    let debugLogged = false;
    platform.log.debug = () => { debugLogged = true; };
    platform._refreshAirstageClientCache();
    assert.strictEqual(debugLogged, true);
});

test('Platform#constructor uses async path if storage API present', async () => {
    const platformConfig = { region: 'us', country: 'US', language: 'en', email: 'a', password: 'b' };
    const api = { ...mockApi, storage: { getItem: () => null }, hap: mockApi.hap };
    const platform = new Platform(mockHomebridge.platform.log, platformConfig, api, false);
    // Should not throw, and airstageClient should be set after _init
    await platform._init(false, true);
    assert(platform.airstageClient);
});

test('Platform#_configureAirstageDevices calls callback on error', (context, done) => {
    const platformConfig = { region: 'us', country: 'US', language: 'en', email: 'a', password: 'b' };
    const platform = new Platform(mockHomebridge.platform.log, platformConfig, mockApi, false);
    platform.airstageClient.getUserMetadata = (cb) => cb('fail');
    platform._configureAirstageDevices((err) => {
        assert.strictEqual(err, 'fail');
        done();
    });
});

test('Platform#_configureAirstageDevices calls callback on getDevices error', (context, done) => {
    const platformConfig = { region: 'us', country: 'US', language: 'en', email: 'a', password: 'b' };
    const platform = new Platform(mockHomebridge.platform.log, platformConfig, mockApi, false);
    platform.airstageClient.getUserMetadata = (cb) => cb(null);
    platform.airstageClient.getDevices = (limit, cb) => cb('fail');
    platform._configureAirstageDevices((err) => {
        assert.strictEqual(err, 'fail');
        done();
    });
});
