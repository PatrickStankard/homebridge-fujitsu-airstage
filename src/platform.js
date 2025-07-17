'use strict';

const ConfigManager = require('./config-manager');
const PlatformAccessoryManager = require('./platform-accessory-manager');
const accessories = require('./accessories');
const airstage = require('./airstage');
const settings = require('./settings');

class Platform {
    accessories = [];

    constructor(log, config, api, withSetInterval = true) {
        this.log = log;
        this.config = config;
        this.api = api;

        // Polyfill for Homebridge < 1.8.0
        if (!this.log.success) {
            this.log.success = this.log.info;
        }

        // Initialize platform Airstage client and accessories
        this._init(withSetInterval);
    }

    _init(withSetInterval) {
        this.Service = this.api.hap.Service;
        this.Characteristic = this.api.hap.Characteristic;

        this.configManager = new ConfigManager(this.config, this.api);
        this.accessoryManager = new PlatformAccessoryManager(this);

        let tokens = this.configManager.getTokens();

        this.airstageClient = new airstage.Client(
            this.config.region,
            this.config.country,
            this.config.language,
            this.config.email || null,
            this.config.password || null,
            null,
            null,
            tokens.accessToken || null,
            tokens.accessTokenExpiry || null,
            tokens.refreshToken || null
        );

        if (withSetInterval) {
            setInterval(
                this._refreshAirstageClientCache.bind(this),
                (5 * 60 * 1000) // 5 minutes
            );

            setInterval(
                this._refreshAirstageClientTokenOrAuthenticate.bind(this),
                (50 * 60 * 1000) // 50 minutes
            );
        }

        this.api.on('didFinishLaunching', this.discoverDevices.bind(this));
    }

    configureAccessory(accessory) {
        this.accessories.push(accessory);
    }

    discoverDevices(callback = null) {
        this.airstageClient.refreshTokenOrAuthenticate((function(error) {
            if (error) {
                if (callback !== null) {
                    callback(error);
                }

                if (error === 'Invalid access token') {
                    this._unsetAccessTokenInConfig();
                }

                return this.log.error('Error when attempting to authenticate with Airstage:', error);
            }

            this._updateConfigWithAccessToken();
            this._configureAirstageDevices(callback);
        }).bind(this));
    }

    _updateConfigWithAccessToken() {
        this.configManager.saveTokens(
            this.airstageClient.getAccessToken(),
            this.airstageClient.getAccessTokenExpiry(),
            this.airstageClient.getRefreshToken()
        );
    }

    _unsetAccessTokenInConfig() {
        this.configManager.saveTokens(null, null, null);
    }

    _configureAirstageDevices(callback) {
        this.airstageClient.getUserMetadata((function(error) {
            if (error) {
                if (callback !== null) {
                    callback(error);
                }

                return this.log.error('Error when attempting to communicate with Airstage:', error);
            }

            this.airstageClient.getDevices(null, (function(error, devices) {
                if (error) {
                    if (callback !== null) {
                        callback(error);
                    }

                    return this.log.error('Error when attempting to communicate with Airstage:', error);
                }

                const deviceIds = Object.keys(devices.metadata);

                deviceIds.forEach(function(deviceId) {
                    const deviceMetadata = devices.metadata[deviceId];
                    const deviceParameters = devices.parameters[deviceId];
                    const deviceName = deviceMetadata.deviceName;
                    const model = deviceParameters[airstage.apiv1.constants.PARAMETER_MODEL] || 'Airstage';

                    this._configureAirstageDevice(
                        deviceId,
                        deviceName,
                        model
                    );
                }, this);

                if (callback !== null) {
                    callback(null);
                }
            }).bind(this));
        }).bind(this));
    }

