'use strict';

const ConfigManager = require('./config-manager');
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
        this.airstageClient.authenticate((function(error) {
            if (error) {
                throw new this.api.hap.HapStatusError(
                    this.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE
                );
            }

            this._updateConfigWithAccessToken();

            this.airstageClient.getUserMetadata((function(error) {
                if (error) {
                    throw new this.api.hap.HapStatusError(
                        this.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE
                    );
                }

                this.airstageClient.getDevices(null, (function(error, result) {
                    if (error) {
                        throw new this.api.hap.HapStatusError(
                            this.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE
                        );
                    }

                    const deviceIds = Object.keys(result.metadata);

                    deviceIds.forEach((function(deviceId) {
                        const deviceMetadata = result.metadata[deviceId];
                        const deviceParameters = result.parameters[deviceId];
                        const deviceName = deviceMetadata.deviceName;
                        const model = deviceParameters[airstage.apiv1.constants.PARAMETER_MODEL];

                        if (this.config.enableThermostat) {
                            this._registerThermostat(deviceId, deviceName, model);
                        }

                        if (this.config.enableFan) {
                            this._registerFan(deviceId, deviceName, model);
                        }

                        if (this.config.enableVerticalSlats) {
                            this._registerVerticalSlatsAccessory(deviceId, deviceName, model);
                        }

                        if (this.config.enableDryModeSwitch) {
                            this._registerDryModeSwitch(deviceId, deviceName, model);
                        }

                        if (this.config.enableEconomySwitch) {
                            this._registerEconomySwitch(deviceId, deviceName, model);
                        }

                        if (this.config.enableEnergySavingFanSwitch) {
                            this._registerEnergySavingFanSwitch(deviceId, deviceName, model);
                        }

                        if (this.config.enableFanModeSwitch) {
                            this._registerFanModeSwitch(deviceId, deviceName, model);
                        }

                        if (this.config.enablePowerfulSwitch) {
                            this._registerPowerfulSwitch(deviceId, deviceName, model);
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

    _registerThermostat(deviceId, deviceName, model) {
        const uuid = this.api.hap.uuid.generate(deviceId + '-thermostat');
        const existingAccessory = this.accessories.find(
            accessory => accessory.UUID === uuid
        );

        if (existingAccessory) {
            this.log.info('Restoring existing accessory from cache:', existingAccessory.displayName);

            existingAccessory.context.airstageClient = this.airstageClient;
            existingAccessory.context.deviceId = deviceId;
            existingAccessory.context.model = model;

            this.api.updatePlatformAccessories([existingAccessory]);

            new accessories.ThermostatAccessory(this, existingAccessory);
        } else {
            const accessory = new this.api.platformAccessory(
                deviceName + ' Thermostat',
                uuid
            );

            this.log.info('Adding new accessory:', accessory.displayName);

            accessory.context.airstageClient = this.airstageClient;
            accessory.context.deviceId = deviceId;
            accessory.context.model = model;

            new accessories.ThermostatAccessory(this, accessory);

            this.api.registerPlatformAccessories(
                settings.PLUGIN_NAME,
                settings.PLATFORM_NAME,
                [accessory]
            );
        }
    }

    _registerFan(deviceId, deviceName, model) {
        const uuid = this.api.hap.uuid.generate(deviceId + '-fan');
        const existingAccessory = this.accessories.find(
            accessory => accessory.UUID === uuid
        );

        if (existingAccessory) {
            this.log.info('Restoring existing accessory from cache:', existingAccessory.displayName);

            existingAccessory.context.airstageClient = this.airstageClient;
            existingAccessory.context.deviceId = deviceId;
            existingAccessory.context.model = model;

            this.api.updatePlatformAccessories([existingAccessory]);

            new accessories.FanAccessory(this, existingAccessory);
        } else {
            const accessory = new this.api.platformAccessory(
                deviceName + ' Fan',
                uuid
            );

            this.log.info('Adding new accessory:', accessory.displayName);

            accessory.context.airstageClient = this.airstageClient;
            accessory.context.deviceId = deviceId;
            accessory.context.model = model;

            new accessories.FanAccessory(this, accessory);

            this.api.registerPlatformAccessories(
                settings.PLUGIN_NAME,
                settings.PLATFORM_NAME,
                [accessory]
            );
        }
    }

    _registerVerticalSlatsAccessory(deviceId, deviceName, model) {
        const uuid = this.api.hap.uuid.generate(deviceId + '-vertical-slats');
        const existingAccessory = this.accessories.find(
            accessory => accessory.UUID === uuid
        );

        if (existingAccessory) {
            this.log.info('Restoring existing accessory from cache:', existingAccessory.displayName);

            existingAccessory.context.airstageClient = this.airstageClient;
            existingAccessory.context.deviceId = deviceId;
            existingAccessory.context.model = model;

            this.api.updatePlatformAccessories([existingAccessory]);

            new accessories.VerticalSlatsAccessory(this, existingAccessory);
        } else {
            const accessory = new this.api.platformAccessory(
                deviceName + ' Vertical Slats',
                uuid
            );

            this.log.info('Adding new accessory:', accessory.displayName);

            accessory.context.airstageClient = this.airstageClient;
            accessory.context.deviceId = deviceId;
            accessory.context.model = model;

            new accessories.VerticalSlatsAccessory(this, accessory);

            this.api.registerPlatformAccessories(
                settings.PLUGIN_NAME,
                settings.PLATFORM_NAME,
                [accessory]
            );
        }
    }

    _registerDryModeSwitch(deviceId, deviceName, model) {
        const uuid = this.api.hap.uuid.generate(deviceId + '-dry-mode-switch');
        const existingAccessory = this.accessories.find(
            accessory => accessory.UUID === uuid
        );

        if (existingAccessory) {
            this.log.info('Restoring existing accessory from cache:', existingAccessory.displayName);

            existingAccessory.context.airstageClient = this.airstageClient;
            existingAccessory.context.deviceId = deviceId;
            existingAccessory.context.model = model;

            this.api.updatePlatformAccessories([existingAccessory]);

            new accessories.DryModeSwitchAccessory(this, existingAccessory);
        } else {
            const accessory = new this.api.platformAccessory(
                deviceName + ' Dry Mode Switch',
                uuid
            );

            this.log.info('Adding new accessory:', accessory.displayName);

            accessory.context.airstageClient = this.airstageClient;
            accessory.context.deviceId = deviceId;
            accessory.context.model = model;

            new accessories.DryModeSwitchAccessory(this, accessory);

            this.api.registerPlatformAccessories(
                settings.PLUGIN_NAME,
                settings.PLATFORM_NAME,
                [accessory]
            );
        }
    }

    _registerEconomySwitch(deviceId, deviceName, model) {
        const uuid = this.api.hap.uuid.generate(deviceId + '-economy-switch');
        const existingAccessory = this.accessories.find(
            accessory => accessory.UUID === uuid
        );

        if (existingAccessory) {
            this.log.info('Restoring existing accessory from cache:', existingAccessory.displayName);

            existingAccessory.context.airstageClient = this.airstageClient;
            existingAccessory.context.deviceId = deviceId;
            existingAccessory.context.model = model;

            this.api.updatePlatformAccessories([existingAccessory]);

            new accessories.EconomySwitchAccessory(this, existingAccessory);
        } else {
            const accessory = new this.api.platformAccessory(
                deviceName + ' Economy Switch',
                uuid
            );

            this.log.info('Adding new accessory:', accessory.displayName);

            accessory.context.airstageClient = this.airstageClient;
            accessory.context.deviceId = deviceId;
            accessory.context.model = model;

            new accessories.EconomySwitchAccessory(this, accessory);

            this.api.registerPlatformAccessories(
                settings.PLUGIN_NAME,
                settings.PLATFORM_NAME,
                [accessory]
            );
        }
    }

    _registerEnergySavingFanSwitch(deviceId, deviceName, model) {
        const uuid = this.api.hap.uuid.generate(deviceId + '-energy-saving-fan-switch');
        const existingAccessory = this.accessories.find(
            accessory => accessory.UUID === uuid
        );

        if (existingAccessory) {
            this.log.info('Restoring existing accessory from cache:', existingAccessory.displayName);

            existingAccessory.context.airstageClient = this.airstageClient;
            existingAccessory.context.deviceId = deviceId;
            existingAccessory.context.model = model;

            this.api.updatePlatformAccessories([existingAccessory]);

            new accessories.EnergySavingFanSwitchAccessory(this, existingAccessory);
        } else {
            const accessory = new this.api.platformAccessory(
                deviceName + ' Energy Saving Fan Switch',
                uuid
            );

            this.log.info('Adding new accessory:', accessory.displayName);

            accessory.context.airstageClient = this.airstageClient;
            accessory.context.deviceId = deviceId;
            accessory.context.model = model;

            new accessories.EnergySavingFanSwitchAccessory(this, accessory);

            this.api.registerPlatformAccessories(
                settings.PLUGIN_NAME,
                settings.PLATFORM_NAME,
                [accessory]
            );
        }
    }

    _registerFanModeSwitch(deviceId, deviceName, model) {
        const uuid = this.api.hap.uuid.generate(deviceId + '-fan-mode-switch');
        const existingAccessory = this.accessories.find(
            accessory => accessory.UUID === uuid
        );

        if (existingAccessory) {
            this.log.info('Restoring existing accessory from cache:', existingAccessory.displayName);

            existingAccessory.context.airstageClient = this.airstageClient;
            existingAccessory.context.deviceId = deviceId;
            existingAccessory.context.model = model;

            this.api.updatePlatformAccessories([existingAccessory]);

            new accessories.FanModeSwitchAccessory(this, existingAccessory);
        } else {
            const accessory = new this.api.platformAccessory(
                deviceName + ' Fan Mode Switch',
                uuid
            );

            this.log.info('Adding new accessory:', accessory.displayName);

            accessory.context.airstageClient = this.airstageClient;
            accessory.context.deviceId = deviceId;
            accessory.context.model = model;

            new accessories.FanModeSwitchAccessory(this, accessory);

            this.api.registerPlatformAccessories(
                settings.PLUGIN_NAME,
                settings.PLATFORM_NAME,
                [accessory]
            );
        }
    }

    _registerPowerfulSwitch(deviceId, deviceName, model) {
        const uuid = this.api.hap.uuid.generate(deviceId + '-powerful-switch');
        const existingAccessory = this.accessories.find(
            accessory => accessory.UUID === uuid
        );

        if (existingAccessory) {
            this.log.info('Restoring existing accessory from cache:', existingAccessory.displayName);

            existingAccessory.context.airstageClient = this.airstageClient;
            existingAccessory.context.deviceId = deviceId;
            existingAccessory.context.model = model;

            this.api.updatePlatformAccessories([existingAccessory]);

            new accessories.PowerfulSwitchAccessory(this, existingAccessory);
        } else {
            const accessory = new this.api.platformAccessory(
                deviceName + ' Powerful Switch',
                uuid
            );

            this.log.info('Adding new accessory:', accessory.displayName);

            accessory.context.airstageClient = this.airstageClient;
            accessory.context.deviceId = deviceId;
            accessory.context.model = model;

            new accessories.PowerfulSwitchAccessory(this, accessory);

            this.api.registerPlatformAccessories(
                settings.PLUGIN_NAME,
                settings.PLATFORM_NAME,
                [accessory]
            );
        }
    }

    _refreshAirstageClientToken() {
        this.airstageClient.refreshToken((function(error) {
            if (error) {
                throw new this.api.hap.HapStatusError(
                    this.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE
                );
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
                    throw new this.api.hap.HapStatusError(
                        this.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE
                    );
                }

                this.log.debug('Refreshed Airstage client user metadata cache');
            }).bind(this)
        );

        this.airstageClient.resetDeviceCache();
        this.airstageClient.getDevices(
            limit,
            (function(error) {
                if (error) {
                    throw new this.api.hap.HapStatusError(
                        this.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE
                    );
                }

                this.log.debug('Refreshed Airstage client device cache');
            }).bind(this)
        );
    }
}

module.exports = Platform;
