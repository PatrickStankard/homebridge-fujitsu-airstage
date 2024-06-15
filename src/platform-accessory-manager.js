'use strict';

const accessories = require('./accessories');
const constants = require('./constants');
const settings = require('./settings');

class PlatformAccessoryManager {

    constructor(platform) {
        this.platform = platform;
    }

    registerThermostatAccessory(deviceId, deviceName, model) {
        const suffix = constants.ACCESSORY_SUFFIX_THERMOSTAT;
        const existingAccessory = this._getExistingAccessory(deviceId, suffix);

        if (existingAccessory) {
            this._updateExistingAccessory(existingAccessory, deviceId, model);

            new accessories.ThermostatAccessory(this.platform, existingAccessory);
        } else {
            const newAccessory = this._instantiateNewAccessory(
                deviceId,
                deviceName,
                model,
                suffix
            );

            new accessories.ThermostatAccessory(this.platform, newAccessory);

            this._registerNewAccessory(newAccessory, deviceId, model);
        }
    }

    registerFanAccessory(deviceId, deviceName, model) {
        const suffix = constants.ACCESSORY_SUFFIX_FAN;
        const existingAccessory = this._getExistingAccessory(deviceId, suffix);

        if (existingAccessory) {
            this._updateExistingAccessory(existingAccessory, deviceId, model);

            new accessories.FanAccessory(this.platform, existingAccessory);
        } else {
            const newAccessory = this._instantiateNewAccessory(
                deviceId,
                deviceName,
                model,
                suffix
            );

            new accessories.FanAccessory(this.platform, newAccessory);

            this._registerNewAccessory(newAccessory, deviceId, model);
        }
    }

    registerVerticalSlatsAccessory(deviceId, deviceName, model) {
        const suffix = constants.ACCESSORY_SUFFIX_VERTICAL_SLATS;
        const existingAccessory = this._getExistingAccessory(deviceId, suffix);

        if (existingAccessory) {
            this._updateExistingAccessory(existingAccessory, deviceId, model);

            new accessories.VerticalSlatsAccessory(this.platform, existingAccessory);
        } else {
            const newAccessory = this._instantiateNewAccessory(
                deviceId,
                deviceName,
                model,
                suffix
            );

            new accessories.VerticalSlatsAccessory(this.platform, newAccessory);

            this._registerNewAccessory(newAccessory, deviceId, model);
        }
    }

    registerDryModeSwitchAccessory(deviceId, deviceName, model) {
        const suffix = constants.ACCESSORY_SUFFIX_DRY_MODE_SWITCH;
        const existingAccessory = this._getExistingAccessory(deviceId, suffix);

        if (existingAccessory) {
            this._updateExistingAccessory(existingAccessory, deviceId, model);

            new accessories.DryModeSwitchAccessory(this.platform, existingAccessory);
        } else {
            const newAccessory = this._instantiateNewAccessory(
                deviceId,
                deviceName,
                model,
                suffix
            );

            new accessories.DryModeSwitchAccessory(this.platform, newAccessory);

            this._registerNewAccessory(newAccessory, deviceId, model);
        }
    }

    registerFanModeSwitchAccessory(deviceId, deviceName, model) {
        const suffix = constants.ACCESSORY_SUFFIX_FAN_MODE_SWITCH;
        const existingAccessory = this._getExistingAccessory(deviceId, suffix);

        if (existingAccessory) {
            this._updateExistingAccessory(existingAccessory, deviceId, model);

            new accessories.FanModeSwitchAccessory(this.platform, existingAccessory);
        } else {
            const newAccessory = this._instantiateNewAccessory(
                deviceId,
                deviceName,
                model,
                suffix
            );

            new accessories.FanModeSwitchAccessory(this.platform, newAccessory);

            this._registerNewAccessory(newAccessory, deviceId, model);
        }
    }

    registerEconomySwitchAccessory(deviceId, deviceName, model) {
        const suffix = constants.ACCESSORY_SUFFIX_ECONOMY_SWITCH;
        const existingAccessory = this._getExistingAccessory(deviceId, suffix);

        if (existingAccessory) {
            this._updateExistingAccessory(existingAccessory, deviceId, model);

            new accessories.EconomySwitchAccessory(this.platform, existingAccessory);
        } else {
            const newAccessory = this._instantiateNewAccessory(
                deviceId,
                deviceName,
                model,
                suffix
            );

            new accessories.EconomySwitchAccessory(this.platform, newAccessory);

            this._registerNewAccessory(newAccessory, deviceId, model);
        }
    }

    registerEnergySavingFanSwitchAccessory(deviceId, deviceName, model) {
        const suffix = constants.ACCESSORY_SUFFIX_ENERGY_SAVING_FAN_SWITCH;
        const existingAccessory = this._getExistingAccessory(deviceId, suffix);

        if (existingAccessory) {
            this._updateExistingAccessory(existingAccessory, deviceId, model);

            new accessories.EnergySavingFanSwitchAccessory(this.platform, existingAccessory);
        } else {
            const newAccessory = this._instantiateNewAccessory(
                deviceId,
                deviceName,
                model,
                suffix
            );

            new accessories.EnergySavingFanSwitchAccessory(this.platform, newAccessory);

            this._registerNewAccessory(newAccessory, deviceId, model);
        }
    }

