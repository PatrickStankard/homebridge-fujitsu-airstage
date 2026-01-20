'use strict';

const ConfigManager = require('./config-manager');
const PlatformAccessoryManager = require('./platform-accessory-manager');
const LocalConfigValidator = require('./utils/local-config-validator');
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

        // Determine connection mode (defaults to cloud for backward compatibility)
        const connectionMode = this.config.connectionMode || 'cloud';

        if (connectionMode === 'local') {
            // Store initialization promise to await in discoverDevices
            this._initPromise = this._initLocalMode(withSetInterval);
        } else {
            this._initCloudMode(withSetInterval);
        }

        this.api.on('didFinishLaunching', this.discoverDevices.bind(this));
    }

    async _initLocalMode(withSetInterval) {
        this.log.info('Initializing Local LAN mode');
        this.connectionMode = 'local';

        const device = this.config.localDevice;

        if (!device) {
            this.log.warn('No local device configured. Please add localDevice to your config.');
            return;
        }

        if (!device.ipAddress) {
            this.log.warn(`Device "${device.name}" is missing IP address`);
            return;
        }

        this.log.info(`Validating device: ${device.name} (${device.ipAddress})`);

        // Validate IPv4 format
        if (!LocalConfigValidator.isValidIpv4Format(device.ipAddress)) {
            this.log.warn(`✗ ${device.name} has invalid IPv4 address format: ${device.ipAddress}`);
            this.log.warn(`  Expected format: xxx.xxx.xxx.xxx (e.g., 192.168.1.100)`);
            return;
        }

        // Check HTTP connectivity (populates ARP table)
        this.log.info(`Checking connectivity to ${device.name}...`);
        const connectivityCheck = await LocalConfigValidator.checkHttpConnectivity(device.ipAddress);

        if (!connectivityCheck.success) {
            this.log.warn(`✗ Cannot reach ${device.name} at ${device.ipAddress}`);
            this.log.warn(`  Error: ${connectivityCheck.error}`);
            this.log.warn(`  Troubleshooting:`);
            this.log.warn(`    • Verify device is powered on and connected to network`);
            this.log.warn(`    • Check that IP address is correct`);
            this.log.warn(`    • Ensure device is on the same network/subnet`);
            this.log.warn(`    • Verify no firewall is blocking HTTP traffic`);
            return;
        }

        this.log.success(`✓ Device is reachable via HTTP (status: ${connectivityCheck.statusCode})`);

        // Auto-detect device ID if not provided or normalize to UPPERCASE
        let deviceId = device.deviceId;

        if (!deviceId) {
            this.log.info(`Auto-detecting device ID for ${device.name} at ${device.ipAddress}...`);

            const detection = await LocalConfigValidator.detectDeviceId(device.ipAddress);

            if (detection.success) {
                deviceId = detection.deviceId;
                this.log.success(`✓ Auto-detected device ID: ${deviceId}`);

                // Update in-memory config so it's available during the session
                device.deviceId = deviceId;
            } else {
                this.log.warn(`✗ Auto-detection failed for ${device.name} (${device.ipAddress})`);
                this.log.warn(`  Error: ${detection.error}`);
                if (detection.details) {
                    this.log.warn(`  ${detection.details}`);
                }
                this.log.warn(`  Solution: Manually add device ID to config (12-character MAC without colons)`);
                this.log.warn(`  Example: "deviceId": "A0B1C2D3E4F5"`);
                return;
            }
        } else {
            // Normalize provided device ID to UPPERCASE
            deviceId = LocalConfigValidator.normalizeDeviceId(deviceId);

            if (!LocalConfigValidator.isValidDeviceIdFormat(deviceId)) {
                this.log.warn(`✗ Invalid device ID format for ${device.name}: ${device.deviceId}`);
                this.log.warn(`  Device ID must be 12 hexadecimal characters (MAC without colons)`);
                this.log.warn(`  Example: "A0B1C2D3E4F5" or "a0:b1:c2:d3:e4:f5"`);
                return;
            }
        }

        // Validate connectivity
        const validation = await LocalConfigValidator.validateDeviceConfig(
            device.ipAddress,
            deviceId,
            device.deviceSubId || 0
        );

        if (!validation.success) {
            this.log.warn(`✗ ${device.name} validation failed: ${validation.error}`);
            this.log.warn(`  Check IP address, network connectivity, and device power`);
            return;
        }

        this.log.success(`✓ ${device.name} validated successfully`);

        // Create validated device object
        const validatedDevice = {
            name: device.name,
            ipAddress: device.ipAddress,
            deviceId: deviceId,  // UPPERCASE
            deviceSubId: device.deviceSubId || 0
        };

        // Create local client with single device (pass as array for client compatibility)
        this.airstageClient = new airstage.local.Client([validatedDevice], this.log, this.configManager);

        this.log.success(`✓ Local LAN mode initialized with device: ${device.name}`);

        // Set up periodic polling for local mode
        if (withSetInterval) {
            const pollingInterval = (device.localPollingInterval || 120) * 1000; // Default: 120 seconds

            if (pollingInterval > 0) {
                this.log.info(`Setting up local device polling every ${pollingInterval / 1000} seconds`);
                setInterval(
                    this._refreshLocalDeviceState.bind(this),
                    pollingInterval
                );
            } else {
                this.log.info('Local device polling disabled (localPollingInterval set to 0)');
            }
        }
    }

    _initCloudMode(withSetInterval) {
        this.log.info('Initializing Cloud API mode');
        this.connectionMode = 'cloud';

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
            tokens.refreshToken || null,
            this.log
        );

        // Only set up cache refresh intervals for cloud mode
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
    }

    configureAccessory(accessory) {
        this.accessories.push(accessory);
    }

    discoverDevices(callback = null) {
        if (this.connectionMode === 'local') {
            this._discoverLocalDevices(callback);
        } else {
            this._discoverCloudDevices(callback);
        }
    }

    async _discoverLocalDevices(callback = null) {
        this.log.info('Discovering local LAN devices');

        // Wait for initialization to complete if it's still pending
        if (this._initPromise) {
            try {
                await this._initPromise;
            } catch (error) {
                this.log.error('Local mode initialization failed:', error.message);
                if (callback !== null) {
                    callback(error);
                }
                return;
            }
        }

        // Check if client was successfully initialized
        if (!this.airstageClient || !this.airstageClient.devices) {
            this.log.error('Local Airstage client not initialized - device validation may have failed');
            if (callback !== null) {
                callback(new Error('Local client not initialized'));
            }
            return;
        }

        // Configure accessories for each validated local device
        this.airstageClient.devices.forEach((device, deviceId) => {
            this.log.info(`Configuring device: ${device.name} (${deviceId})`);
            this._configureAirstageDevice(
                deviceId,
                device.name,
                'Airstage'  // Model will be queried from device if needed
            );
        });

        if (callback !== null) {
            callback(null);
        }
    }

    _discoverCloudDevices(callback = null) {
        this.log.info('Discovering cloud devices');

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

    _refreshLocalDeviceState() {
        this.log.debug('Polling local device state');

        // Get the device ID from the local device config
        const device = this.config.localDevice;
        if (!device || !device.deviceId) {
            this.log.error('Cannot refresh local device state: device ID not available');
            return;
        }

        const deviceId = device.deviceId;

        // Refresh all accessory characteristics with change detection enabled
        // onlyNotifyOnChange = true ensures we only push to HomeKit when values actually change
        this.accessoryManager.refreshAllAccessoryCharacteristics(deviceId, true);
    }
}

module.exports = Platform;
