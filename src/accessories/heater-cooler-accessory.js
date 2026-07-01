'use strict';

const Accessory = require('./accessory');
const airstage = require('./../airstage');

class HeaterCoolerAccessory extends Accessory {

    constructor(platform, accessory) {
        super(platform, accessory);

        this.service = (
            this.accessory.getService(this.Service.HeaterCooler) ||
            this.accessory.addService(this.Service.HeaterCooler)
        );

        this.dynamicServiceCharacteristics.push(this.Characteristic.Active);
        this.service.getCharacteristic(this.Characteristic.Active)
            .on('get', this.getActive.bind(this))
            .on('set', this.setActive.bind(this));

        this.dynamicServiceCharacteristics.push(this.Characteristic.CurrentHeaterCoolerState);
        this.service.getCharacteristic(this.Characteristic.CurrentHeaterCoolerState)
            .on('get', this.getCurrentHeaterCoolerState.bind(this));

        this.dynamicServiceCharacteristics.push(this.Characteristic.TargetHeaterCoolerState);
        this.service.getCharacteristic(this.Characteristic.TargetHeaterCoolerState)
            .on('get', this.getTargetHeaterCoolerState.bind(this))
            .on('set', this.setTargetHeaterCoolerState.bind(this));

        this.dynamicServiceCharacteristics.push(this.Characteristic.CurrentTemperature);
        this.service.getCharacteristic(this.Characteristic.CurrentTemperature)
            .on('get', this.getCurrentTemperature.bind(this));

        this.dynamicServiceCharacteristics.push(this.Characteristic.CoolingThresholdTemperature);
        this.service.getCharacteristic(this.Characteristic.CoolingThresholdTemperature)
            .on('get', this.getCoolingThresholdTemperature.bind(this))
            .on('set', this.setCoolingThresholdTemperature.bind(this));

        this.dynamicServiceCharacteristics.push(this.Characteristic.HeatingThresholdTemperature);
        this.service.getCharacteristic(this.Characteristic.HeatingThresholdTemperature)
            .on('get', this.getHeatingThresholdTemperature.bind(this))
            .on('set', this.setHeatingThresholdTemperature.bind(this));

        this.service.getCharacteristic(this.Characteristic.TemperatureDisplayUnits)
            .on('get', this.getTemperatureDisplayUnits.bind(this))
            .on('set', this.setTemperatureDisplayUnits.bind(this));

        this.service.getCharacteristic(this.Characteristic.Name)
            .on('get', this.getName.bind(this));

        this.dynamicServiceCharacteristics.push(this.Characteristic.RotationSpeed);
        this.service.getCharacteristic(this.Characteristic.RotationSpeed)
            .on('get', this.getRotationSpeed.bind(this))
            .on('set', this.setRotationSpeed.bind(this));

        this.dynamicServiceCharacteristics.push(this.Characteristic.SwingMode);
        this.service.getCharacteristic(this.Characteristic.SwingMode)
            .on('get', this.getSwingMode.bind(this))
            .on('set', this.setSwingMode.bind(this));

        this._coolingThresholdTemperature = null;
        this._heatingThresholdTemperature = null;

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

                this._refreshDynamicServiceCharacteristics();
                this._refreshRelatedAccessoryCharacteristics();

                callback(null);
            }).bind(this)
        );
    }

    getCurrentHeaterCoolerState(callback) {
        const methodName = this.getCurrentHeaterCoolerState.name;

        this._logMethodCall(methodName);

        this.airstageClient.getPowerState(
            this.deviceId,
            (function(error, powerState) {
                if (error) {
                    this._logMethodCallResult(methodName, error);

                    return callback(error, null);
                }

                if (powerState === airstage.constants.TOGGLE_OFF) {
                    return callback(
                        null,
                        this.Characteristic.CurrentHeaterCoolerState.INACTIVE
                    );
                }

                this.airstageClient.getOperationMode(
                    this.deviceId,
                    (function(error, operationMode) {
                        let currentHeaterCoolerState = null;

                        if (error) {
                            this._logMethodCallResult(methodName, error);

                            return callback(error, null);
                        }

                        this.airstageClient.getTemperatureDelta(
                            this.deviceId,
                            airstage.constants.TEMPERATURE_SCALE_CELSIUS,
                            (function(error, temperatureDelta) {
                                if (error) {
                                    this._logMethodCallResult(methodName, error);

                                    return callback(error, null);
                                }

                                if (this._isOperationModeAuto(operationMode)) {
                                    if (temperatureDelta > 0) {
                                        currentHeaterCoolerState = this.Characteristic.CurrentHeaterCoolerState.COOLING;
                                    } else if (temperatureDelta < 0) {
                                        currentHeaterCoolerState = this.Characteristic.CurrentHeaterCoolerState.HEATING;
                                    } else {
                                        currentHeaterCoolerState = this.Characteristic.CurrentHeaterCoolerState.IDLE;
                                    }
                                } else if (this._isOperationModeCooling(operationMode)) {
                                    if (temperatureDelta > 0) {
                                        currentHeaterCoolerState = this.Characteristic.CurrentHeaterCoolerState.COOLING;
                                    } else {
                                        currentHeaterCoolerState = this.Characteristic.CurrentHeaterCoolerState.IDLE;
                                    }
                                } else if (this._isOperationModeHeating(operationMode)) {
                                    if (temperatureDelta < 0) {
                                        currentHeaterCoolerState = this.Characteristic.CurrentHeaterCoolerState.HEATING;
                                    } else {
                                        currentHeaterCoolerState = this.Characteristic.CurrentHeaterCoolerState.IDLE;
                                    }
                                } else {
                                    currentHeaterCoolerState = this.Characteristic.CurrentHeaterCoolerState.INACTIVE;
                                }

                                this._logMethodCallResult(methodName, null, currentHeaterCoolerState);

                                callback(null, currentHeaterCoolerState);
                            }).bind(this)
                        );
                    }).bind(this)
                );
            }).bind(this)
        );
    }

    getTargetHeaterCoolerState(callback) {
        const methodName = this.getTargetHeaterCoolerState.name;

        this._logMethodCall(methodName);

        this.airstageClient.getOperationMode(
            this.deviceId,
            (function(error, operationMode) {
                let targetHeaterCoolerState = null;

                if (error) {
                    this._logMethodCallResult(methodName, error);

                    return callback(error, null);
                }

                if (this._isOperationModeAuto(operationMode)) {
                    targetHeaterCoolerState = this.Characteristic.TargetHeaterCoolerState.AUTO;
                } else if (this._isOperationModeCooling(operationMode)) {
                    targetHeaterCoolerState = this.Characteristic.TargetHeaterCoolerState.COOL;
                } else if (this._isOperationModeHeating(operationMode)) {
                    targetHeaterCoolerState = this.Characteristic.TargetHeaterCoolerState.HEAT;
                }

                this._logMethodCallResult(methodName, null, targetHeaterCoolerState);

                callback(null, targetHeaterCoolerState);
            }).bind(this)
        );
    }

    setTargetHeaterCoolerState(value, callback) {
        const methodName = this.setTargetHeaterCoolerState.name;

        this._logMethodCall(methodName, value);

        let operationMode = null;

        if (value === this.Characteristic.TargetHeaterCoolerState.AUTO) {
            operationMode = airstage.constants.OPERATION_MODE_AUTO;
        } else if (value === this.Characteristic.TargetHeaterCoolerState.COOL) {
            operationMode = airstage.constants.OPERATION_MODE_COOL;
        } else if (value === this.Characteristic.TargetHeaterCoolerState.HEAT) {
            operationMode = airstage.constants.OPERATION_MODE_HEAT;
        }

        this.airstageClient.getPowerState(
            this.deviceId,
            (function(error, powerState) {
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
                } else if (powerState === airstage.constants.TOGGLE_ON) {
                    this._setOperationMode(
                        methodName,
                        operationMode,
                        callback
                    );
                }
            }).bind(this)
        );
    }

    getCurrentTemperature(callback) {
        const methodName = this.getCurrentTemperature.name;

        this._logMethodCall(methodName);

        this.airstageClient.getIndoorTemperature(
            this.deviceId,
            airstage.constants.TEMPERATURE_SCALE_CELSIUS,
            (function (error, indoorTemperature) {
                if (error) {
                    this._logMethodCallResult(methodName, error);

                    return callback(error, null);
                }

                this._logMethodCallResult(methodName, null, indoorTemperature);

                callback(null, indoorTemperature);
            }).bind(this)
        );
    }

    getCoolingThresholdTemperature(callback) {
        const methodName = this.getCoolingThresholdTemperature.name;

        this._logMethodCall(methodName);

        if (this._coolingThresholdTemperature !== null) {
            this._logMethodCallResult(methodName, null, this._coolingThresholdTemperature);

            return callback(null, this._coolingThresholdTemperature);
        }

        this._getTargetTemperature(
            methodName,
            (function (error, targetTemperature) {
                if (error) {
                    this._logMethodCallResult(methodName, error);

                    return callback(error, null);
                }

                this._coolingThresholdTemperature = targetTemperature;

                if (this._heatingThresholdTemperature === null) {
                    this._heatingThresholdTemperature = (this._coolingThresholdTemperature - 0.5);
                }

                this._logMethodCallResult(methodName, null, this._coolingThresholdTemperature);

                callback(null, this._coolingThresholdTemperature);
            }).bind(this)
        );
    }

    setCoolingThresholdTemperature(value, callback) {
        const methodName = this.setCoolingThresholdTemperature.name;

        this._logMethodCall(methodName);

        this._coolingThresholdTemperature = value;

        this._setTargetTemperature(
            methodName,
            (function(error, result) {
                if (error) {
                    this._logMethodCallResult(methodName, error);

                    return callback(error);
                }

                this._coolingThresholdTemperature = result;

                callback(null);
            }).bind(this)
        );
    }

    getHeatingThresholdTemperature(callback) {
        const methodName = this.getHeatingThresholdTemperature.name;

        this._logMethodCall(methodName);

        if (this._heatingThresholdTemperature !== null) {
            this._logMethodCallResult(methodName, null, this._heatingThresholdTemperature);

            return callback(null, this._heatingThresholdTemperature);
        }

        this._getTargetTemperature(
            methodName,
            (function (error, targetTemperature) {
                if (error) {
                    this._logMethodCallResult(methodName, error);

                    return callback(error, null);
                }

                this._heatingThresholdTemperature = targetTemperature;

                if (this._coolingThresholdTemperature === null) {
                    this._coolingThresholdTemperature = (this._heatingThresholdTemperature + 0.5);
                }

                this._logMethodCallResult(methodName, null, this._heatingThresholdTemperature);

                callback(null, this._heatingThresholdTemperature);
            }).bind(this)
        );
    }

    setHeatingThresholdTemperature(value, callback) {
        const methodName = this.setHeatingThresholdTemperature.name;

        this._logMethodCall(methodName);

        this._heatingThresholdTemperature = value;

        this._setTargetTemperature(
            methodName,
            (function(error, result) {
                if (error) {
                    this._logMethodCallResult(methodName, error);

                    return callback(error);
                }

                this._heatingThresholdTemperature = result;

                callback(null);
            }).bind(this)
        );
    }

    getTemperatureDisplayUnits(callback) {
        const methodName = this.getTemperatureDisplayUnits.name;

        this._logMethodCall(methodName);

        this.airstageClient.getTemperatureScale(
            (function (error, temperatureScale) {
                let temperatureDisplayUnits = null;

                if (error) {
                    this._logMethodCallResult(methodName, error);

                    return callback(error, null);
                }

                if (temperatureScale === airstage.constants.TEMPERATURE_SCALE_CELSIUS) {
                    temperatureDisplayUnits = this.Characteristic.TemperatureDisplayUnits.CELSIUS;
                } else if (temperatureScale === airstage.constants.TEMPERATURE_SCALE_FAHRENHEIT) {
                    temperatureDisplayUnits = this.Characteristic.TemperatureDisplayUnits.FAHRENHEIT;
                }

                this._logMethodCallResult(methodName, null, temperatureDisplayUnits);

                callback(null, temperatureDisplayUnits);
            }).bind(this)
        );
    }

    setTemperatureDisplayUnits(value, callback) {
        const methodName = this.setTemperatureDisplayUnits.name;

        this._logMethodCall(methodName, value);

        let temperatureScale = null;

        if (value === this.Characteristic.TemperatureDisplayUnits.FAHRENHEIT) {
            temperatureScale = airstage.constants.TEMPERATURE_SCALE_FAHRENHEIT;
        } else if (value === this.Characteristic.TemperatureDisplayUnits.CELSIUS) {
            temperatureScale = airstage.constants.TEMPERATURE_SCALE_CELSIUS;
        }

        this.airstageClient.setTemperatureScale(
            temperatureScale,
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

                const value = name + ' Heater Cooler';

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

    _getTargetTemperature(methodName, callback) {
        this.airstageClient.getTargetTemperature(
            this.deviceId,
            airstage.constants.TEMPERATURE_SCALE_CELSIUS,
            (function (error, targetTemperature) {
                if (error) {
                    this._logMethodCallResult(methodName, error);

                    return callback(error, null);
                }

                this._logMethodCallResult(methodName, null, targetTemperature);

                callback(null, targetTemperature);
            }).bind(this)
        );
    }

    _setTargetTemperature(methodName, callback) {
        this.airstageClient.getOperationMode(
            this.deviceId,
            (function(error, operationMode) {
                let targetTemperature = null;

                if (error) {
                    this._logMethodCallResult(methodName, error);

                    return callback(error, null);
                }

                if (this._isOperationModeAuto(operationMode)) {
                    targetTemperature = ((this._coolingThresholdTemperature + this._heatingThresholdTemperature) / 2);

                    this._coolingThresholdTemperature = (targetTemperature + 0.5);
                    this._heatingThresholdTemperature = (targetTemperature - 0.5);
                } else if (this._isOperationModeCooling(operationMode)) {
                    targetTemperature = this._coolingThresholdTemperature;
                } else if (this._isOperationModeHeating(operationMode)) {
                    targetTemperature = this._heatingThresholdTemperature;
                }

                this.airstageClient.setTargetTemperature(
                    this.deviceId,
                    targetTemperature,
                    airstage.constants.TEMPERATURE_SCALE_CELSIUS,
                    (function (error) {
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
                this._refreshRelatedAccessoryCharacteristics();

                this._setFanSpeedHandle = null;

                if (callback !== null) {
                    callback(null);
                }
            }).bind(this)
        );
    }

    _setOperationMode(methodName, operationMode, callback) {
        this.airstageClient.setOperationMode(
            this.deviceId,
            operationMode,
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

    _isOperationModeAuto(operationMode) {
        return operationMode === airstage.constants.OPERATION_MODE_AUTO;
    }

    _isOperationModeCooling(operationMode) {
        return (
            operationMode === airstage.constants.OPERATION_MODE_COOL ||
            operationMode === airstage.constants.OPERATION_MODE_DRY
        );
    }

    _isOperationModeHeating(operationMode) {
        return operationMode === airstage.constants.OPERATION_MODE_HEAT;
    }

    _refreshRelatedAccessoryCharacteristics() {
        const accessoryManager = this.platform.accessoryManager;

        accessoryManager.refreshThermostatAccessoryCharacteristics(this.deviceId);
        accessoryManager.refreshFanAccessoryCharacteristics(this.deviceId);
        accessoryManager.refreshVerticalAirflowDirectionAccessoryCharacteristics(this.deviceId);
        accessoryManager.refreshAutoFanSpeedSwitchAccessoryCharacteristics(this.deviceId);
        accessoryManager.refreshDryModeSwitchAccessoryCharacteristics(this.deviceId);
        accessoryManager.refreshEconomySwitchAccessoryCharacteristics(this.deviceId);
        accessoryManager.refreshEnergySavingFanSwitchAccessoryCharacteristics(this.deviceId);
        accessoryManager.refreshFanModeSwitchAccessoryCharacteristics(this.deviceId);
        accessoryManager.refreshMinimumHeatModeSwitchAccessoryCharacteristics(this.deviceId);
        accessoryManager.refreshPowerfulSwitchAccessoryCharacteristics(this.deviceId);
    }
}

module.exports = HeaterCoolerAccessory;
