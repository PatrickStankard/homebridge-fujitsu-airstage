'use strict';

const Accessory = require('./accessory');
const airstage = require('./../airstage');

class FanModeSwitchAccessory extends Accessory {

    constructor(platform, accessory) {
        super(platform, accessory);

        this.lastKnownFanSpeed = null;

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

                this.airstageClient.getFanSpeed(
                    this.deviceId,
                    (function(error, fanSpeed) {
                        let value = null;

                        if (error) {
                            this._logMethodCallResult(methodName, error);

                            return callback(error, null);
                        }

                        value = (fanSpeed === airstage.constants.FAN_SPEED_AUTO);

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

        let fanSpeed = null;

        if (value) {
            fanSpeed = airstage.constants.FAN_SPEED_AUTO;
        } else {
            if (this.lastKnownFanSpeed !== null) {
                fanSpeed = this.lastKnownFanSpeed;
            } else {
                fanSpeed = airstage.constants.FAN_SPEED_LOW;
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

                            this._setFanSpeed(
                                methodName,
                                fanSpeed,
                                callback
                            );
                        }).bind(this)
                    );
                } else {
                    this._setFanSpeed(
                        methodName,
                        fanSpeed,
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

                const value = name + ' Auto Fan Speed Switch';

                this._logMethodCallResult(methodName, null, value);

                callback(null, value);
            }).bind(this)
        );
    }

    _setFanSpeed(methodName, fanSpeed, callback) {
        this.airstageClient.getFanSpeed(
            this.deviceId,
            (function(error, currentFanSpeed) {
                if (error) {
                    this._logMethodCallResult(methodName, error);

                    return callback(error, null);
                }

                this.lastKnownFanSpeed = currentFanSpeed;

                this.airstageClient.setFanSpeed(
                    this.deviceId,
                    fanSpeed,
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
        accessoryManager.refreshDryModeSwitchAccessoryCharacteristics(this.deviceId);
        accessoryManager.refreshEconomySwitchAccessoryCharacteristics(this.deviceId);
        accessoryManager.refreshEnergySavingFanSwitchAccessoryCharacteristics(this.deviceId);
        accessoryManager.refreshMinimumHeatModeSwitchAccessoryCharacteristics(this.deviceId);
        accessoryManager.refreshPowerfulSwitchAccessoryCharacteristics(this.deviceId);
    }
}

module.exports = FanModeSwitchAccessory;
