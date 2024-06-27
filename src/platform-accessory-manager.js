'use strict';

const accessories = require('./accessories');
const constants = require('./constants');
const settings = require('./settings');

class PlatformAccessoryManager {

    constructor(platform) {
        this.platform = platform;

        this.Service = this.platform.Service;
        this.Characteristic = this.platform.Characteristic;
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

    registerMinimumHeatModeSwitchAccessory(deviceId, deviceName, model) {
        const suffix = constants.ACCESSORY_SUFFIX_MINIMUM_HEAT_MODE_SWITCH;
        const existingAccessory = this._getExistingAccessory(deviceId, suffix);

        if (existingAccessory) {
            this._updateExistingAccessory(existingAccessory, deviceId, model);

            new accessories.MinimumHeatModeSwitchAccessory(this.platform, existingAccessory);
        } else {
            const newAccessory = this._instantiateNewAccessory(
                deviceId,
                deviceName,
                model,
                suffix
            );

            new accessories.MinimumHeatModeSwitchAccessory(this.platform, newAccessory);

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

    unregisterThermostatAccessory(deviceId, deviceName) {
        const suffix = constants.ACCESSORY_SUFFIX_THERMOSTAT;

        this._unregisterAccessory(deviceId, deviceName, suffix);
    }

    unregisterFanAccessory(deviceId, deviceName) {
        const suffix = constants.ACCESSORY_SUFFIX_FAN;

        this._unregisterAccessory(deviceId, deviceName, suffix);
    }

    unregisterVerticalSlatsAccessory(deviceId, deviceName) {
        const suffix = constants.ACCESSORY_SUFFIX_VERTICAL_SLATS;

        this._unregisterAccessory(deviceId, deviceName, suffix);
    }

    unregisterDryModeSwitchAccessory(deviceId, deviceName) {
        const suffix = constants.ACCESSORY_SUFFIX_DRY_MODE_SWITCH;

        this._unregisterAccessory(deviceId, deviceName, suffix);
    }

    unregisterEconomySwitchAccessory(deviceId, deviceName) {
        const suffix = constants.ACCESSORY_SUFFIX_ECONOMY_SWITCH;

        this._unregisterAccessory(deviceId, deviceName, suffix);
    }

    unregisterEnergySavingFanSwitchAccessory(deviceId, deviceName) {
        const suffix = constants.ACCESSORY_SUFFIX_ENERGY_SAVING_FAN_SWITCH;

        this._unregisterAccessory(deviceId, deviceName, suffix);
    }

    unregisterFanModeSwitchAccessory(deviceId, deviceName) {
        const suffix = constants.ACCESSORY_SUFFIX_FAN_MODE_SWITCH;

        this._unregisterAccessory(deviceId, deviceName, suffix);
    }

    unregisterMinimumHeatModeSwitchAccessory(deviceId, deviceName) {
        const suffix = constants.ACCESSORY_SUFFIX_MINIMUM_HEAT_MODE_SWITCH;

        this._unregisterAccessory(deviceId, deviceName, suffix);
    }

    unregisterPowerfulSwitchAccessory(deviceId, deviceName) {
        const suffix = constants.ACCESSORY_SUFFIX_POWERFUL_SWITCH;

        this._unregisterAccessory(deviceId, deviceName, suffix);
    }

    refreshAllAccessoryCharacteristics(deviceId) {
        this.refreshThermostatAccessoryCharacteristics(deviceId);
        this.refreshFanAccessoryCharacteristics(deviceId);
        this.refreshVerticalSlatsAccessoryCharacteristics(deviceId);
        this.refreshDryModeSwitchAccessoryCharacteristics(deviceId);
        this.refreshEconomySwitchAccessoryCharacteristics(deviceId);
        this.refreshEnergySavingFanSwitchAccessoryCharacteristics(deviceId);
        this.refreshFanModeSwitchAccessoryCharacteristics(deviceId);
        this.refreshMinimumHeatModeSwitchAccessoryCharacteristics(deviceId);
        this.refreshPowerfulSwitchAccessoryCharacteristics(deviceId);
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
                this.Characteristic.CurrentHeatingCoolingState,
                this.Characteristic.TargetHeatingCoolingState,
                this.Characteristic.CurrentTemperature,
                this.Characteristic.TargetTemperature,
                this.Characteristic.TemperatureDisplayUnits
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
                this.Characteristic.Active,
                this.Characteristic.CurrentFanState,
                this.Characteristic.TargetFanState,
                this.Characteristic.RotationSpeed,
                this.Characteristic.SwingMode
            ]
        );
    }

    refreshVerticalSlatsAccessoryCharacteristics(deviceId) {
        const suffix = constants.ACCESSORY_SUFFIX_VERTICAL_SLATS;
        const accessory = this._getExistingAccessory(deviceId, suffix);

        if (accessory === null) {
            return false;
        }

        return this._refreshAccessoryCharacteristics(
            accessory,
            [
                this.Characteristic.CurrentSlatState,
                this.Characteristic.SwingMode,
                this.Characteristic.CurrentTiltAngle,
                this.Characteristic.TargetTiltAngle
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
                this.Characteristic.On
            ]
        );
    }

    refreshEconomySwitchAccessoryCharacteristics(deviceId) {
        const suffix = constants.ACCESSORY_SUFFIX_ECONOMY_SWITCH;
        const accessory = this._getExistingAccessory(deviceId, suffix);

        if (accessory === null) {
            return false;
        }

        return this._refreshAccessoryCharacteristics(
            accessory,
            [
                this.Characteristic.On
            ]
        );
    }

    refreshEnergySavingFanSwitchAccessoryCharacteristics(deviceId) {
        const suffix = constants.ACCESSORY_SUFFIX_ENERGY_SAVING_FAN_SWITCH;
        const accessory = this._getExistingAccessory(deviceId, suffix);

        if (accessory === null) {
            return false;
        }

        return this._refreshAccessoryCharacteristics(
            accessory,
            [
                this.Characteristic.On
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
                this.Characteristic.On
            ]
        );
    }

    refreshMinimumHeatModeSwitchAccessoryCharacteristics(deviceId) {
        const suffix = constants.ACCESSORY_SUFFIX_MINIMUM_HEAT_MODE_SWITCH;
        const accessory = this._getExistingAccessory(deviceId, suffix);

        if (accessory === null) {
            return false;
        }

        return this._refreshAccessoryCharacteristics(
            accessory,
            [
                this.Characteristic.On
            ]
        );
    }

    refreshPowerfulSwitchAccessoryCharacteristics(deviceId) {
        const suffix = constants.ACCESSORY_SUFFIX_POWERFUL_SWITCH;
        const accessory = this._getExistingAccessory(deviceId, suffix);

        if (accessory === null) {
            return false;
        }

        return this._refreshAccessoryCharacteristics(
            accessory,
            [
                this.Characteristic.On
            ]
        );
    }

    refreshServiceCharacteristics(service, characteristicClasses) {
        characteristicClasses.forEach(function(characteristicClass) {
            const characteristic = service.getCharacteristic(characteristicClass);
            let logMessage = '[' + service.constructor.name + '][' + characteristic.constructor.name + '] Refreshing characteristic';

            this.platform.log.debug(logMessage);

            characteristic.emit('get', function(error, value) {
                if (error === null) {
                    characteristic.sendEventNotification(value);
                } else {
                    logMessage = logMessage + ' failed with error: ' + error;
                    this.platform.log.error(logMessage);
                }
            });
        }, this);

        return true;
    }

    _updateExistingAccessory(existingAccessory, deviceId, model) {
        this.platform.log.info('Restoring existing accessory from cache:', existingAccessory.displayName);

        existingAccessory.context.airstageClient = this.platform.airstageClient;
        existingAccessory.context.deviceId = deviceId;
        existingAccessory.context.model = model;

        this.platform.api.updatePlatformAccessories([existingAccessory]);
    }

    _unregisterAccessory(deviceId, deviceName, suffix) {
        const accessoryName = this._getAccessoryName(deviceName, suffix);
        const existingAccessory = this._getExistingAccessory(deviceId, suffix);

        this.platform.log.info(
            'Not adding accessory because it is disabled in the config:',
            accessoryName
        );

        if (existingAccessory) {
            this._unregisterExistingAccessory(existingAccessory);
        }
    }

    _unregisterExistingAccessory(existingAccessory) {
        this.platform.log.info('Removing existing accessory from cache:', existingAccessory.displayName);

        this.platform.api.unregisterPlatformAccessories(
            settings.PLUGIN_NAME,
            settings.PLATFORM_NAME,
            [existingAccessory]
        );
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
            service => (service instanceof this.Service.AccessoryInformation) === false
        ) || null;

        if (service === null) {
            return false;
        }

        return this.refreshServiceCharacteristics(
            service,
            characteristicClasses
        );
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
