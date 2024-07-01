'use strict';

const assert = require('node:assert');
const { mock, test } = require('node:test');
const hap = require('hap-nodejs');
const MockHomebridge = require('../src/test/mock-homebridge');
const Platform = require('../src/platform');

const mockHomebridge = new MockHomebridge();

test('Platform#constructor configures classes using platform config', (context) => {
    const platformConfig = {
        'region': 'us',
        'country': 'United States',
        'language': 'en',
        'email': 'test@example.com',
        'password': 'test1234',
        'accessToken': 'testAccessToken',
        'accessTokenExpiry': '2022-01-01',
        'refreshToken': 'testRefreshToken'
    };
    const platform = new Platform(
        mockHomebridge.platform.log,
        platformConfig,
        mockHomebridge.platform.api,
        false
    );

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
    assert.strictEqual(platform.configManager.api, mockHomebridge.platform.api);
    assert.strictEqual(platform.accessoryManager.platform, platform);
    assert.strictEqual(mockHomebridge.platform.api.on.mock.calls.length, 1);
    assert.strictEqual(
        mockHomebridge.platform.api.on.mock.calls[0].arguments[0],
        'didFinishLaunching'
    );
    assert.strictEqual(
        mockHomebridge.platform.api.on.mock.calls[0].arguments[1].name,
        platform.discoverDevices.bind(platform).name
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
        mockHomebridge.platform.api,
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
        mockHomebridge.platform.api,
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
        mockHomebridge.platform.api,
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
        mockHomebridge.platform.api,
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
        mockHomebridge.platform.api,
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
        mockHomebridge.platform.api,
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
        mockHomebridge.platform.api,
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
        mockHomebridge.platform.api,
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
        mockHomebridge.platform.api,
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
        mockHomebridge.platform.api,
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
        mockHomebridge.platform.api,
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
        mockHomebridge.platform.api,
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
        mockHomebridge.platform.api,
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
        mockHomebridge.platform.api,
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
        mockHomebridge.platform.api,
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
        mockHomebridge.platform.api,
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
        mockHomebridge.platform.api,
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
        mockHomebridge.platform.api,
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
        mockHomebridge.platform.api,
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
        mockHomebridge.platform.api,
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
        mockHomebridge.platform.api,
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
