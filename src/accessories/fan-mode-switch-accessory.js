'use strict';

const airstage = require('./../airstage');

class FanModeSwitchAccessory {

    constructor(platform, accessory) {
        this.platform = platform;
        this.accessory = accessory;

        this.deviceId = this.accessory.context.deviceId;
        this.airstageClient = this.accessory.context.airstageClient;

        this.accessory.getService(this.platform.Service.AccessoryInformation)
            .setCharacteristic(this.platform.Characteristic.Manufacturer, airstage.constants.MANUFACTURER_FUJITSU)
            .setCharacteristic(this.platform.Characteristic.Model, this.accessory.context.model)
            .setCharacteristic(this.platform.Characteristic.SerialNumber, this.accessory.context.deviceId);

        this.service = (
            this.accessory.getService(this.platform.Service.Switch) ||
            this.accessory.addService(this.platform.Service.Switch)
        );

        this.service.getCharacteristic(this.platform.Characteristic.On)
            .on('get', this.getOn.bind(this))
            .on('set', this.setOn.bind(this));

        this.service.getCharacteristic(this.platform.Characteristic.Name)
            .on('get', this.getName.bind(this));
    }

    getOn(callback) {
        this.airstageClient.getOperationMode(this.deviceId, function(error, operationMode) {
            let value = null;

            if (error) {
                return callback(error, null);
            }

            value = (operationMode === airstage.constants.OPERATION_MODE_FAN);

            callback(null, value);
        });
    }

    setOn(value, callback) {
        let operationMode = null;

        if (value) {
            operationMode = airstage.constants.OPERATION_MODE_FAN;
        } else {
            operationMode = airstage.constants.OPERATION_MODE_AUTO;
        }

        this.airstageClient.setOperationMode(
            this.deviceId,
            operationMode,
            (function(error) {
                if (error) {
                    return callback(error);
                }

                this._updateThermostatServiceCharacteristics();
                this._updateDryModeSwitchCharacteristics();

                callback(null);
            }).bind(this)
        );
    }

    getName(callback) {
        this.airstageClient.getName(this.deviceId, function(error, name) {
            if (error) {
                return callback(error, null);
            }

            callback(null, name + ' Fan Mode Switch');
        });
    }

    _updateThermostatServiceCharacteristics() {
        const thermostatService = this._getThermostatService();

        if (thermostatService === null) {
            return false;
        }

        const currentHeatingCoolingState = thermostatService.getCharacteristic(
            this.platform.Characteristic.CurrentHeatingCoolingState
        );
        const targetHeatingCoolingState = thermostatService.getCharacteristic(
            this.platform.Characteristic.TargetHeatingCoolingState
        );

        currentHeatingCoolingState.emit('get', function(error, value) {
            if (error === null) {
                currentHeatingCoolingState.sendEventNotification(value);
            }
        });

        targetHeatingCoolingState.emit('get', function(error, value) {
            if (error === null) {
                targetHeatingCoolingState.sendEventNotification(value);
            }
        });

        return true;
    }

    _updateDryModeSwitchCharacteristics() {
        const dryModeSwitch = this._getDryModeSwitch();

        if (dryModeSwitch === null) {
            return false;
        }

        const on = dryModeSwitch.getCharacteristic(
            this.platform.Characteristic.on
        );

        on.emit('get', function(error, value) {
            if (error === null) {
                on.sendEventNotification(value);
            }
        });

        return true;
    }

    _getThermostatService() {
        let thermostatService = null;
        const uuid = this.platform.api.hap.uuid.generate(
            this.deviceId + '-thermostat'
        );
        const existingAccessory = this.platform.accessories.find(
            accessory => accessory.UUID === uuid
        );

        if (existingAccessory) {
            thermostatService = existingAccessory.services.find(
                service => service instanceof this.platform.Service.Thermostat
            );
        }

        return thermostatService;
    }

    _getDryModeSwitch() {
        let dryModeSwitch = null;
        const uuid = this.platform.api.hap.uuid.generate(
            this.deviceId + '-dry-mode-switch'
        );
        const existingAccessory = this.platform.accessories.find(
            accessory => accessory.UUID === uuid
        );

        if (existingAccessory) {
            dryModeSwitch = existingAccessory.services.find(
                service => service instanceof this.platform.Service.Switch
            );
        }

        return dryModeSwitch;
    }
}

module.exports = FanModeSwitchAccessory;
