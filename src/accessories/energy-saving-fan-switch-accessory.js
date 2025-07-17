'use strict';

const Accessory = require('./accessory');
const airstage = require('./../airstage');

class EnergySavingFanSwitchAccessory extends Accessory {

    constructor(platform, accessory) {
        super(platform, accessory);

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

                this.airstageClient.getEnergySavingFanState(
                    this.deviceId,
                    (function(error, energySavingFanState) {
                        let value = null;

                        if (error) {
                            this._logMethodCallResult(methodName, error);

                            return callback(error, null);
                        }

                        if (energySavingFanState === airstage.constants.TOGGLE_ON) {
                            value = true;
                        } else if (energySavingFanState === airstage.constants.TOGGLE_OFF) {
                            value = false;
                        }

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

        let energySavingFanState = null;

        if (value) {
            energySavingFanState = airstage.constants.TOGGLE_ON;
        } else {
            energySavingFanState = airstage.constants.TOGGLE_OFF;
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

                            this._setEnergySavingFanState(
                                methodName,
                                energySavingFanState,
                                callback
                            );
                        }).bind(this)
                    );
                } else {
                    this._setEnergySavingFanState(
                        methodName,
                        energySavingFanState,
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

                const value = name + ' Energy Saving Fan Switch';

                this._logMethodCallResult(methodName, null, value);

                callback(null, value);
            }).bind(this)
        );
    }

    _setEnergySavingFanState(methodName, energySavingFanState, callback) {
        this.airstageClient.setEnergySavingFanState(
            this.deviceId,
            energySavingFanState,
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
    }

    _refreshRelatedAccessoryCharacteristics() {
        const accessoryManager = this.platform.accessoryManager;

        accessoryManager.refreshThermostatAccessoryCharacteristics(this.deviceId);
        accessoryManager.refreshFanAccessoryCharacteristics(this.deviceId);
        accessoryManager.refreshVerticalAirflowDirectionAccessoryCharacteristics(this.deviceId);
        accessoryManager.refreshAutoFanSpeedSwitchAccessoryCharacteristics(this.deviceId);
        accessoryManager.refreshDryModeSwitchAccessoryCharacteristics(this.deviceId);
        accessoryManager.refreshEconomySwitchAccessoryCharacteristics(this.deviceId);
        accessoryManager.refreshFanModeSwitchAccessoryCharacteristics(this.deviceId);
        accessoryManager.refreshMinimumHeatModeSwitchAccessoryCharacteristics(this.deviceId);
        accessoryManager.refreshPowerfulSwitchAccessoryCharacteristics(this.deviceId);
    }
}

module.exports = EnergySavingFanSwitchAccessory;
