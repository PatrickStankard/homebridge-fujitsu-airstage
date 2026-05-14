'use strict';

const api = require('./api');
const constants = require('./../constants');

class Client {

    constructor(
        localDevices,
        temperatureScalePreference,
        userAgent = null
    ) {
        this.localDevices = localDevices;
        this.temperatureScalePreference = temperatureScalePreference;

        this._apiClient = new api.Client(
            userAgent || null
        );

        this.resetDeviceCache();
        this._setDeviceIdToLocalDeviceMap();
    }

    getTemperatureScale(callback) {
        if (constants.TEMPERATURE_SCALES.includes(this.temperatureScalePreference) === false) {
            return callback('Invalid temperature scale: ' + this.temperatureScalePreference, null);
        }

        callback(null, this.temperatureScalePreference);
    }

    setTemperatureScale(scale, callback) {
        if (constants.TEMPERATURE_SCALES.includes(scale) === false) {
            return callback('Invalid temperature scale: ' + scale, null);
        }

        this.temperatureScalePreference = scale;

        callback(null, this.temperatureScalePreference);
    }

    getName(deviceId, callback) {
        const displayName = this._getDisplayNameForDeviceId(deviceId);

        if (displayName === null) {
            return callback('Could not determine name for device ID: ' + deviceId, null);
        }

        callback(null, displayName);
    }

    getModel(deviceId, callback) {
        this.getParameter(
            deviceId,
            constants.PARAMETER_MODEL,
            (function(error, parameterValue) {
                let result = null;

                if (error) {
                    return callback(error, null);
                }

                callback(null, parameterValue);
            }).bind(this)
        );
    }

    getPowerState(deviceId, callback) {
        this.getParameter(
            deviceId,
            constants.PARAMETER_ON_OFF,
            (function(error, parameterValue) {
                let result = null;

                if (error) {
                    return callback(error, null);
                }

                result = this._parameterValueToToggle(parameterValue);

                callback(null, result);
            }).bind(this)
        );
    }

    setPowerState(deviceId, toggle, callback) {
        const parameterValue = this._toggleToParameterValue(toggle);

        this.setParameter(
            deviceId,
            constants.PARAMETER_ON_OFF,
            parameterValue,
            (function(error, device) {
                let result = null;

                if (error) {
                    return callback(error, null);
                }

                if (device.parameters) {
                    result = this._parameterValueToToggle(
                        device.parameters[constants.PARAMETER_ON_OFF]
                    );
                }

                callback(null, result);
            }).bind(this)
        );
    }

    getOperationMode(deviceId, callback) {
        this.getParameter(
            deviceId,
            constants.PARAMETER_OPERATION_MODE,
            (function(error, parameterValue) {
                let result = null;

                if (error) {
                    return callback(error, null);
                }

                result = this._parameterValueToOperationMode(parameterValue);

                callback(null, result);
            }).bind(this)
        );
    }

    setOperationMode(deviceId, operationMode, callback) {
        const parameterValue = this._operationModeToParameterValue(operationMode);

        this.setParameter(
            deviceId,
            constants.PARAMETER_OPERATION_MODE,
            parameterValue,
            (function(error, device) {
                let result = null;

                if (error) {
                    return callback(error, null);
                }

                if (operationMode === constants.OPERATION_MODE_DRY) {
                    // These things automatically happen on the device side
                    // when turning on dry mode, so let's update
                    // them in the local device cache:
                    // - The fan speed is set to "AUTO"
                    this._setDeviceParameterCache(
                        deviceId,
                        {
                            'parameters': [
                                {
                                    'name': constants.PARAMETER_FAN_SPEED,
                                    'value': constants.PARAMETER_FAN_SPEED_AUTO
                                }
                            ]
                        }
                    );
                }

                if (device.parameters) {
                    result = this._parameterValueToOperationMode(
                        device.parameters[constants.PARAMETER_OPERATION_MODE]
                    );
                }

                callback(null, result);
            }).bind(this)
        );
    }

