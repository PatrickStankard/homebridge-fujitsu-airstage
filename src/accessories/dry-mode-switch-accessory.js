'use strict';

const airstage = require('./../airstage');

class DryModeSwitchAccessory {

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

            value = (operationMode === airstage.constants.OPERATION_MODE_DRY);

            callback(null, value);
        });
    }

    setOn(value, callback) {
        let operationMode = null;

        if (value) {
            operationMode = airstage.constants.OPERATION_MODE_DRY;
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
                this._updateFanServiceCharacteristics();
                this._updateFanModeSwitchCharacteristics();

                callback(null);
            }).bind(this)
        );
    }

    getName(callback) {
        this.airstageClient.getName(this.deviceId, function(error, name) {
            if (error) {
                return callback(error, null);
            }

            callback(null, name + ' Dry Mode Switch');
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

    _updateFanServiceCharacteristics() {
        const fanService = this._getFanService();

        if (fanService === null) {
            return false;
        }

        const active = fanService.getCharacteristic(
            this.platform.Characteristic.Active
        );
        const currentFanState = fanService.getCharacteristic(
            this.platform.Characteristic.CurrentFanState
        );
        const targetFanState = fanService.getCharacteristic(
            this.platform.Characteristic.TargetFanState
        );
        const rotationSpeed = fanService.getCharacteristic(
            this.platform.Characteristic.RotationSpeed
        );

        active.emit('get', function(error, value) {
            if (error === null) {
                active.sendEventNotification(value);
            }
        });

        currentFanState.emit('get', function(error, value) {
            if (error === null) {
                currentFanState.sendEventNotification(value);
            }
        });

        targetFanState.emit('get', function(error, value) {
            if (error === null) {
                targetFanState.sendEventNotification(value);
            }
        });

        rotationSpeed.emit('get', function(error, value) {
            if (error === null) {
                rotationSpeed.sendEventNotification(value);
            }
        });

        return true;
    }

    _updateFanModeSwitchCharacteristics() {
        const fanModeSwitch = this._getFanModeSwitch();

        if (fanModeSwitch === null) {
            return false;
        }

        const on = fanModeSwitch.getCharacteristic(
            this.platform.Characteristic.On
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

    _getFanService() {
        let fanService = null;
        const uuid = this.platform.api.hap.uuid.generate(
            this.deviceId + '-fan'
        );
        const existingAccessory = this.platform.accessories.find(
            accessory => accessory.UUID === uuid
        );

        if (existingAccessory) {
            fanService = existingAccessory.services.find(
                service => service instanceof this.platform.Service.Fanv2
            );
        }

        return fanService;
    }

    _getFanModeSwitch() {
        let fanModeSwitch = null;
        const uuid = this.platform.api.hap.uuid.generate(
            this.deviceId + '-fan-mode-switch'
        );
        const existingAccessory = this.platform.accessories.find(
            accessory => accessory.UUID === uuid
        );

        if (existingAccessory) {
            fanModeSwitch = existingAccessory.services.find(
                service => service instanceof this.platform.Service.Switch
            );
        }

        return fanModeSwitch;
    }
}

module.exports = DryModeSwitchAccessory;
