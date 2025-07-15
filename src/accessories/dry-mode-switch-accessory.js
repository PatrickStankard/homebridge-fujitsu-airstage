'use strict';

const Accessory = require('./accessory');
const airstage = require('./../airstage');

class DryModeSwitchAccessory extends Accessory {

    constructor(platform, accessory) {
        super(platform, accessory);

        this.lastKnownOperationMode = null;

        this.service = (
            this.accessory.getService(this.Service.Switch) ||
            this.accessory.addService(this.Service.Switch)
        );

        this.service.getCharacteristic(this.Characteristic.On)
            .on('get', this.getOn.bind(this))
            .on('set', this.setOn.bind(this));

        this.service.getCharacteristic(this.Characteristic.Name)
            .on('get', this.getName.bind(this));
    }

    getOn(callback) {
        const methodName = this.getOn.name;

        this._logMethodCall(methodName);

        this.airstageClient.getPowerState(
            this.deviceId,
            (function(error, powerState) {
                let value = null;

                if (error) {
                    this._logMethodCallResult(methodName, error);

                    return callback(error, null);
                }

                if (powerState === airstage.constants.TOGGLE_OFF) {
                    value = false;

                    this._logMethodCallResult(methodName, null, value);

                    return callback(null, value);
                }

                this.airstageClient.getOperationMode(
                    this.deviceId,
                    (function(error, operationMode) {
                        let value = null;

                        if (error) {
                            this._logMethodCallResult(methodName, error);

                            return callback(error, null);
                        }

                        value = (operationMode === airstage.constants.OPERATION_MODE_DRY);

                        this._logMethodCallResult(methodName, null, value);

                        callback(null, value);
                    }).bind(this)
                );
            }).bind(this)
        );
    }

    setOn(value, callback) {
        const methodName = this.setOn.name;

        this._logMethodCall(methodName, value);

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

        this.airstageClient.getPowerState(
            this.deviceId,
            (function(error, powerState) {
                let value = null;

                if (error) {
                    this._logMethodCallResult(methodName, error);

                    return callback(error, null);
                }

                if (powerState === airstage.constants.TOGGLE_OFF) {
                    this.airstageClient.setPowerState(
                        this.deviceId,
                        airstage.constants.TOGGLE_ON,
                        (function(error) {
                            if (error) {
                                this._logMethodCallResult(methodName, error);

                                return callback(error);
                            }

                            this._setOperationMode(
                                methodName,
                                operationMode,
                                callback
                            );
                        }).bind(this)
                    );
                } else {
                    this._setOperationMode(
                        methodName,
                        operationMode,
                        callback
                    );
                }
            }).bind(this)
        );
    }

    getName(callback) {
        const methodName = this.getName.name;

        this._logMethodCall(methodName);

        this.airstageClient.getName(
            this.deviceId,
            (function(error, name) {
                if (error) {
                    this._logMethodCallResult(methodName, error);

                    return callback(error, null);
                }

                const value = name + ' Dry Mode Switch';

                this._logMethodCallResult(methodName, null, value);

                callback(null, value);
            }).bind(this)
        );
    }

    _setOperationMode(methodName, operationMode, callback) {
        this.airstageClient.getOperationMode(
            this.deviceId,
            (function(error, currentOperationMode) {
                if (error) {
                    this._logMethodCallResult(methodName, error);

                    return callback(error);
                }

                this.lastKnownOperationMode = currentOperationMode;

                this.airstageClient.setOperationMode(
                    this.deviceId,
                    operationMode,
                    (function(error) {
                        if (error) {
                            this._logMethodCallResult(methodName, error);

                            return callback(error);
                        }

                        this._logMethodCallResult(methodName, null, null);

                        this._refreshRelatedAccessoryCharacteristics();

                        callback(null);
                    }).bind(this)
                );
            }).bind(this)
        );
    }

    _refreshRelatedAccessoryCharacteristics() {
        const accessoryManager = this.platform.accessoryManager;

        accessoryManager.refreshThermostatAccessoryCharacteristics(this.deviceId);
        accessoryManager.refreshFanAccessoryCharacteristics(this.deviceId);
        accessoryManager.refreshVerticalAirflowDirectionAccessoryCharacteristics(this.deviceId);
        accessoryManager.refreshAutoFanSpeedSwitchAccessoryCharacteristics(this.deviceId);
        accessoryManager.refreshEconomySwitchAccessoryCharacteristics(this.deviceId);
        accessoryManager.refreshEnergySavingFanSwitchAccessoryCharacteristics(this.deviceId);
        accessoryManager.refreshFanModeSwitchAccessoryCharacteristics(this.deviceId);
        accessoryManager.refreshMinimumHeatModeSwitchAccessoryCharacteristics(this.deviceId);
        accessoryManager.refreshPowerfulSwitchAccessoryCharacteristics(this.deviceId);
    }
}

module.exports = DryModeSwitchAccessory;
