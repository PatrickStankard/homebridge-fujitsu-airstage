'use strict';

const Accessory = require('./accessory');
const airstage = require('./../airstage');

class FanAccessory extends Accessory {

    constructor(platform, accessory) {
        super(platform, accessory);

        this.service = (
            this.accessory.getService(this.Service.Fanv2) ||
            this.accessory.addService(this.Service.Fanv2)
        );

        this.dynamicServiceCharacteristics.push(this.Characteristic.Active);
        this.service.getCharacteristic(this.Characteristic.Active)
            .on('get', this.getActive.bind(this))
            .on('set', this.setActive.bind(this));

        this.dynamicServiceCharacteristics.push(this.Characteristic.CurrentFanState);
        this.service.getCharacteristic(this.Characteristic.CurrentFanState)
            .on('get', this.getCurrentFanState.bind(this));

        this.dynamicServiceCharacteristics.push(this.Characteristic.TargetFanState);
        this.service.getCharacteristic(this.Characteristic.TargetFanState)
            .on('get', this.getTargetFanState.bind(this))
            .on('set', this.setTargetFanState.bind(this));

        this.service.getCharacteristic(this.Characteristic.Name)
            .on('get', this.getName.bind(this));

        this.dynamicServiceCharacteristics.push(this.Characteristic.RotationSpeed);
        this.service.getCharacteristic(this.Characteristic.RotationSpeed)
            .on('get', this.getRotationSpeed.bind(this))
            .on('set', this.setRotationSpeed.bind(this));

        this.service.getCharacteristic(this.Characteristic.SwingMode)
            .on('get', this.getSwingMode.bind(this))
            .on('set', this.setSwingMode.bind(this));

        this._setFanSpeedHandle = null;
    }

    getActive(callback) {
        const methodName = this.getActive.name;

        this._logMethodCall(methodName);

        this.airstageClient.getPowerState(
            this.deviceId,
            (function(error, powerState) {
                let value = null;

                if (error) {
                    this._logMethodCallResult(methodName, error);

                    return callback(error, null);
                }

                if (powerState === airstage.constants.TOGGLE_ON) {
                    value = this.Characteristic.Active.ACTIVE;
                } else if (powerState === airstage.constants.TOGGLE_OFF) {
                    value = this.Characteristic.Active.INACTIVE;
                }

                this._logMethodCallResult(methodName, null, value);

                callback(null, value);
            }).bind(this)
        );
    }

    setActive(value, callback) {
        const methodName = this.setActive.name;

        this._logMethodCall(methodName, value);

        let powerState = null;

        if (value === this.Characteristic.Active.ACTIVE) {
            powerState = airstage.constants.TOGGLE_ON;
        } else if (value === this.Characteristic.Active.INACTIVE) {
            powerState = airstage.constants.TOGGLE_OFF;
        }

        this.airstageClient.setPowerState(
            this.deviceId,
            powerState,
            (function(error) {
                if (error) {
                    this._logMethodCallResult(methodName, error);

                    return callback(error);
                }

                this._logMethodCallResult(methodName, null, null);

                this._refreshDynamicServiceCharacteristics();
                this._refreshRelatedAccessoryCharacteristics();

                callback(null);
            }).bind(this)
        );
    }

    getCurrentFanState(callback) {
        const methodName = this.getCurrentFanState.name;

        this._logMethodCall(methodName);

        this.airstageClient.getPowerState(
            this.deviceId,
            (function(error, powerState) {
                let value = null;

                if (error) {
                    this._logMethodCallResult(methodName, error);

                    return callback(error, null);
                }

                if (powerState === airstage.constants.TOGGLE_ON) {
                    value = this.Characteristic.CurrentFanState.BLOWING_AIR;
                } else if (powerState === airstage.constants.TOGGLE_OFF) {
                    value = this.Characteristic.CurrentFanState.INACTIVE;
                }

                this._logMethodCallResult(methodName, null, value);

                callback(null, value);
            }).bind(this)
        );
    }

    getTargetFanState(callback) {
        const methodName = this.getTargetFanState.name;

        this._logMethodCall(methodName);

        this.airstageClient.getFanSpeed(
            this.deviceId,
            (function(error, fanSpeed) {
                let value = null;

                if (error) {
                    this._logMethodCallResult(methodName, error);

                    return callback(error, null);
                }

                if (fanSpeed === airstage.constants.FAN_SPEED_AUTO) {
                    value = this.Characteristic.TargetFanState.AUTO;
                } else {
                    value = this.Characteristic.TargetFanState.MANUAL;
                }

                this._logMethodCallResult(methodName, null, value);

                callback(null, value);
            }).bind(this)
        );
    }

