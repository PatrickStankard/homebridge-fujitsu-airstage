'use strict';

const airstage = require('./../airstage');

class EnergySavingFanSwitchAccessory {

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
        this.airstageClient.getEnergySavingFanState(this.deviceId, function(error, energySavingFanState) {
            let value = null;

            if (error) {
                return callback(error, null);
            }

            if (energySavingFanState === airstage.constants.TOGGLE_ON) {
                value = true;
            } else if (energySavingFanState === airstage.constants.TOGGLE_OFF) {
                value = false;
            }

            callback(null, value);
        });
    }

    setOn(value, callback) {
        let energySavingFanState = null;

        if (value) {
            energySavingFanState = airstage.constants.TOGGLE_ON;
        } else {
            energySavingFanState = airstage.constants.TOGGLE_OFF;
        }

        this.airstageClient.setEnergySavingFanState(
            this.deviceId,
            energySavingFanState,
            function(error) {
                callback(error);
            }
        );
    }

    getName(callback) {
        this.airstageClient.getName(this.deviceId, function(error, name) {
            if (error) {
                return callback(error, null);
            }

            callback(null, name + ' Energy Saving Fan Switch');
        });
    }
}

module.exports = EnergySavingFanSwitchAccessory;
