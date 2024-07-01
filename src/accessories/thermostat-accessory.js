'use strict';

const Accessory = require('./accessory');
const airstage = require('./../airstage');

class ThermostatAccessory extends Accessory {

    constructor(platform, accessory) {
        super(platform, accessory);

        this.service = (
            this.accessory.getService(this.Service.Thermostat) ||
            this.accessory.addService(this.Service.Thermostat)
        );

        this.dynamicServiceCharacteristics.push(this.Characteristic.CurrentHeatingCoolingState);
        this.service.getCharacteristic(this.Characteristic.CurrentHeatingCoolingState)
            .on('get', this.getCurrentHeatingCoolingState.bind(this));

        this.dynamicServiceCharacteristics.push(this.Characteristic.TargetHeatingCoolingState);
        this.service.getCharacteristic(this.Characteristic.TargetHeatingCoolingState)
            .on('get', this.getTargetHeatingCoolingState.bind(this))
            .on('set', this.setTargetHeatingCoolingState.bind(this));

        this.dynamicServiceCharacteristics.push(this.Characteristic.CurrentTemperature);
        this.service.getCharacteristic(this.Characteristic.CurrentTemperature)
            .on('get', this.getCurrentTemperature.bind(this));

        this.dynamicServiceCharacteristics.push(this.Characteristic.TargetTemperature);
        this.service.getCharacteristic(this.Characteristic.TargetTemperature)
            .on('get', this.getTargetTemperature.bind(this))
            .on('set', this.setTargetTemperature.bind(this));

        this.service.getCharacteristic(this.Characteristic.TemperatureDisplayUnits)
            .on('get', this.getTemperatureDisplayUnits.bind(this))
            .on('set', this.setTemperatureDisplayUnits.bind(this));

        this.service.getCharacteristic(this.Characteristic.Name)
            .on('get', this.getName.bind(this));
    }