    _configureAirstageDevice(
        deviceId,
        deviceName,
        model
    ) {
        // Thermostat
        if (this.config.enableThermostat) {
            this.accessoryManager.registerThermostatAccessory(
                deviceId,
                deviceName,
                model
            );
        } else {
            this.accessoryManager.unregisterThermostatAccessory(
                deviceId,
                deviceName
            );
        }

        // Fan
        if (this.config.enableFan) {
            this.accessoryManager.registerFanAccessory(
                deviceId,
                deviceName,
                model
            );
        } else {
            this.accessoryManager.unregisterFanAccessory(
                deviceId,
                deviceName
            );
        }

        // Deprecated: the VerticalSlatsAccessory was replaced by the
        // VerticalAirflowDirectionAccessory
        this.accessoryManager.unregisterVerticalSlatsAccessory(
            deviceId,
            deviceName
        );

        // Vertical airflow direction
        if (this.config.enableVerticalAirflowDirection) {
            this.accessoryManager.registerVerticalAirflowDirectionAccessory(
                deviceId,
                deviceName,
                model
            );
        } else {
            this.accessoryManager.unregisterVerticalAirflowDirectionAccessory(
                deviceId,
                deviceName
            );
        }

        // "Auto Fan Speed" switch
        if (this.config.enableAutoFanSpeedSwitch) {
            this.accessoryManager.registerAutoFanSpeedSwitchAccessory(
                deviceId,
                deviceName,
                model
            );
        } else {
            this.accessoryManager.unregisterAutoFanSpeedSwitchAccessory(
                deviceId,
                deviceName
            );
        }

        // "Dry Mode" switch
        if (this.config.enableDryModeSwitch) {
            this.accessoryManager.registerDryModeSwitchAccessory(
                deviceId,
                deviceName,
                model
            );
        } else {
            this.accessoryManager.unregisterDryModeSwitchAccessory(
                deviceId,
                deviceName
            );
        }

        // "Economy" switch
        if (this.config.enableEconomySwitch) {
            this.accessoryManager.registerEconomySwitchAccessory(
                deviceId,
                deviceName,
                model
            );
        } else {
            this.accessoryManager.unregisterEconomySwitchAccessory(
                deviceId,
                deviceName
            );
        }

        // "Energy Saving Fan" switch
        if (this.config.enableEnergySavingFanSwitch) {
            this.accessoryManager.registerEnergySavingFanSwitchAccessory(
                deviceId,
                deviceName,
                model
            );
        } else {
            this.accessoryManager.unregisterEnergySavingFanSwitchAccessory(
                deviceId,
                deviceName
            );
        }

        // "Fan Mode" switch
        if (this.config.enableFanModeSwitch) {
            this.accessoryManager.registerFanModeSwitchAccessory(
                deviceId,
                deviceName,
                model
            );
        } else {
            this.accessoryManager.unregisterFanModeSwitchAccessory(
                deviceId,
                deviceName
            );
        }

        // "Minimum Heat Mode" switch
        if (this.config.enableMinimumHeatModeSwitch) {
            this.accessoryManager.registerMinimumHeatModeSwitchAccessory(
                deviceId,
                deviceName,
                model
            );
        } else {
            this.accessoryManager.unregisterMinimumHeatModeSwitchAccessory(
                deviceId,
                deviceName
            );
        }

        // "Powerful" switch
        if (this.config.enablePowerfulSwitch) {
            this.accessoryManager.registerPowerfulSwitchAccessory(
                deviceId,
                deviceName,
                model
            );
        } else {
            this.accessoryManager.unregisterPowerfulSwitchAccessory(
                deviceId,
                deviceName
            );
        }
    }

    _refreshAirstageClientTokenOrAuthenticate() {
        this.airstageClient.refreshTokenOrAuthenticate((function(error) {
            if (error) {
                if (error === 'Invalid access token') {
                    this._unsetAccessTokenInConfig();
                }

                return this.log.error('Error when attempting to authenticate with Airstage:', error);
            }

            this._updateConfigWithAccessToken();

            this.log.debug('Refreshed Airstage authentication');
        }).bind(this));
    }

    _refreshAirstageClientCache() {
        this.airstageClient.refreshUserMetadataCache(
            (function(error) {
                if (error) {
                    return this.log.error('Error when attempting to communicate with Airstage:', error);
                }

                this.log.debug('Refreshed Airstage client user metadata cache');

                this.airstageClient.refreshDeviceCache(
                    (function(error, devices) {
                        if (error) {
                            return this.log.error('Error when attempting to communicate with Airstage:', error);
                        }

                        this.log.debug('Refreshed Airstage client device cache');

                        const deviceIds = Object.keys(devices.metadata);

                        deviceIds.forEach(function(deviceId) {
                            this.accessoryManager.refreshAllAccessoryCharacteristics(deviceId);
                        }, this);
                    }).bind(this)
                );
            }).bind(this)
        );
    }
}

module.exports = Platform;
