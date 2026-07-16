'use strict';

const ConfigManager = require('./config-manager');
const PlatformAccessoryManager = require('./platform-accessory-manager');
const accessories = require('./accessories');
const airstage = require('./airstage');
const settings = require('./settings');

class Platform {
    accessories = [];
    lanDeviceIds = [];
    airstageCloudClient = null;
    airstageLanClient = null;

    constructor(log, config, api, withSetInterval = true) {
        this.log = log;
        this.config = config;
        this.api = api;

        // Polyfill for Homebridge < 1.8.0
        if (!this.log.success) {
            this.log.success = this.log.info;
        }

        // Initialize platform Airstage clients and accessories
        this._init(withSetInterval);
    }

    _init(withSetInterval) {
        this.Service = this.api.hap.Service;
        this.Characteristic = this.api.hap.Characteristic;

        this.configManager = new ConfigManager(this.config, this.api);
        this.accessoryManager = new PlatformAccessoryManager(this);

        const tokens = this.configManager.getTokens();

        if (this.config.enableCloudControl) {
            this.airstageCloudClient = new airstage.cloud.Client(
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
                const cloudPollingInterval = ((this.config.cloudPollingInterval * 1000) * 60);

                if (cloudPollingInterval > 0) {
                    setInterval(
                        this._refreshAirstageCloudClientCache.bind(this),
                        cloudPollingInterval
                    );
                }

                setInterval(
                    this._refreshAirstageCloudClientTokenOrAuthenticate.bind(this),
                    (50 * 60 * 1000) // 50 minutes
                );
            }
        }

        if (this.config.enableLanControl) {
            this.airstageLanClient = new airstage.lan.Client(
                this.config.lanDevices || [],
                this.config.lanTemperatureScale
            );

            if (withSetInterval) {
                const lanPollingIntervalUnits = this.config.lanPollingIntervalUnits ?? 'm';
                const lanPollingIntervalValue = this.config.lanPollingInterval;

                let lanPollingInterval = 0;

                if (lanPollingIntervalUnits === 'm') {
                    // Minutes
                    lanPollingInterval = (lanPollingIntervalValue * 60 * 1000);
                } else if (lanPollingIntervalUnits === 's') {
                    // Seconds
                    lanPollingInterval = (lanPollingIntervalValue * 1000);
                }

                if (lanPollingInterval > 0) {
                    setInterval(
                        this._refreshAirstageLanClientCache.bind(this),
                        lanPollingInterval
                    );
                }
            }
        }

        this.api.on('didFinishLaunching', this.discoverDevices.bind(this));
    }

    configureAccessory(accessory) {
        this.accessories.push(accessory);
    }

    discoverDevices(callback = null) {
        if (this.config.enableLanControl) {
            this._discoverAirstageLanDevices((function(error) {
                if (error) {
                    if (callback !== null) {
                        return callback(error);
                    }
                }

                if (this.config.enableCloudControl) {
                    this._discoverAirstageCloudDevices((function(error) {
                        if (error) {
                            if (callback !== null) {
                                return callback(error);
                            }
                        }

                        if (callback !== null) {
                            callback(null);
                        }
                    }).bind(this));
                } else {
                    if (callback !== null) {
                        callback(null);
                    }
                }
            }).bind(this));
        } else if (this.config.enableCloudControl) {
            this._discoverAirstageCloudDevices((function(error) {
                if (error) {
                    if (callback !== null) {
                        return callback(error);
                    }
                }

                if (callback !== null) {
                    callback(null);
                }
            }).bind(this));
        } else {
            if (callback !== null) {
                callback(null);
            }
        }
    }

    _discoverAirstageLanDevices(callback = null) {
        this.airstageLanClient.getDevices(null, (function(error, devices) {
            if (error) {
                if (callback !== null) {
                    callback(error);
                }

                return this.log.error('Error when attempting to communicate with Airstage LAN:', error);
            }

            const deviceIds = Object.keys(devices.parameters);
            this.lanDeviceIds = deviceIds;

            this._configureAirstageLanDevices(callback);
        }).bind(this));
    }

    _configureAirstageLanDevices(callback = null) {
        this.airstageLanClient.getDevices(null, (function(error, devices) {
            if (error) {
                if (callback !== null) {
                    callback(error);
                }

                return this.log.error('Error when attempting to communicate with Airstage LAN:', error);
            }

            const deviceIds = Object.keys(devices.parameters);

            deviceIds.forEach(function(deviceId) {
                const deviceParameters = devices.parameters[deviceId];

                this.airstageLanClient.getName(deviceId, (function(error, deviceName) {
                    if (error !== null) {
                        this.log.error('Error when attempting to communicate with Airstage LAN:', error);
                        // Fallback to using the device ID for the display name
                        deviceName = deviceId;
                    }

                    const model = deviceParameters[airstage.constants.PARAMETER_MODEL] || 'Airstage';

                    this._configureAirstageDevice(
                        deviceId,
                        deviceName,
                        model
                    );
                }).bind(this));
            }, this);

            if (callback !== null) {
                callback(null);
            }
        }).bind(this));
    }