    registerPowerfulSwitchAccessory(deviceId, deviceName, model) {
        const suffix = constants.ACCESSORY_SUFFIX_POWERFUL_SWITCH;
        const existingAccessory = this._getExistingAccessory(deviceId, suffix);

        if (existingAccessory) {
            this._updateExistingAccessory(existingAccessory, deviceId, model);

            new accessories.PowerfulSwitchAccessory(this.platform, existingAccessory);
        } else {
            const newAccessory = this._instantiateNewAccessory(
                deviceId,
                deviceName,
                model,
                suffix
            );

            new accessories.PowerfulSwitchAccessory(this.platform, newAccessory);

            this._registerNewAccessory(newAccessory, deviceId, model);
        }
    }

    refreshThermostatAccessoryCharacteristics(deviceId) {
        const suffix = constants.ACCESSORY_SUFFIX_THERMOSTAT;
        const accessory = this._getExistingAccessory(deviceId, suffix);

        if (accessory === null) {
            return false;
        }

        return this._refreshAccessoryCharacteristics(
            accessory,
            [
                this.platform.Characteristic.CurrentHeatingCoolingState,
                this.platform.Characteristic.TargetHeatingCoolingState
            ]
        );
    }

    refreshFanAccessoryCharacteristics(deviceId) {
        const suffix = constants.ACCESSORY_SUFFIX_FAN;
        const accessory = this._getExistingAccessory(deviceId, suffix);

        if (accessory === null) {
            return false;
        }

        return this._refreshAccessoryCharacteristics(
            accessory,
            [
                this.platform.Characteristic.Active,
                this.platform.Characteristic.CurrentFanState,
                this.platform.Characteristic.TargetFanState,
                this.platform.Characteristic.RotationSpeed
            ]
        );
    }

    refreshDryModeSwitchAccessoryCharacteristics(deviceId) {
        const suffix = constants.ACCESSORY_SUFFIX_DRY_MODE_SWITCH;
        const accessory = this._getExistingAccessory(deviceId, suffix);

        if (accessory === null) {
            return false;
        }

        return this._refreshAccessoryCharacteristics(
            accessory,
            [
                this.platform.Characteristic.On
            ]
        );
    }

    refreshFanModeSwitchAccessoryCharacteristics(deviceId) {
        const suffix = constants.ACCESSORY_SUFFIX_FAN_MODE_SWITCH;
        const accessory = this._getExistingAccessory(deviceId, suffix);

        if (accessory === null) {
            return false;
        }

        return this._refreshAccessoryCharacteristics(
            accessory,
            [
                this.platform.Characteristic.On
            ]
        );
    }

    _updateExistingAccessory(existingAccessory, deviceId, model) {
        this.platform.log.info('Restoring existing accessory from cache:', existingAccessory.displayName);

        existingAccessory.context.airstageClient = this.platform.airstageClient;
        existingAccessory.context.deviceId = deviceId;
        existingAccessory.context.model = model;

        this.platform.api.updatePlatformAccessories([existingAccessory]);
    }

    _registerNewAccessory(newAccessory, deviceId, model) {
        this.platform.log.info('Adding new accessory:', newAccessory.displayName);

        newAccessory.context.airstageClient = this.platform.airstageClient;
        newAccessory.context.deviceId = deviceId;
        newAccessory.context.model = model;

        this.platform.api.registerPlatformAccessories(
            settings.PLUGIN_NAME,
            settings.PLATFORM_NAME,
            [newAccessory]
        );

        this.platform.accessories.push(newAccessory);
    }

    _instantiateNewAccessory(deviceId, deviceName, model, suffix) {
        const accessoryName = this._getAccessoryName(deviceName, suffix);
        const accessoryUuid = this._getAccessoryUuid(deviceId, suffix);
        const accessory = new this.platform.api.platformAccessory(
            accessoryName,
            accessoryUuid
        );

        accessory.context.airstageClient = this.platform.airstageClient;
        accessory.context.deviceId = deviceId;
        accessory.context.model = model;

        return accessory;
    }

    _getExistingAccessory(deviceId, suffix) {
        const accessoryUuid = this._getAccessoryUuid(deviceId, suffix);

        return this.platform.accessories.find(
            accessory => accessory.UUID === accessoryUuid
        ) || null;
    }

    _refreshAccessoryCharacteristics(accessory, characteristicClasses) {
        const service = accessory.services.find(
            service => (service instanceof this.platform.Service.AccessoryInformation) === false
        ) || null;

        if (service === null) {
            return false;
        }

        characteristicClasses.forEach(function(characteristicClass) {
            const characteristic = service.getCharacteristic(characteristicClass);

            characteristic.emit('get', function(error, value) {
                if (error === null) {
                    characteristic.sendEventNotification(value);
                }
            });
        });

        return true;
    }

    _getAccessoryName(deviceName, suffix) {
        const suffixParts = suffix.split('-');

        suffixParts.forEach(function(part, idx, array) {
            array[idx] = (part.charAt(0).toUpperCase() + part.substring(1));
        });

        return deviceName + ' ' + suffixParts.join(' ');
    }

    _getAccessoryUuid(deviceId, suffix) {
        return this.platform.api.hap.uuid.generate(
            deviceId + '-' + suffix
        );
    }
}

module.exports = PlatformAccessoryManager;