    getIndoorTemperature(deviceId, scale, callback) {
        this.getParameter(
            deviceId,
            constants.PARAMETER_INDOOR_TEMPERATURE,
            (function(error, parameterValue) {
                let result = null;

                if (error) {
                    return callback(error, null);
                }

                if (parameterValue !== null) {
                    result = this._indoorIntValueToTemperature(parameterValue);

                    if (scale === constants.TEMPERATURE_SCALE_FAHRENHEIT) {
                        result = this._celsiusToFahrenheit(result);
                    }
                }

                callback(null, result);
            }).bind(this)
        );
    }

    getTargetTemperature(deviceId, scale, callback) {
        this.getParameter(
            deviceId,
            constants.PARAMETER_SET_TEMPERATURE,
            (function(error, parameterValue) {
                let result = null;

                if (error) {
                    return callback(error, null);
                }

                result = this._intValueToTemperature(parameterValue);

                if (scale === constants.TEMPERATURE_SCALE_FAHRENHEIT) {
                    result = this._celsiusToFahrenheit(result);
                }

                callback(null, result);
            }).bind(this)
        );
    }

    setTargetTemperature(deviceId, temperature, scale, callback) {
        let intValue = null;

        if (scale === constants.TEMPERATURE_SCALE_FAHRENHEIT) {
            temperature = this._fahrenheitToCelsius(temperature);
        } else if (scale === constants.TEMPERATURE_SCALE_CELSIUS) {
            temperature = this._getClosestValidTemperature(
                temperature,
                constants.TEMPERATURE_SCALE_CELSIUS
            );
        }

        intValue = this._temperatureToIntValue(temperature);

        this.setParameter(
            deviceId,
            constants.PARAMETER_SET_TEMPERATURE,
            intValue.toString(),
            (function(error, device) {
                let result = null;
                let parameterValue = null;

                if (error) {
                    return callback(error, null);
                }

                if (device.parameters) {
                    parameterValue = device.parameters[constants.PARAMETER_SET_TEMPERATURE];
                    result = this._intValueToTemperature(parameterValue);

                    if (scale === constants.TEMPERATURE_SCALE_FAHRENHEIT) {
                        result = this._celsiusToFahrenheit(result);
                    }
                }

                callback(null, result);
            }).bind(this)
        );
    }

    getTemperatureDelta(deviceId, scale, callback) {
        this.getIndoorTemperature(deviceId, scale, (function(error, indoorTemperature) {
            if (error) {
                return callback(error, null);
            }

            this.getTargetTemperature(deviceId, scale, (function(error, targetTemperature) {
                let temperatureDelta = null;

                if (error) {
                    return callback(error, null);
                }

                temperatureDelta = (indoorTemperature - targetTemperature);

                callback(null, temperatureDelta);
            }).bind(this));
        }).bind(this));
    }

    getFanSpeed(deviceId, callback) {
        this.getParameter(
            deviceId,
            constants.PARAMETER_FAN_SPEED,
            (function(error, parameterValue) {
                let result = null;

                if (error) {
                    return callback(error, null);
                }

                result = this._parameterValueToFanSpeed(parameterValue);

                callback(null, result);
            }).bind(this)
        );
    }

    setFanSpeed(deviceId, fanSpeed, callback) {
        const parameterValue = this._fanSpeedToParameterValue(fanSpeed);

        this.setParameter(
            deviceId,
            constants.PARAMETER_FAN_SPEED,
            parameterValue,
            (function(error, device) {
                let result = null;

                if (error) {
                    return callback(error, null);
                }

                if (device.parameters) {
                    result = this._parameterValueToFanSpeed(
                        device.parameters[constants.PARAMETER_FAN_SPEED]
                    );
                }

                callback(null, result);
            }).bind(this)
        );
    }

    getAirflowVerticalDirection(deviceId, callback) {
        this.getParameter(
            deviceId,
            constants.PARAMETER_AIRFLOW_VERTICAL_DIRECTION,
            (function(error, parameterValue) {
                let result = null;

                if (error) {
                    return callback(error, null);
                }

                result = this._validateAirflowVerticalDirectionValue(
                    parseInt(parameterValue)
                );

                callback(null, result);
            }).bind(this)
        );
    }

