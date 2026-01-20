'use strict';

const airstage = require('./../airstage');
const settings = require('./../settings');

class Accessory {

    constructor(platform, accessory) {
        this.platform = platform;
        this.accessory = accessory;
        this.dynamicServiceCharacteristics = [];
        this._characteristicState = {}; // Cache for change detection during polling

        this.Service = this.platform.Service;
        this.Characteristic = this.platform.Characteristic;

        this.deviceId = this.accessory.context.deviceId;
        this.airstageClient = this.accessory.context.airstageClient;

        // Register this wrapper in the WeakMap for state management during polling
        // WeakMap doesn't get serialized, avoiding circular reference errors
        this.platform.accessoryManager.registerAccessoryWrapper(this.accessory, this);

        this.accessory.getService(this.Service.AccessoryInformation)
            .setCharacteristic(this.Characteristic.Manufacturer, airstage.constants.MANUFACTURER_FUJITSU)
            .setCharacteristic(this.Characteristic.Model, this.accessory.context.model)
            .setCharacteristic(this.Characteristic.SerialNumber, this.accessory.context.deviceId)
            .setCharacteristic(this.Characteristic.FirmwareRevision, settings.PLUGIN_VERSION)
            .setCharacteristic(this.Characteristic.StatusFault, this.Characteristic.StatusFault.NO_FAULT);
    }

    _refreshDynamicServiceCharacteristics(onlyNotifyOnChange = false) {
        this.platform.accessoryManager.refreshServiceCharacteristics(
            this.service,
            this.dynamicServiceCharacteristics,
            onlyNotifyOnChange,
            this // Pass the accessory wrapper for state management
        );
    }

    _getLastKnownValue(characteristic) {
        const uuid = characteristic.UUID;
        return this._characteristicState[uuid];
    }

    _setLastKnownValue(characteristic, value) {
        const uuid = characteristic.UUID;
        this._characteristicState[uuid] = value;
    }

    _hasValueChanged(characteristic, newValue) {
        const lastValue = this._getLastKnownValue(characteristic);

        // If no previous value exists (first poll), always consider it changed
        if (lastValue === undefined) {
            return true;
        }

        // Compare values - handle both primitive and object types
        return lastValue !== newValue;
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

    _handleError(methodName, error, callback, includeNull = true) {
        this._logMethodCallResult(methodName, error);

        // Check if error indicates device is unreachable
        const errorMessage = error?.message || '';
        const isUnreachableError = errorMessage.includes('unreachable') ||
                                   errorMessage.includes('timeout') ||
                                   errorMessage.includes('ECONNREFUSED') ||
                                   errorMessage.includes('EHOSTUNREACH') ||
                                   errorMessage.includes('ETIMEDOUT') ||
                                   errorMessage.includes('ENETUNREACH');

        if (isUnreachableError) {
            // Update StatusFault to indicate device problem
            const infoService = this.accessory.getService(this.Service.AccessoryInformation);
            if (infoService) {
                infoService.setCharacteristic(
                    this.Characteristic.StatusFault,
                    this.Characteristic.StatusFault.GENERAL_FAULT
                );
            }

            this.platform.log.warn(
                `[${this.constructor.name}] Device ${this.deviceId} appears unreachable: ${errorMessage}`
            );
        } else {
            // For non-unreachable errors, ensure StatusFault is cleared
            const infoService = this.accessory.getService(this.Service.AccessoryInformation);
            if (infoService) {
                infoService.setCharacteristic(
                    this.Characteristic.StatusFault,
                    this.Characteristic.StatusFault.NO_FAULT
                );
            }
        }

        // Support both callback(error, null) and callback(error) patterns
        if (includeNull) {
            callback(error, null);
        } else {
            callback(error);
        }
    }
}

module.exports = Accessory;