    getCurrentHeatingCoolingState(callback) {
        const methodName = this.getCurrentHeatingCoolingState.name;

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
                        this.Characteristic.CurrentHeatingCoolingState.OFF
                    );
                }

                this.airstageClient.getOperationMode(
                    this.deviceId,
                    (function(error, operationMode) {
                        let currentHeatingCoolingState = null;

                        if (error) {
                            this._logMethodCallResult(methodName, error);

                            return callback(error, null);
                        }

                        if (operationMode === airstage.constants.OPERATION_MODE_AUTO) {
                            return this.airstageClient.getTemperatureDelta(
                                this.deviceId,
                                airstage.constants.TEMPERATURE_SCALE_CELSIUS,
                                (function(error, temperatureDelta) {
                                    if (error) {
                                        this._logMethodCallResult(methodName, error);

                                        return callback(error, null);
                                    }

                                    if (temperatureDelta > 0) {
                                        currentHeatingCoolingState = this.Characteristic.CurrentHeatingCoolingState.COOL;
                                    } else if (temperatureDelta < 0) {
                                        currentHeatingCoolingState = this.Characteristic.CurrentHeatingCoolingState.HEAT;
                                    } else {
                                        currentHeatingCoolingState = this.Characteristic.CurrentHeatingCoolingState.OFF;
                                    }

                                    this._logMethodCallResult(methodName, null, currentHeatingCoolingState);

                                    callback(null, currentHeatingCoolingState);
                                }).bind(this)
                            );
                        }

                        if (operationMode === airstage.constants.OPERATION_MODE_COOL) {
                            currentHeatingCoolingState = this.Characteristic.CurrentHeatingCoolingState.COOL;
                        } else if (operationMode === airstage.constants.OPERATION_MODE_DRY) {
                            currentHeatingCoolingState = this.Characteristic.CurrentHeatingCoolingState.COOL;
                        } else if (operationMode === airstage.constants.OPERATION_MODE_FAN) {
                            currentHeatingCoolingState = this.Characteristic.CurrentHeatingCoolingState.OFF;
                        } else if (operationMode === airstage.constants.OPERATION_MODE_HEAT) {
                            currentHeatingCoolingState = this.Characteristic.CurrentHeatingCoolingState.HEAT;
                        }

                        this._logMethodCallResult(methodName, null, currentHeatingCoolingState);

                        callback(null, currentHeatingCoolingState);
                    }).bind(this)
                );
            }).bind(this)
        );
    }

    getTargetHeatingCoolingState(callback) {
        const methodName = this.getTargetHeatingCoolingState.name;

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
                        this.Characteristic.TargetHeatingCoolingState.OFF
                    );
                }

                this.airstageClient.getOperationMode(
                    this.deviceId,
                    (function(error, operationMode) {
                        let targetHeatingCoolingState = null;

                        if (error) {
                            this._logMethodCallResult(methodName, error);

                            return callback(error, null);
                        }

                        if (operationMode === airstage.constants.OPERATION_MODE_COOL) {
                            targetHeatingCoolingState = this.Characteristic.TargetHeatingCoolingState.COOL;
                        } else if (operationMode === airstage.constants.OPERATION_MODE_DRY) {
                            targetHeatingCoolingState = this.Characteristic.TargetHeatingCoolingState.COOL;
                        } else if (operationMode === airstage.constants.OPERATION_MODE_FAN) {
                            targetHeatingCoolingState = this.Characteristic.TargetHeatingCoolingState.OFF;
                        } else if (operationMode === airstage.constants.OPERATION_MODE_HEAT) {
                            targetHeatingCoolingState = this.Characteristic.TargetHeatingCoolingState.HEAT;
                        } else if (operationMode === airstage.constants.OPERATION_MODE_AUTO) {
                            targetHeatingCoolingState = this.Characteristic.TargetHeatingCoolingState.AUTO;
                        }

                        this._logMethodCallResult(methodName, null, targetHeatingCoolingState);

                        callback(null, targetHeatingCoolingState);
                    }).bind(this)
                );
            }).bind(this)
        );
    }

    setTargetHeatingCoolingState(value, callback) {
        const methodName = this.setTargetHeatingCoolingState.name;

        this._logMethodCall(methodName, value);

        let operationMode = null;

        if (value === this.Characteristic.TargetHeatingCoolingState.COOL) {
            operationMode = airstage.constants.OPERATION_MODE_COOL;
        } else if (value === this.Characteristic.TargetHeatingCoolingState.HEAT) {
            operationMode = airstage.constants.OPERATION_MODE_HEAT;
        } else if (value === this.Characteristic.TargetHeatingCoolingState.AUTO) {
            operationMode = airstage.constants.OPERATION_MODE_AUTO;
        }

        this.airstageClient.getPowerState(
            this.deviceId,
            (function(error, powerState) {
                if (error) {
                    this._logMethodCallResult(methodName, error);

                    return callback(error, null);
                }

                if (value === this.Characteristic.TargetHeatingCoolingState.OFF) {
                    if (powerState === airstage.constants.TOGGLE_ON) {
                        this.airstageClient.setPowerState(
                            this.deviceId,
                            airstage.constants.TOGGLE_OFF,
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
                    } else if (powerState === airstage.constants.TOGGLE_OFF) {
                        callback(null);
                    }
                } else {
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

    getTargetTemperature(callback) {
        const methodName = this.getTargetTemperature.name;

        this._logMethodCall(methodName);

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

    setTargetTemperature(value, callback) {
        const methodName = this.setTargetTemperature.name;

        this._logMethodCall(methodName, value);

        this.airstageClient.setTargetTemperature(
            this.deviceId,
            value,
            airstage.constants.TEMPERATURE_SCALE_CELSIUS,
            (function (error) {
                if (error) {
                    this._logMethodCallResult(methodName, error);

                    return callback(error);
                }

                this._logMethodCallResult(methodName, null, null);

                this._refreshDynamicServiceCharacteristics();

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

                const value = name + ' Thermostat';

                this._logMethodCallResult(methodName, null, value);

                callback(null, value);
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

    _refreshRelatedAccessoryCharacteristics() {
        const accessoryManager = this.platform.accessoryManager;

        accessoryManager.refreshFanAccessoryCharacteristics(this.deviceId);
        accessoryManager.refreshVerticalAirflowDirectionAccessoryCharacteristics(this.deviceId);
        accessoryManager.refreshDryModeSwitchAccessoryCharacteristics(this.deviceId);
        accessoryManager.refreshEconomySwitchAccessoryCharacteristics(this.deviceId);
        accessoryManager.refreshEnergySavingFanSwitchAccessoryCharacteristics(this.deviceId);
        accessoryManager.refreshFanModeSwitchAccessoryCharacteristics(this.deviceId);
        accessoryManager.refreshMinimumHeatModeSwitchAccessoryCharacteristics(this.deviceId);
        accessoryManager.refreshPowerfulSwitchAccessoryCharacteristics(this.deviceId);
    }
}

module.exports = ThermostatAccessory;