    setAirflowVerticalDirection(deviceId, value, callback) {
        const parameterValue = this._validateAirflowVerticalDirectionValue(value).toString();

        this.setParameter(
            deviceId,
            constants.PARAMETER_AIRFLOW_VERTICAL_DIRECTION,
            parameterValue,
            (function(error, device) {
                let result = null;

                if (error) {
                    return callback(error, null);
                }

                if (device.parameters) {
                    result = this._validateAirflowVerticalDirectionValue(
                        parseInt(device.parameters[constants.PARAMETER_AIRFLOW_VERTICAL_DIRECTION])
                    );
                }

                callback(null, result);
            }).bind(this)
        );
    }

    getAirflowVerticalSwingState(deviceId, callback) {
        this.getParameter(
            deviceId,
            constants.PARAMETER_AIRFLOW_VERTICAL_SWING,
            (function(error, parameterValue) {
                let result = null;

                if (error) {
                    return callback(error, null);
                }

                result = this._parameterValueToToggle(parameterValue);

                callback(null, result);
            }).bind(this)
        );
    }

    setAirflowVerticalSwingState(deviceId, toggle, callback) {
        const parameterValue = this._toggleToParameterValue(toggle);

        this.setParameter(
            deviceId,
            constants.PARAMETER_AIRFLOW_VERTICAL_SWING,
            parameterValue,
            (function(error, device) {
                let result = null;

                if (error) {
                    return callback(error, null);
                }

                if (device.parameters) {
                    result = this._parameterValueToToggle(
                        device.parameters[constants.PARAMETER_AIRFLOW_VERTICAL_SWING]
                    );
                }

                callback(null, result);
            }).bind(this)
        );
    }

    getPowerfulState(deviceId, callback) {
        this.getParameter(
            deviceId,
            constants.PARAMETER_POWERFUL,
            (function(error, parameterValue) {
                let result = null;

                if (error) {
                    return callback(error, null);
                }

                result = this._parameterValueToToggle(parameterValue);

                callback(null, result);
            }).bind(this)
        );
    }

    setPowerfulState(deviceId, toggle, callback) {
        const parameterValue = this._toggleToParameterValue(toggle);

        this.setParameter(
            deviceId,
            constants.PARAMETER_POWERFUL,
            parameterValue,
            (function(error, device) {
                let result = null;

                if (error) {
                    return callback(error, null);
                }

                if (device.parameters) {
                    result = this._parameterValueToToggle(
                        device.parameters[constants.PARAMETER_POWERFUL]
                    );
                }

                callback(null, result);
            }).bind(this)
        );
    }

    getEconomyState(deviceId, callback) {
        this.getParameter(
            deviceId,
            constants.PARAMETER_ECONOMY,
            (function(error, parameterValue) {
                let result = null;

                if (error) {
                    return callback(error, null);
                }

                result = this._parameterValueToToggle(parameterValue);

                callback(null, result);
            }).bind(this)
        );
    }

    setEconomyState(deviceId, toggle, callback) {
        const parameterValue = this._toggleToParameterValue(toggle);

        this.setParameter(
            deviceId,
            constants.PARAMETER_ECONOMY,
            parameterValue,
            (function(error, device) {
                let result = null;

                if (error) {
                    return callback(error, null);
                }

                if (device.parameters) {
                    result = this._parameterValueToToggle(
                        device.parameters[constants.PARAMETER_ECONOMY]
                    );
                }

                callback(null, result);
            }).bind(this)
        );
    }

    getEnergySavingFanState(deviceId, callback) {
        this.getParameter(
            deviceId,
            constants.PARAMETER_ENERGY_SAVING_FAN,
            (function(error, parameterValue) {
                let result = null;

                if (error) {
                    return callback(error, null);
                }

                result = this._parameterValueToToggle(parameterValue);

                callback(null, result);
            }).bind(this)
        );
    }