    _discoverAirstageCloudDevices(callback = null) {
        this.airstageCloudClient.refreshTokenOrAuthenticate((function(error) {
            if (error) {
                if (callback !== null) {
                    callback(error);
                }

                if (error === 'Invalid access token') {
                    this._unsetAccessTokenInConfig();
                }

                return this.log.error('Error when attempting to authenticate with Airstage Cloud:', error);
            }

            this._updateConfigWithAccessToken();
            this._configureAirstageCloudDevices(callback);
        }).bind(this));
    }

    _updateConfigWithAccessToken() {
        this.configManager.saveTokens(
            this.airstageCloudClient.getAccessToken(),
            this.airstageCloudClient.getAccessTokenExpiry(),
            this.airstageCloudClient.getRefreshToken()
        );
    }

    _unsetAccessTokenInConfig() {
        this.configManager.saveTokens(null, null, null);
    }

    _configureAirstageCloudDevices(callback) {
        this.airstageCloudClient.getUserMetadata((function(error) {
            if (error) {
                if (callback !== null) {
                    callback(error);
                }

                return this.log.error('Error when attempting to communicate with Airstage Cloud:', error);
            }

            this.airstageCloudClient.getDevices(null, (function(error, devices) {
                if (error) {
                    if (callback !== null) {
                        callback(error);
                    }

                    return this.log.error('Error when attempting to communicate with Airstage Cloud:', error);
                }

                const deviceIds = Object.keys(devices.parameters);

                deviceIds.forEach(function(deviceId) {
                    const deviceMetadata = devices.metadata[deviceId];
                    const deviceParameters = devices.parameters[deviceId];
                    const deviceName = deviceMetadata.deviceName;
                    const model = deviceParameters[airstage.constants.PARAMETER_MODEL] || 'Airstage';

                    if (this.lanDeviceIds.includes(deviceId) === false) {
                        this._configureAirstageDevice(
                            deviceId,
                            deviceName,
                            model
                        );
                    }
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
        // Heater Cooler
        if (this.config.enableHeaterCooler) {
            this.accessoryManager.registerHeaterCoolerAccessory(
                deviceId,
                deviceName,
                model
            );
        } else {
            this.accessoryManager.unregisterHeaterCoolerAccessory(
                deviceId,
                deviceName
            );
        }

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

    _refreshAirstageCloudClientTokenOrAuthenticate() {
        this.airstageCloudClient.refreshTokenOrAuthenticate((function(error) {
            if (error) {
                if (error === 'Invalid access token') {
                    this._unsetAccessTokenInConfig();
                }

                return this.log.error('Error when attempting to authenticate with Airstage Cloud:', error);
            }

            this._updateConfigWithAccessToken();

            this.log.debug('Refreshed Airstage Cloud authentication');
        }).bind(this));
    }

    _refreshAirstageCloudClientCache() {
        this.airstageCloudClient.refreshUserMetadataCache(
            (function(error) {
                if (error) {
                    return this.log.error('Error when attempting to communicate with Airstage Cloud:', error);
                }

                this.log.debug('Refreshed Airstage Cloud client user metadata cache');

                this.airstageCloudClient.refreshDeviceCache(
                    (function(error, devices) {
                        if (error) {
                            return this.log.error('Error when attempting to communicate with Airstage Cloud:', error);
                        }

                        this.log.debug('Refreshed Airstage Cloud client device cache');

                        const deviceIds = Object.keys(devices.parameters);

                        deviceIds.forEach(function(deviceId) {
                            this.accessoryManager.refreshAllAccessoryCharacteristics(deviceId);
                        }, this);
                    }).bind(this)
                );
            }).bind(this)
        );
    }

    _refreshAirstageLanClientCache() {
        this.airstageLanClient.refreshDeviceCache(
            (function(error, devices) {
                if (error) {
                    return this.log.error('Error when attempting to communicate with Airstage LAN:', error);
                }

                this.log.debug('Refreshed Airstage LAN client device cache');

                const deviceIds = Object.keys(devices.parameters);

                deviceIds.forEach(function(deviceId) {
                    this.accessoryManager.refreshAllAccessoryCharacteristics(deviceId);
                }, this);
            }).bind(this)
        );
    }
}

module.exports = Platform;
