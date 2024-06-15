'use strict';

const ConfigManager = require('./config-manager');
const PlatformAccessoryManager = require('./platform-accessory-manager');
const accessories = require('./accessories');
const airstage = require('./airstage');
const settings = require('./settings');

class Platform {

    accessories = [];

    constructor(log, config, api) {
        this.log = log;
        this.config = config;
        this.api = api;

        // Polyfill for Homebridge < 1.8.0
        if (!this.log.success) {
            this.log.success = this.log.info;
        }

        this.Service = this.api.hap.Service;
        this.Characteristic = this.api.hap.Characteristic;

        this.airstageClient = new airstage.Client(
            this.config.region,
            this.config.country,
            this.config.language,
            this.config.email || null,
            this.config.password || null,
            null,
            null,
            this.config.accessToken || null,
            this.config.accessTokenExpiry || null,
            this.config.refreshToken || null
        );

        this.configManager = new ConfigManager(this.config, this.api);
        this.accessoryManager = new PlatformAccessoryManager(this);

        setInterval(
            this._refreshAirstageClientCache.bind(this),
            (5 * 60 * 1000) // 5 minutes
        );

        setInterval(
            this._refreshAirstageClientToken.bind(this),
            (58 * 60 * 1000) // 58 minutes
        );

        this.api.on('didFinishLaunching', (function() {
            this.discoverDevices();
        }).bind(this));
    }

    configureAccessory(accessory) {
        this.accessories.push(accessory);
    }

    discoverDevices() {
        this.airstageClient.refreshTokenOrAuthenticate((function(error) {
            if (error) {
                return this.log.error('Error when attempting to authenticate with Airbridge:', error);
            }

            this._updateConfigWithAccessToken();

            this.airstageClient.getUserMetadata((function(error) {
                if (error) {
                    return this.log.error('Error when attempting to communicate with Airbridge:', error);
                }

                this.airstageClient.getDevices(null, (function(error, result) {
                    if (error) {
                        return this.log.error('Error when attempting to communicate with Airbridge:', error);
                    }

                    const deviceIds = Object.keys(result.metadata);

                    deviceIds.forEach((function(deviceId) {
                        const deviceMetadata = result.metadata[deviceId];
                        const deviceParameters = result.parameters[deviceId];
                        const deviceName = deviceMetadata.deviceName;
                        const model = deviceParameters[airstage.apiv1.constants.PARAMETER_MODEL];

                        if (this.config.enableThermostat) {
                            this.accessoryManager.registerThermostatAccessory(
                                deviceId,
                                deviceName,
                                model
                            );
                        }

                        if (this.config.enableFan) {
                            this.accessoryManager.registerFanAccessory(
                                deviceId,
                                deviceName,
                                model
                            );
                        }

                        if (this.config.enableVerticalSlats) {
                            this.accessoryManager.registerVerticalSlatsAccessory(
                                deviceId,
                                deviceName,
                                model
                            );
                        }

                        if (this.config.enableDryModeSwitch) {
                            this.accessoryManager.registerDryModeSwitchAccessory(
                                deviceId,
                                deviceName,
                                model
                            );
                        }

                        if (this.config.enableEconomySwitch) {
                            this.accessoryManager.registerEconomySwitchAccessory(
                                deviceId,
                                deviceName,
                                model
                            );
                        }

                        if (this.config.enableEnergySavingFanSwitch) {
                            this.accessoryManager.registerEnergySavingFanSwitchAccessory(
                                deviceId,
                                deviceName,
                                model
                            );
                        }

                        if (this.config.enableFanModeSwitch) {
                            this.accessoryManager.registerFanModeSwitchAccessory(
                                deviceId,
                                deviceName,
                                model
                            );
                        }

                        if (this.config.enablePowerfulSwitch) {
                            this.accessoryManager.registerPowerfulSwitchAccessory(
                                deviceId,
                                deviceName,
                                model
                            );
                        }
                    }).bind(this));
                }).bind(this));
            }).bind(this));
        }).bind(this));
    }

    _updateConfigWithAccessToken() {
        const accessToken = this.airstageClient.getAccessToken();
        const accessTokenExpiry = this.airstageClient.getAccessTokenExpiry();
        const refreshToken = this.airstageClient.getRefreshToken();

        if (accessToken && accessTokenExpiry && refreshToken) {
            this.configManager.updateConfigWithAccessToken(
                accessToken,
                accessTokenExpiry,
                refreshToken
            );

            this.log.debug('Updated config with Airstage client token');
        }
    }

    _refreshAirstageClientToken() {
        this.airstageClient.refreshToken((function(error) {
            if (error) {
                return this.log.error('Error when attempting to refresh Airbridge access token:', error);
            }

            this._updateConfigWithAccessToken();

            this.log.debug('Refreshed Airstage client token');
        }).bind(this));
    }

    _refreshAirstageClientCache() {
        const limit = 100;

        this.airstageClient.resetUserCache();
        this.airstageClient.getUserMetadata(
            (function(error) {
                if (error) {
                    return this.log.error('Error when attempting to communicate with Airbridge:', error);
                }

                this.log.debug('Refreshed Airstage client user metadata cache');
            }).bind(this)
        );

        this.airstageClient.resetDeviceCache();
        this.airstageClient.getDevices(
            limit,
            (function(error) {
                if (error) {
                    return this.log.error('Error when attempting to communicate with Airbridge:', error);
                }

                this.log.debug('Refreshed Airstage client device cache');
            }).bind(this)
        );
    }
}

module.exports = Platform;