    setEnergySavingFanState(deviceId, toggle, callback) {
        const parameterValue = this._toggleToParameterValue(toggle);

        this.setParameter(
            deviceId,
            constants.PARAMETER_ENERGY_SAVING_FAN,
            parameterValue,
            (function(error, device) {
                let result = null;

                if (error) {
                    return callback(error, null);
                }

                if (device.parameters) {
                    result = this._parameterValueToToggle(
                        device.parameters[constants.PARAMETER_ENERGY_SAVING_FAN]
                    );
                }

                callback(null, result);
            }).bind(this)
        );
    }

    getMinimumHeatState(deviceId, callback) {
        this.getParameter(
            deviceId,
            constants.PARAMETER_MINIMUM_HEAT,
            (function(error, parameterValue) {
                let result = null;

                if (error) {
                    return callback(error, null);
                }

                result = this._parameterValueToToggle(parameterValue);

                callback(null, result);
            }).bind(this)
        );
    }

    setMinimumHeatState(deviceId, toggle, callback) {
        const parameterValue = this._toggleToParameterValue(toggle);

        this.setParameter(
            deviceId,
            constants.PARAMETER_MINIMUM_HEAT,
            parameterValue,
            (function(error, device) {
                let result = null;

                if (error) {
                    return callback(error, null);
                }

                if (toggle === constants.TOGGLE_ON) {
                    // These things automatically happen on the device side
                    // when turning on minimum heat, so let's update
                    // them in the local device cache:
                    // - The power state is set to "ON"
                    // - The fan speed is set to "AUTO"
                    // - The operation mode is set to "HEAT"
                    // - The temperature is set to 10 degrees (C)
                    this._setDeviceParameterCache(
                        deviceId,
                        {
                            'parameters': [
                                {
                                    'name': constants.PARAMETER_ON_OFF,
                                    'value': constants.PARAMETER_ON
                                },
                                {
                                    'name': constants.PARAMETER_FAN_SPEED,
                                    'value': constants.PARAMETER_FAN_SPEED_AUTO
                                },
                                {
                                    'name': constants.PARAMETER_OPERATION_MODE,
                                    'value': constants.PARAMETER_OPERATION_MODE_HEAT
                                },
                                {
                                    'name': constants.PARAMETER_SET_TEMPERATURE,
                                    'value': '100'
                                }
                            ]
                        }
                    );
                } else if (toggle === constants.TOGGLE_OFF) {
                    // These things automatically happen on the device side
                    // when turning off minimum heat, so let's update
                    // them in the local device cache:
                    // - The power state is set to "OFF"
                    this._setDeviceParameterCache(
                        deviceId,
                        {
                            'parameters': [
                                {
                                    'name': constants.PARAMETER_ON_OFF,
                                    'value': constants.PARAMETER_OFF
                                }
                            ]
                        }
                    );
                }

                if (device.parameters) {
                    result = this._parameterValueToToggle(
                        device.parameters[constants.PARAMETER_MINIMUM_HEAT]
                    );
                }

                callback(null, result);
            }).bind(this)
        );
    }

    getParameter(deviceId, name, callback) {
        this.getDevice(deviceId, function(error, device) {
            let result = null;

            if (error) {
                return callback(error, null);
            }

            if (device.parameters) {
                result = device.parameters[name];
            }

            if (result === null || result === undefined) {
                return callback('Parameter not available: ' + name, null);
            }

            callback(null, result);
        });
    }

    setParameter(deviceId, name, value, callback) {
        const deviceSubId = '0';
        const hostname = this._getHostnameForDeviceId(deviceId);

        if (hostname === null) {
            return callback('No hostname for device ID: ' + deviceId, null);
        }

        const postSetParamValue = {};
        postSetParamValue[name] = value;

        this._apiClient.postSetParam(
            hostname,
            deviceId,
            deviceSubId,
            postSetParamValue,
            (function(result) {
                if (result.error) {
                    return callback(result.error, null);
                }

                let deviceParameters = null;

                if (result.response.value) {
                    const device = {
                        'parameters': []
                    };

                    Object.keys(result.response.value).forEach(function(parameterName) {
                        device.parameters.push({
                            'name': parameterName,
                            'value': result.response.value[parameterName]
                        });
                    }, this);

                    deviceParameters = this._setDeviceParameterCache(deviceId, device);
                }

                callback(null, {
                    'parameters': deviceParameters
                });
            }).bind(this)
        );
    }

