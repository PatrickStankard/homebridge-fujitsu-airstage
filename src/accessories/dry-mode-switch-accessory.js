'use strict';

const airstage = require('./../airstage');

class DryModeSwitchAccessory {

    constructor(platform, accessory) {
        this.platform = platform;
        this.accessory = accessory;

        this.deviceId = this.accessory.context.deviceId;
        this.airstageClient = this.accessory.context.airstageClient;
        this.lastKnownOperationMode = null;

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
            if (this.lastKnownOperationMode !== null) {
                operationMode = this.lastKnownOperationMode;
            } else {
                operationMode = airstage.constants.OPERATION_MODE_AUTO;
            }
        }

        this.airstageClient.getOperationMode(
            this.deviceId,
            (function(error, currentOperationMode) {
                this.lastKnownOperationMode = currentOperationMode;

                this.airstageClient.setOperationMode(
                    this.deviceId,
                    operationMode,
                    (function(error) {
                        if (error) {
                            return callback(error);
                        }

                        this._refreshRelatedAccessoryCharacteristics();

                        callback(null);
                    }).bind(this)
                );
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

    _refreshRelatedAccessoryCharacteristics() {
        const accessoryManager = this.platform.accessoryManager;

        accessoryManager.refreshThermostatAccessoryCharacteristics(this.deviceId);
        accessoryManager.refreshFanAccessoryCharacteristics(this.deviceId);
        accessoryManager.refreshFanModeSwitchAccessoryCharacteristics(this.deviceId);
    }
}

module.exports = DryModeSwitchAccessory;