    setTargetFanState(value, callback) {
        const methodName = this.setTargetFanState.name;

        this._logMethodCall(methodName, value);

        if (value === this.Characteristic.TargetFanState.AUTO) {
            this.airstageClient.setFanSpeed(
                this.deviceId,
                airstage.constants.FAN_SPEED_AUTO,
                (function(error) {
                    if (error) {
                        this._logMethodCallResult(methodName, error);

                        return callback(error);
                    }

                    this._logMethodCallResult(methodName, null, null);

                    this._refreshDynamicServiceCharacteristics();

                    callback(null);
                }).bind(this)
            );
        } else {
            this._logMethodCallResult(methodName, null, null);

            callback(null);
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

                const value = name + ' Fan';

                this._logMethodCallResult(methodName, null, value);

                callback(null, value);
            }).bind(this)
        );
    }

    getRotationSpeed(callback) {
        const methodName = this.getRotationSpeed.name;

        this._logMethodCall(methodName);

        this.airstageClient.getFanSpeed(
            this.deviceId,
            (function(error, fanSpeed) {
                let value = null;

                if (error) {
                    this._logMethodCallResult(methodName, error);

                    return callback(error, null);
                }

                if (fanSpeed === airstage.constants.FAN_SPEED_AUTO) {
                    value = 0;
                } else if (fanSpeed === airstage.constants.FAN_SPEED_QUIET) {
                    value = 25;
                } else if (fanSpeed === airstage.constants.FAN_SPEED_LOW) {
                    value = 50;
                } else if (fanSpeed === airstage.constants.FAN_SPEED_MEDIUM) {
                    value = 75;
                } else if (fanSpeed === airstage.constants.FAN_SPEED_HIGH) {
                    value = 100;
                }

                this._logMethodCallResult(methodName, null, value);

                callback(null, value);
            }).bind(this)
        );
    }

    setRotationSpeed(value, callback, withSetTimeout = true) {
        const methodName = this.setRotationSpeed.name;

        this._logMethodCall(methodName, value);

        let fanSpeed = null;

        if (value <= 25) {
            fanSpeed = airstage.constants.FAN_SPEED_QUIET;
        } else if (value <= 50) {
            fanSpeed = airstage.constants.FAN_SPEED_LOW;
        } else if (value <= 75) {
            fanSpeed = airstage.constants.FAN_SPEED_MEDIUM;
        } else if (value <= 100) {
            fanSpeed = airstage.constants.FAN_SPEED_HIGH;
        }

        if (withSetTimeout) {
            if (this._setFanSpeedHandle !== null) {
                clearTimeout(this._setFanSpeedHandle);
                this._setFanSpeedHandle = null;
            }

            this._setFanSpeedHandle = setTimeout(
                (function() {
                    this._setFanSpeed(methodName, fanSpeed);
                }).bind(this),
                500
            );

            callback(null);
        } else {
            this._setFanSpeed(methodName, fanSpeed, callback);
        }
    }

    getSwingMode(callback) {
        const methodName = this.getSwingMode.name;

        this._logMethodCall(methodName);

        this.airstageClient.getAirflowVerticalSwingState(
            this.deviceId,
            (function(error, swingState) {
                let value = null;

                if (error) {
                    this._logMethodCallResult(methodName, error);

                    return callback(error, null);
                }

                if (swingState === airstage.constants.TOGGLE_ON) {
                    value = this.Characteristic.SwingMode.SWING_ENABLED;
                } else if (swingState === airstage.constants.TOGGLE_OFF) {
                    value = this.Characteristic.SwingMode.SWING_DISABLED;
                }

                this._logMethodCallResult(methodName, null, value);

                callback(null, value);
            }).bind(this)
        );
    }

    setSwingMode(value, callback) {
        const methodName = this.setSwingMode.name;

        this._logMethodCall(methodName, value);

        let swingState = null;

        if (value === this.Characteristic.SwingMode.SWING_ENABLED) {
            swingState = airstage.constants.TOGGLE_ON;
        } else if (value === this.Characteristic.SwingMode.SWING_DISABLED) {
            swingState = airstage.constants.TOGGLE_OFF;
        }

        this.airstageClient.setAirflowVerticalSwingState(
            this.deviceId,
            swingState,
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

    _setFanSpeed(methodName, fanSpeed, callback = null) {
        this.airstageClient.setFanSpeed(
            this.deviceId,
            fanSpeed,
            (function(error) {
                if (error) {
                    this._logMethodCallResult(methodName, error);

                    if (callback !== null) {
                        callback(error);
                    }

                    return;
                }

                this._logMethodCallResult(methodName, null, null);

                this._refreshDynamicServiceCharacteristics();

                this._setFanSpeedHandle = null;

                if (callback !== null) {
                    callback(null);
                }
            }).bind(this)
        );
    }

    _refreshRelatedAccessoryCharacteristics() {
        const accessoryManager = this.platform.accessoryManager;

        accessoryManager.refreshThermostatAccessoryCharacteristics(this.deviceId);
        accessoryManager.refreshVerticalAirflowDirectionAccessoryCharacteristics(this.deviceId);
        accessoryManager.refreshDryModeSwitchAccessoryCharacteristics(this.deviceId);
        accessoryManager.refreshEconomySwitchAccessoryCharacteristics(this.deviceId);
        accessoryManager.refreshEnergySavingFanSwitchAccessoryCharacteristics(this.deviceId);
        accessoryManager.refreshFanModeSwitchAccessoryCharacteristics(this.deviceId);
        accessoryManager.refreshMinimumHeatModeSwitchAccessoryCharacteristics(this.deviceId);
        accessoryManager.refreshPowerfulSwitchAccessoryCharacteristics(this.deviceId);
    }
}

module.exports = FanAccessory;