    getDevices(limit, callback) {
        const devicesFromCache = this._getDevicesFromCache();
        const isCacheHit = (
            devicesFromCache.parameters &&
            Object.keys(devicesFromCache.parameters).length > 0
        );

        if (isCacheHit) {
            return callback(null, devicesFromCache);
        }

        this._getDevicesFromApi(callback);
    }

    getDevice(deviceId, callback) {
        const deviceFromCache = this._getDeviceFromCache(deviceId);
        const isCacheHit = (
            deviceFromCache.parameters !== null
        );

        if (isCacheHit) {
            return callback(null, deviceFromCache);
        }

        this._getDeviceFromApi(deviceId, callback);
    }

    resetDeviceCache(deviceId = null) {
        if (deviceId === null) {
            this._deviceParameterCache = {};
        } else {
            if (deviceId in this._deviceParameterCache) {
                delete this._deviceParameterCache[deviceId];
            }
        }
    }

    refreshDeviceCache(callback) {
        this._getDevicesFromApi(
            (function(error, result) {
                if (error) {
                    return callback(error, null);
                }

                callback(null, result);
            }).bind(this)
        );
    }

    _setDeviceIdToLocalDeviceMap() {
        this._deviceIdToLocalDeviceMap = {};

        this.localDevices.forEach(function(localDevice) {
            const deviceId = localDevice.macAddress.replaceAll(':', '').toUpperCase();

            this._deviceIdToLocalDeviceMap[deviceId] = localDevice;
        }, this);
    }

    _getHostnameForDeviceId(deviceId) {
        let hostname = null;

        if (deviceId in this._deviceIdToLocalDeviceMap) {
            hostname = this._deviceIdToLocalDeviceMap[deviceId].hostname;
        }

        return hostname;
    }

    _getDisplayNameForDeviceId(deviceId) {
        let displayName = null;

        if (deviceId in this._deviceIdToLocalDeviceMap) {
            displayName = this._deviceIdToLocalDeviceMap[deviceId].displayName;
        }

        return displayName;
    }

    _getDeviceParameterCache(deviceId) {
        let result = null;

        if (deviceId === null) {
            result = this._deviceParameterCache;
        } else if (deviceId in this._deviceParameterCache) {
            result = this._deviceParameterCache[deviceId];
        }

        return result;
    }

    _setDeviceParameterCache(deviceId, device) {
        if ((deviceId in this._deviceParameterCache) === false) {
            this._deviceParameterCache[deviceId] = {};
        }

        if (device && 'parameters' in device) {
            device.parameters.forEach(function(parameter) {
                let parameterName = null;
                let parameterValue = null;

                if (parameter.name) {
                    parameterName = parameter.name;
                }

                if (parameter.value !== constants.PARAMETER_NOT_AVAILABLE) {
                    parameterValue = parameter.value;
                }

                if (parameterName) {
                    this._deviceParameterCache[deviceId][parameterName] = parameterValue;
                }
            }, this);
        }

        return this._getDeviceParameterCache(deviceId);
    }

    _getDevicesFromCache() {
        return this._getDeviceFromCache(null);
    }

    _getDevicesFromApi(callback) {
        const deviceIds = Object.keys(this._deviceIdToLocalDeviceMap);
        const errors = {};

        let numRequests = deviceIds.length;

        for (let i = 0; i < deviceIds.length; i++) {
            const deviceId = deviceIds[i];
            this._getDeviceFromApi(
                deviceId,
                (function(error, result) {
                    if (error) {
                        errors[deviceId] = error;
                    }

                    numRequests -= 1;
                }).bind(this)
            );
        }

        while (numRequests !== 0) {
            // No-op, waiting for all of the requests to finish
        }

        if (Object.keys(errors).length !== 0) {
            return callback(errors, null);
        }

        const deviceParameters = this._getDeviceParameterCache(null);

        callback(null, {
            'parameters': deviceParameters
        });
    }

