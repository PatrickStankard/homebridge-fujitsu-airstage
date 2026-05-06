'use strict';

const airstage = require('./../airstage');

class Accessory {

    constructor(platform, accessory) {
        this.platform = platform;
        this.accessory = accessory;
        this.dynamicServiceCharacteristics = [];

        this.Service = this.platform.Service;
        this.Characteristic = this.platform.Characteristic;

        this.deviceId = this.accessory.context.deviceId;
        this.airstageClient = this.accessory.context.airstageClient;

        this.accessory.getService(this.Service.AccessoryInformation)
            .setCharacteristic(this.Characteristic.Manufacturer, airstage.constants.MANUFACTURER_FUJITSU)
            .setCharacteristic(this.Characteristic.Model, this.accessory.context.model)
            .setCharacteristic(this.Characteristic.SerialNumber, this.accessory.context.deviceId)
            .setCharacteristic(this.Characteristic.StatusFault, this.Characteristic.StatusFault.NO_FAULT);
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
    _handleError(methodName, error, callback, includeNull = true) {
        this._logMethodCallResult(methodName, error);

        // Prefer the Node errno code (unambiguous). Fall back to a
        // word-boundary message match so substrings like "timeout" inside
        // unrelated API error text don't trigger false positives.
        const unreachableCodes = new Set([
            'ECONNREFUSED', 'EHOSTUNREACH', 'ETIMEDOUT', 'ENETUNREACH', 'ENOTFOUND', 'ECONNRESET'
        ]);
        const errorCode = (error && typeof error === 'object' && error.code) || '';
        const errorMessage = ((error && error.message) || '').toLowerCase();
        const isUnreachableError = unreachableCodes.has(errorCode) ||
                                   /\b(unreachable|timed[\s-]?out|timeout)\b/.test(errorMessage);

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
                `[${this.constructor.name}] Device ${this.deviceId} appears unreachable: ${error?.message || errorCode || error}`
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
