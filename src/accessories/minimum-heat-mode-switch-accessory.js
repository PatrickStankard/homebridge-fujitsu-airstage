'use strict';

const Accessory = require('./accessory');
const airstage = require('./../airstage');

class MinimumHeatModeSwitchAccessory extends Accessory {

    constructor(platform, accessory) {
        super(platform, accessory);

        this.lastKnownOperationMode = null;
        this.lastKnownTargetTemperature = null;

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
        const methodName = this.getOn.name;

        this._logMethodCall(methodName);

        this.airstageClient.getMinimumHeatState(
            this.deviceId,
            (function(error, minimumHeatState) {
                let value = null;

                if (error) {
                    this._logMethodCallResult(methodName, error);

                    return callback(error, null);
                }

                if (minimumHeatState === airstage.constants.TOGGLE_ON) {
                    value = true;
                } else if (minimumHeatState === airstage.constants.TOGGLE_OFF) {
                    value = false;
                }

                this._logMethodCallResult(methodName, null, value);

                callback(null, value);
            }).bind(this)
        );
    }

    setOn(value, callback) {
        const methodName = this.setOn.name;

        this._logMethodCall(methodName, value);

        let minimumHeatState = null;

        if (value) {
            minimumHeatState = airstage.constants.TOGGLE_ON;
        } else {
            minimumHeatState = airstage.constants.TOGGLE_OFF;
        }

        if (minimumHeatState === airstage.constants.TOGGLE_ON) {
            this.airstageClient.getOperationMode(
                this.deviceId,
                (function(error, operationMode) {
                    if (error) {
                        this._logMethodCallResult(methodName, error);

                        return callback(error);
                    }

                    this.lastKnownOperationMode = operationMode;

                    this.airstageClient.getTargetTemperature(
                        this.deviceId,
                        airstage.constants.TEMPERATURE_SCALE_CELSIUS,
                        (function(error, targetTemperature) {
                            if (error) {
                                this._logMethodCallResult(methodName, error);

                                return callback(error);
                            }

                            this.lastKnownTargetTemperature = targetTemperature;

                            this.airstageClient.setMinimumHeatState(
                                this.deviceId,
                                minimumHeatState,
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
                }).bind(this)
            );
        } else {
            this.airstageClient.setMinimumHeatState(
                this.deviceId,
                minimumHeatState,
                (function(error) {
                    if (error) {
                        this._logMethodCallResult(methodName, error);

                        return callback(error);
                    }

                    this._logMethodCallResult(methodName, null, null);

                    this._refreshRelatedAccessoryCharacteristics();

                    callback(null);

                    if (this.lastKnownOperationMode !== null) {
                        this.airstageClient.setOperationMode(
                            this.deviceId,
                            this.lastKnownOperationMode,
                            (function(error) {
                                if (error) {
                                    this._logMethodCallResult(methodName, error);

                                    return callback(error);
                                }

                                this.lastKnownOperationMode = null;

                                this._refreshRelatedAccessoryCharacteristics();
                            }).bind(this)
                        );
                    }

                    if (this.lastKnownTargetTemperature !== null) {
                        this.airstageClient.setTargetTemperature(
                            this.deviceId,
                            this.lastKnownTargetTemperature,
                            airstage.constants.TEMPERATURE_SCALE_CELSIUS,
                            (function(error) {
                                if (error) {
                                    this._logMethodCallResult(methodName, error);

                                    return callback(error);
                                }

                                this.lastKnownTargetTemperature = null;

                                this._refreshRelatedAccessoryCharacteristics();
                            }).bind(this)
                        );
                    }
                }).bind(this)
            );
        }
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

                const value = name + ' Minimum Heat Mode Switch';

                this._logMethodCallResult(methodName, null, value);

                callback(null, value);
            }).bind(this)
        );
    }

    _refreshRelatedAccessoryCharacteristics() {
        const accessoryManager = this.platform.accessoryManager;

        accessoryManager.refreshThermostatAccessoryCharacteristics(this.deviceId);
        accessoryManager.refreshFanAccessoryCharacteristics(this.deviceId);
        accessoryManager.refreshFanModeSwitchAccessoryCharacteristics(this.deviceId);
        accessoryManager.refreshDryModeSwitchAccessoryCharacteristics(this.deviceId);
    }
}

module.exports = MinimumHeatSwitchAccessory;