    _getDeviceFromCache(deviceId) {
        return {
            'parameters' : this._getDeviceParameterCache(deviceId)
        };
    }

    _getDeviceFromApi(deviceId, callback) {
        const deviceSubId = '0';
        const hostname = this._getHostnameForDeviceId(deviceId);

        if (hostname === null) {
            return callback('No hostname for device ID: ' + deviceId, null);
        }

        this._apiClient.postGetParam(
            hostname,
            deviceId,
            deviceSubId,
            constants.PARAMETER_NAMES,
            (function(result) {
                if (result.error) {
                    return callback(result.error, null);
                }

                let deviceParameters = null;

                if (result.response.value) {
                    const device = {
                        'parameters': []
                    };

                    Object.keys(result.response.value).forEach(function(parameterName) {
                        device.parameters.push({
                            'name': parameterName,
                            'value': result.response.value[parameterName]
                        });
                    }, this);

                    deviceParameters = this._setDeviceParameterCache(deviceId, device);
                }

                callback(null, {
                    'parameters': deviceParameters
                });
            }).bind(this)
        );
    }

    _getClosestValidTemperature(temperature, scale) {
        let closestTemperature = null;

        if (scale === constants.TEMPERATURE_SCALE_FAHRENHEIT) {
            closestTemperature = constants.VALID_FAHRENHEIT_VALUES.reduce(function(x, y) {
                return (Math.abs(y - temperature) < Math.abs(x - temperature) ? y : x);
            });
        } else if (scale === constants.TEMPERATURE_SCALE_CELSIUS) {
            closestTemperature = constants.VALID_CELSIUS_VALUES.reduce(function(x, y) {
                return (Math.abs(y - temperature) < Math.abs(x - temperature) ? y : x);
            });
        }

        return closestTemperature;
    }

    _temperatureToIntValue(temperature) {
        return (temperature * 10);
    }

    _indoorIntValueToTemperature(intValue) {
        return ((intValue - 5000) / 100);
    }

    _intValueToTemperature(intValue) {
        return (intValue / 10);
    }

    _fahrenheitToCelsius(fahrenheit) {
        const closestFahrenheit = this._getClosestValidTemperature(
            fahrenheit,
            constants.TEMPERATURE_SCALE_FAHRENHEIT
        );

        return constants.FAHRENHEIT_TO_CELSIUS_MAP[closestFahrenheit];
    }

    _celsiusToFahrenheit(celsius) {
        const closestCelsius = this._getClosestValidTemperature(
            celsius,
            constants.TEMPERATURE_SCALE_CELSIUS
        );

        return constants.CELSIUS_TO_FAHRENHEIT_MAP[closestCelsius];
    }

    _operationModeToParameterValue(operationMode) {
        return constants.OPERATION_MODE_TO_PARAMETER_VALUE_MAP[operationMode];
    }

    _parameterValueToOperationMode(parameterValue) {
        return constants.PARAMETER_VALUE_TO_OPERATION_MODE_MAP[parameterValue];
    }

    _fanSpeedToParameterValue(fanSpeed) {
        return constants.FAN_SPEED_TO_PARAMETER_VALUE_MAP[fanSpeed];
    }

    _parameterValueToFanSpeed(parameterValue) {
        return constants.PARAMETER_VALUE_TO_FAN_SPEED_MAP[parameterValue];
    }

    _toggleToParameterValue(toggle) {
        return constants.TOGGLE_TO_PARAMETER_VALUE_MAP[toggle];
    }

    _parameterValueToToggle(parameterValue) {
        return constants.PARAMETER_VALUE_TO_TOGGLE_MAP[parameterValue];
    }

    _validateAirflowVerticalDirectionValue(value) {
        if (value < constants.MIN_AIRFLOW_VERTICAL_DIRECTION) {
            value = constants.MIN_AIRFLOW_VERTICAL_DIRECTION;
        } else if (value > constants.MAX_AIRFLOW_VERTICAL_DIRECTION) {
            value = constants.MAX_AIRFLOW_VERTICAL_DIRECTION;
        }

        return value;
    }
}

module.exports = Client;
