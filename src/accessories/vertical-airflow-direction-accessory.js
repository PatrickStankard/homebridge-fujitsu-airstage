'use strict';

const Accessory = require('./accessory');
const airstage = require('./../airstage');

class VerticalAirflowDirectionAccessory extends Accessory {

    constructor(platform, accessory) {
        super(platform, accessory);

        // Ideally we'd use the Slats service for this, but it's not supported
        // by Apple Home currently. Let's use the Fanv2 service instead
        this.service = (
            this.accessory.getService(this.Service.Fanv2) ||
            this.accessory.addService(this.Service.Fanv2)
        );

        this.dynamicServiceCharacteristics.push(this.Characteristic.Active);
        this.service.getCharacteristic(this.Characteristic.Active)
            .on('get', this.getActive.bind(this))
            .on('set', this.setActive.bind(this))

        this.dynamicServiceCharacteristics.push(this.Characteristic.CurrentFanState);
        this.service.getCharacteristic(this.Characteristic.CurrentFanState)
            .on('get', this.getCurrentFanState.bind(this));

        this.service.getCharacteristic(this.Characteristic.Name)
            .on('get', this.getName.bind(this));

        this.dynamicServiceCharacteristics.push(this.Characteristic.RotationSpeed);
        this.service.getCharacteristic(this.Characteristic.RotationSpeed)
            .on('get', this.getRotationSpeed.bind(this))
            .on('set', this.setRotationSpeed.bind(this));

        this._setAirflowVerticalDirectionHandle = null;
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

                if (powerState === airstage.constants.TOGGLE_OFF) {
                    value = this.Characteristic.Active.INACTIVE;

                    this._logMethodCallResult(methodName, null, value);

                    return callback(null, value);
                }

                this.airstageClient.getAirflowVerticalSwingState(
                    this.deviceId,
                    (function(error, swingState) {
                        let value = null;

                        if (error) {
                            this._logMethodCallResult(methodName, error);

                            return callback(error, null);
                        }

                        if (swingState === airstage.constants.TOGGLE_ON) {
                            value = this.Characteristic.Active.INACTIVE;
                        } else if (swingState === airstage.constants.TOGGLE_OFF) {
                            value = this.Characteristic.Active.ACTIVE;
                        }

                        this._logMethodCallResult(methodName, null, value);

                        callback(null, value);
                    }).bind(this)
                );
            }).bind(this)
        );
    }

    setActive(value, callback) {
        const methodName = this.setActive.name;

        this._logMethodCall(methodName, value);

        let swingState = null;

        if (value === this.Characteristic.Active.ACTIVE) {
            swingState = airstage.constants.TOGGLE_OFF;
        } else if (value === this.Characteristic.Active.INACTIVE) {
            swingState = airstage.constants.TOGGLE_ON;
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

                            this._setAirflowVerticalSwingState(
                                methodName,
                                swingState,
                                callback
                            );
                        }).bind(this)
                    );
                } else {
                    this._setAirflowVerticalSwingState(
                        methodName,
                        swingState,
                        callback
                    );
                }
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

                if (powerState === airstage.constants.TOGGLE_OFF) {
                    value = this.Characteristic.CurrentFanState.INACTIVE;

                    this._logMethodCallResult(methodName, null, value);

                    return callback(null, value);
                }

                this.airstageClient.getAirflowVerticalSwingState(
                    this.deviceId,
                    (function(error, swingState) {
                        if (error) {
                            this._logMethodCallResult(methodName, error);

                            return callback(error, null);
                        }

                        if (swingState === airstage.constants.TOGGLE_ON) {
                            value = this.Characteristic.CurrentFanState.IDLE;
                        } else if (swingState === airstage.constants.TOGGLE_OFF) {
                            value = this.Characteristic.CurrentFanState.BLOWING_AIR;
                        }

                        this._logMethodCallResult(methodName, null, value);

                        callback(null, value);
                    }).bind(this)
                );
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

                const value = name + ' Vertical Airflow Direction';

                this._logMethodCallResult(methodName, null, value);

                callback(null, value);
            }).bind(this)
        );
    }

    getRotationSpeed(callback) {
        const methodName = this.getRotationSpeed.name;

        this._logMethodCall(methodName);

        let value = null;

        this.airstageClient.getPowerState(
            this.deviceId,
            (function(error, powerState) {
                if (error) {
                    this._logMethodCallResult(methodName, error);

                    return callback(error, null);
                }

                if (powerState === airstage.constants.TOGGLE_OFF) {
                    value = 0;

                    this._logMethodCallResult(methodName, null, value);

                    return callback(null, value);
                }

                this.airstageClient.getAirflowVerticalDirection(
                    this.deviceId,
                    (function(error, airflowVerticalDirection) {
                        if (error) {
                            this._logMethodCallResult(methodName, error);

                            return callback(error, null);
                        }

                        if (airflowVerticalDirection === 1) {
                            value = 25;
                        } else if (airflowVerticalDirection === 2) {
                            value = 50;
                        } else if (airflowVerticalDirection === 3) {
                            value = 75
                        } else if (airflowVerticalDirection === 4) {
                            value = 100;
                        }

                        this._logMethodCallResult(methodName, null, value);

                        callback(null, value);
                    }).bind(this)
                );
            }).bind(this)
        );
    }

    setRotationSpeed(value, callback) {
        const methodName = this.setRotationSpeed.name;

        this._logMethodCall(methodName, value);

        let airflowVerticalDirection = null;

        if (value <= 25) {
            airflowVerticalDirection = 1;
        } else if (value <= 50) {
            airflowVerticalDirection = 2;
        } else if (value <= 75) {
            airflowVerticalDirection = 3;
        } else if (value <= 100) {
            airflowVerticalDirection = 4;
        }

        if (this._setAirflowVerticalDirectionHandle !== null) {
            clearTimeout(this._setAirflowVerticalDirectionHandle);
            this._setAirflowVerticalDirectionHandle = null;
        }

        this._setAirflowVerticalDirectionHandle = setTimeout(
            (function() {
                this._setAirflowVerticalDirection(
                    methodName,
                    airflowVerticalDirection
                );
            }).bind(this),
            500
        );

        callback(null);
    }

    _setAirflowVerticalSwingState(methodName, swingState, callback) {
        this.airstageClient.setAirflowVerticalSwingState(
            this.deviceId,
            swingState,
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

    _setAirflowVerticalDirection(methodName, airflowVerticalDirection) {
        this.airstageClient.setAirflowVerticalDirection(
            this.deviceId,
            airflowVerticalDirection,
            (function(error) {
                if (error) {
                    this._logMethodCallResult(methodName, error);

                    return;
                }

                this._logMethodCallResult(methodName, null, null);

                this._refreshDynamicServiceCharacteristics();

                this._setAirflowVerticalDirectionHandle = null;
            }).bind(this)
        );
    }

    _refreshRelatedAccessoryCharacteristics() {
        const accessoryManager = this.platform.accessoryManager;

        accessoryManager.refreshThermostatAccessoryCharacteristics(this.deviceId);
        accessoryManager.refreshFanAccessoryCharacteristics(this.deviceId);
        accessoryManager.refreshDryModeSwitchAccessoryCharacteristics(this.deviceId);
        accessoryManager.refreshEconomySwitchAccessoryCharacteristics(this.deviceId);
        accessoryManager.refreshEnergySavingFanSwitchAccessoryCharacteristics(this.deviceId);
        accessoryManager.refreshFanModeSwitchAccessoryCharacteristics(this.deviceId);
        accessoryManager.refreshMinimumHeatModeSwitchAccessoryCharacteristics(this.deviceId);
        accessoryManager.refreshPowerfulSwitchAccessoryCharacteristics(this.deviceId);
    }
}

module.exports = VerticalAirflowDirectionAccessory;
