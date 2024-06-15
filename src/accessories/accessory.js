'use strict';

const airstage = require('./../airstage');

class Accessory {

    constructor(platform, accessory) {
        this.platform = platform;
        this.accessory = accessory;
        this.dynamicServiceCharacteristics = [];

        this.deviceId = this.accessory.context.deviceId;
        this.airstageClient = this.accessory.context.airstageClient;

        this.accessory.getService(this.platform.Service.AccessoryInformation)
            .setCharacteristic(this.platform.Characteristic.Manufacturer, airstage.constants.MANUFACTURER_FUJITSU)
            .setCharacteristic(this.platform.Characteristic.Model, this.accessory.context.model)
            .setCharacteristic(this.platform.Characteristic.SerialNumber, this.accessory.context.deviceId);
    }

    _refreshDynamicServiceCharacteristics() {
        this.platform.accessoryManager.refreshServiceCharacteristics(
            this.service,
            this.dynamicServiceCharacteristics
        );
    }

    _logMethodCall(methodName, value) {
        let logMessage = '[' + this.constructor.name + '] called ' + methodName;

        if (value) {
            logMessage = logMessage + ' with value: ' + value;
        }

        this.platform.log.debug(logMessage);
    }

    _logMethodCallResult(methodName, error, value) {
        let logMessage = '[' + this.constructor.name + '] call to ' + methodName;

        if (error) {
            logMessage = logMessage + ' unsuccessful, resulted in error: ' + error;
            this.platform.log.error(logMessage);
        } else {
            logMessage = logMessage + ' successful';
            if (value !== null) {
                logMessage = logMessage + ', resulted in value: ' + value;
            }

            this.platform.log.debug(logMessage);
        }
    }
}

module.exports = Accessory;
