'use strict';

const apiv1 = require('./apiv1');
const constants = require('./constants');

class Client {

    constructor(
        region,
        country,
        language,
        email = null,
        password = null,
        osVersion = null,
        userAgent = null,
        accessToken = null,
        accessTokenExpiry = null,
        refreshToken = null
    ) {
        this.email = email;
        this.password = password;

        this._apiClient = new apiv1.Client(
            region,
            country,
            language,
            osVersion || null,
            userAgent || null,
            accessToken || null,
            accessTokenExpiry || null,
            refreshToken || null
        );

        this.resetUserCache();
        this.resetDeviceCache();
    }

    refreshTokenOrAuthenticate(callback) {
        if (this._apiClient.accessToken && this._apiClient.refreshToken) {
            this.refreshToken(callback);
        } else if (this.email && this.password) {
            this.authenticate(callback);
        } else {
            callback('Could not refresh token or authenticate', null);
        }
    }

    authenticate(callback) {
        this._apiClient.postUsersSignIn(
            this.email,
            this.password,
            (function(result) {
                let response = null;

                if (this._isInvalidLoginResult(result)) {
                    return callback('Invalid email or password', null);
                }

                if (result.error) {
                    return callback(result.error, null);
                }

                if (result.response) {
                    response = result.response;
                }

                callback(null, response);
            }).bind(this)
        );
    }

    refreshToken(callback) {
        this._apiClient.postUsersMeRefreshToken(
            this._apiClient.refreshToken,
            (function(result) {
                let response = null;

                if (this._isInvalidTokenResult(result)) {
                    return callback('Invalid access token', null);
                }

                if (result.error) {
                    return callback(result.error, null);
                }

                if (result.response) {
                    response = result.response;
                }

                callback(null, response);
            }).bind(this)
        );
    }

    getTemperatureScale(callback) {
        this.getUserMetadata(function(error, userMetadata) {
            let temperatureScale = null;

            if (error) {
                return callback(error, null);
            }

            if (apiv1.constants.USER_TEMPERATURE_SCALE in userMetadata) {
                temperatureScale = userMetadata[apiv1.constants.USER_TEMPERATURE_SCALE];
            }

            callback(null, temperatureScale);
        });
    }

    setTemperatureScale(scale, callback) {
        this._apiClient.putUsersMe(
            apiv1.constants.USER_TEMPERATURE_SCALE,
            scale,
            (function(result) {
                let responseScale = null;
                let userMetadataCache = null;

                if (this._isInvalidTokenResult(result)) {
                    return callback('Invalid access token', null);
                }

                if (result.error) {
                    return callback(result.error, null);
                }

                if (result.response) {
                    responseScale = result.response[apiv1.constants.USER_TEMPERATURE_SCALE];

                    userMetadataCache = this._getUserMetadataCache();
                    userMetadataCache[apiv1.constants.USER_TEMPERATURE_SCALE] = responseScale;
                    this._setUserMetadataCache(userMetadataCache);
                }

                callback(null, responseScale);
            }).bind(this)
        );
    }

    getName(deviceId, callback) {
        this.getDevice(deviceId, function(error, device) {
            let result = null;

            if (error) {
                return callback(error, null);
            }

            if (apiv1.constants.METADATA_DEVICE_NAME in device.metadata) {
                result = device.metadata[apiv1.constants.METADATA_DEVICE_NAME];
            }

            callback(null, result);
        });
    }

    getConnectionStatus(deviceId, callback) {
        this.getDevice(deviceId, function(error, device) {
            let result = null;

            if (error) {
                return callback(error, null);
            }

            if (apiv1.constants.METADATA_CONNECTION_STATUS in device.metadata) {
                result = device.metadata[apiv1.constants.METADATA_CONNECTION_STATUS];
            }

            callback(null, result);
        });
    }

    getModel(deviceId, callback) {
        this.getParameter(
            deviceId,
            apiv1.constants.PARAMETER_MODEL,
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
            apiv1.constants.PARAMETER_ON_OFF,
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
            apiv1.constants.PARAMETER_ON_OFF,
            parameterValue,
            (function(error, device) {
                let result = null;

                if (error) {
                    return callback(error, null);
                }

                if (device.parameters) {
                    result = this._parameterValueToToggle(
                        device.parameters[apiv1.constants.PARAMETER_ON_OFF]
                    );
                }

                callback(null, result);
            }).bind(this)
        );
    }

    getOperationMode(deviceId, callback) {
        this.getParameter(
            deviceId,
            apiv1.constants.PARAMETER_OPERATION_MODE,
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
            apiv1.constants.PARAMETER_OPERATION_MODE,
            parameterValue,
            (function(error, device) {
                let result = null;

                if (error) {
                    return callback(error, null);
                }

                if (device.parameters) {
                    result = this._parameterValueToOperationMode(
                        device.parameters[apiv1.constants.PARAMETER_OPERATION_MODE]
                    );
                }

                callback(null, result);
            }).bind(this)
        );
    }

    getIndoorTemperature(deviceId, scale, callback) {
        this.getParameter(
            deviceId,
            apiv1.constants.PARAMETER_INDOOR_TEMPERATURE,
            (function(error, parameterValue) {
                let result = null;

                if (error) {
                    return callback(error, null);
                }

                if (parameterValue !== null) {
                    result = this._indoorIntValueToTemperature(parameterValue);

                    if (scale === apiv1.constants.TEMPERATURE_SCALE_FAHRENHEIT) {
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
            apiv1.constants.PARAMETER_SET_TEMPERATURE,
            (function(error, parameterValue) {
                let result = null;

                if (error) {
                    return callback(error, null);
                }

                result = this._intValueToTemperature(parameterValue);

                if (scale === apiv1.constants.TEMPERATURE_SCALE_FAHRENHEIT) {
                    result = this._celsiusToFahrenheit(result);
                }

                callback(null, result);
            }).bind(this)
        );
    }

    setTargetTemperature(deviceId, temperature, scale, callback) {
        let intValue = null;

        if (scale === apiv1.constants.TEMPERATURE_SCALE_FAHRENHEIT) {
            temperature = this._fahrenheitToCelsius(temperature);
        } else if (scale === apiv1.constants.TEMPERATURE_SCALE_CELSIUS) {
            temperature = this._getClosestValidTemperature(
                temperature,
                apiv1.constants.TEMPERATURE_SCALE_CELSIUS
            );
        }

        intValue = this._temperatureToIntValue(temperature);

        this.setParameter(
            deviceId,
            apiv1.constants.PARAMETER_SET_TEMPERATURE,
            intValue.toString(),
            (function(error, device) {
                let result = null;
                let parameterValue = null;

                if (error) {
                    return callback(error, null);
                }

                if (device.parameters) {
                    parameterValue = device.parameters[apiv1.constants.PARAMETER_SET_TEMPERATURE];
                    result = this._intValueToTemperature(parameterValue);

                    if (scale === apiv1.constants.TEMPERATURE_SCALE_FAHRENHEIT) {
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
            apiv1.constants.PARAMETER_FAN_SPEED,
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
            apiv1.constants.PARAMETER_FAN_SPEED,
            parameterValue,
            (function(error, device) {
                let result = null;

                if (error) {
                    return callback(error, null);
                }

                if (device.parameters) {
                    result = this._parameterValueToFanSpeed(
                        device.parameters[apiv1.constants.PARAMETER_FAN_SPEED]
                    );
                }

                callback(null, result);
            }).bind(this)
        );
    }

    getAirflowVerticalDirection(deviceId, callback) {
        this.getParameter(
            deviceId,
            apiv1.constants.PARAMETER_AIRFLOW_VERTICAL_DIRECTION,
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
            apiv1.constants.PARAMETER_AIRFLOW_VERTICAL_DIRECTION,
            parameterValue,
            (function(error, device) {
                let result = null;

                if (error) {
                    return callback(error, null);
                }

                if (device.parameters) {
                    result = this._validateAirflowVerticalDirectionValue(
                        parseInt(device.parameters[apiv1.constants.PARAMETER_AIRFLOW_VERTICAL_DIRECTION])
                    );
                }

                callback(null, result);
            }).bind(this)
        );
    }

    getAirflowVerticalSwingState(deviceId, callback) {
        this.getParameter(
            deviceId,
            apiv1.constants.PARAMETER_AIRFLOW_VERTICAL_SWING,
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
            apiv1.constants.PARAMETER_AIRFLOW_VERTICAL_SWING,
            parameterValue,
            (function(error, device) {
                let result = null;

                if (error) {
                    return callback(error, null);
                }

                if (device.parameters) {
                    result = this._parameterValueToToggle(
                        device.parameters[apiv1.constants.PARAMETER_AIRFLOW_VERTICAL_SWING]
                    );
                }

                callback(null, result);
            }).bind(this)
        );
    }

    getPowerfulState(deviceId, callback) {
        this.getParameter(
            deviceId,
            apiv1.constants.PARAMETER_POWERFUL,
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
            apiv1.constants.PARAMETER_POWERFUL,
            parameterValue,
            (function(error, device) {
                let result = null;

                if (error) {
                    return callback(error, null);
                }

                if (device.parameters) {
                    result = this._parameterValueToToggle(
                        device.parameters[apiv1.constants.PARAMETER_POWERFUL]
                    );
                }

                callback(null, result);
            }).bind(this)
        );
    }

    getEconomyState(deviceId, callback) {
        this.getParameter(
            deviceId,
            apiv1.constants.PARAMETER_ECONOMY,
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
            apiv1.constants.PARAMETER_ECONOMY,
            parameterValue,
            (function(error, device) {
                let result = null;

                if (error) {
                    return callback(error, null);
                }

                if (device.parameters) {
                    result = this._parameterValueToToggle(
                        device.parameters[apiv1.constants.PARAMETER_ECONOMY]
                    );
                }

                callback(null, result);
            }).bind(this)
        );
    }

    getEnergySavingFanState(deviceId, callback) {
        this.getParameter(
            deviceId,
            apiv1.constants.PARAMETER_ENERGY_SAVING_FAN,
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
            apiv1.constants.PARAMETER_ENERGY_SAVING_FAN,
            parameterValue,
            (function(error, device) {
                let result = null;

                if (error) {
                    return callback(error, null);
                }

                if (device.parameters) {
                    result = this._parameterValueToToggle(
                        device.parameters[apiv1.constants.PARAMETER_ENERGY_SAVING_FAN]
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

            if (result === null) {
                return callback('Parameter not available: ' + name, null);
            }

            callback(null, result);
        });
    }

    setParameter(deviceId, name, value, callback) {
        const deviceSubId = '0';

        this._apiClient.postDevicesSetParametersRequest(
            deviceId,
            deviceSubId,
            name,
            value,
            (function(result) {
                let requestId = null;

                if (this._isInvalidTokenResult(result)) {
                    return callback('Invalid access token', null);
                }

                if (result.error) {
                    return callback(result.error, null);
                }

                if (result.response) {
                    requestId = result.response.reqId;
                }

                this._pollRequestStatus(
                    deviceId,
                    requestId,
                    callback
                );
            }).bind(this)
        );
    }

    getRequestStatus(deviceId, requestId, callback) {
        this._apiClient.getDevicesRequest(
            deviceId,
            requestId,
            (function(result) {
                let response = null;

                if (this._isInvalidTokenResult(result)) {
                    return callback('Invalid access token', null);
                }

                if (result.error) {
                    return callback(result.error, null);
                }

                if (result.response) {
                    response = result.response;
                }

                callback(null, response);
            }).bind(this)
        );
    }

    getDevices(limit, callback) {
        let deviceMetadata = this._getDeviceMetadataCache(null);
        let deviceParameters = this._getDeviceParameterCache(null);

        if (
            deviceMetadata &&
            Object.keys(deviceMetadata).length > 0 &&
            deviceParameters &&
            Object.keys(deviceParameters).length > 0
        ) {
            return callback(null, {
                'metadata': deviceMetadata,
                'parameters': deviceParameters
            });
        }

        this._apiClient.getDevicesAll(
            limit,
            (function(result) {
                if (this._isInvalidTokenResult(result)) {
                    return callback('Invalid access token', null);
                }

                if (result.error) {
                    return callback(result.error, null);
                }

                if (result.response) {
                    result.response.devices.forEach(function(device) {
                        this._setDeviceMetadataCache(
                            device.deviceId,
                            device
                        );
                        this._setDeviceParameterCache(
                            device.deviceId,
                            device
                        );
                    }, this);
                }

                deviceMetadata = this._getDeviceMetadataCache(null);
                deviceParameters = this._getDeviceParameterCache(null);

                callback(null, {
                    'metadata': deviceMetadata,
                    'parameters': deviceParameters
                });
            }).bind(this)
        );
    }

    getDevice(deviceId, callback) {
        let deviceMetadata = this._getDeviceMetadataCache(deviceId);
        let deviceParameters = this._getDeviceParameterCache(deviceId);

        if (deviceMetadata && deviceParameters) {
            return callback(null, {
                'metadata': deviceMetadata,
                'parameters': deviceParameters
            });
        }

        this._apiClient.getDevice(
            deviceId,
            (function(result) {
                if (this._isInvalidTokenResult(result)) {
                    return callback('Invalid access token', null);
                }

                if (result.error) {
                    return callback(result.error, null);
                }

                if (result.response) {
                    deviceMetadata = this._setDeviceMetadataCache(
                        result.response.deviceId,
                        result.response
                    );
                    deviceParameters = this._setDeviceParameterCache(
                        result.response.deviceId,
                        result.response
                    );
                }

                callback(null, {
                    'metadata': deviceMetadata,
                    'parameters': deviceParameters
                });
            }).bind(this)
        );
    }

    getUserMetadata(callback) {
        let userMetadata = this._getUserMetadataCache();

        if (userMetadata && Object.keys(userMetadata).length > 0) {
            return callback(null, userMetadata);
        }

        this._apiClient.getUsersMe((function(result) {
            if (this._isInvalidTokenResult(result)) {
                return callback('Invalid access token', null);
            }

            if (result.error) {
                return callback(result.error, null);
            }

            if (result.response) {
                userMetadata = result.response;

                this._setUserMetadataCache(userMetadata);
            }

            callback(null, userMetadata);
        }).bind(this));
    }

    resetUserCache() {
        this._userMetadataCache = {};
    }

    resetDeviceCache(deviceId = null) {
        if (deviceId === null) {
            this._deviceMetadataCache = {};
            this._deviceParameterCache = {};
        } else {
            if (deviceId in this._deviceMetadataCache) {
                delete this._deviceMetadataCache[deviceId];
            }

            if (deviceId in this._deviceParameterCache) {
                delete this._deviceParameterCache[deviceId];
            }
        }
    }

    getAccessToken() {
        return this._apiClient.accessToken;
    }

    getAccessTokenExpiry() {
        return this._apiClient.accessTokenExpiry;
    }

    getRefreshToken() {
        return this._apiClient.refreshToken;
    }

    _isInvalidLoginResult(result) {
        return (
            result.statusCode === 401 ||
            (
                result.response &&
                'messageCode' in result.response &&
                result.response.messageCode === apiv1.constants.MESSAGE_CODE_INVALID_LOGIN
            )
        );
    }

    _isInvalidTokenResult(result) {
        return (
            result.statusCode === 403 ||
            (
                result.response &&
                'messageCode' in result.response &&
                result.response.messageCode === apiv1.constants.MESSAGE_CODE_INVALID_TOKEN
            )
        );
    }

    _getUserMetadataCache() {
        return this._userMetadataCache;
    }

    _setUserMetadataCache(userMetadata) {
        this._userMetadataCache = userMetadata;

        return this._getUserMetadataCache();
    }

    _getDeviceMetadataCache(deviceId) {
        let result = null;

        if (deviceId === null) {
            result = this._deviceMetadataCache;
        } else if (deviceId in this._deviceMetadataCache) {
            result = this._deviceMetadataCache[deviceId];
        }

        return result;
    }

    _setDeviceMetadataCache(deviceId, device) {
        if ((deviceId in this._deviceMetadataCache) === false) {
            this._deviceMetadataCache[deviceId] = {};
        }

        if (device) {
            apiv1.constants.METADATA_KEYS.forEach((function(key) {
                if (key in device) {
                    this._deviceMetadataCache[deviceId][key] = device[key];
                }
            }.bind(this)));
        }

        return this._getDeviceMetadataCache(deviceId);
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

                if (parameter.value !== apiv1.constants.PARAMETER_NOT_AVAILABLE) {
                    parameterValue = parameter.value;
                }

                if (parameterName) {
                    this._deviceParameterCache[deviceId][parameterName] = parameterValue;
                }
            }, this);
        }

        return this._getDeviceParameterCache(deviceId);
    }

    _pollRequestStatus(deviceId, requestId, callback) {
        this._apiClient.getDevicesRequest(
            deviceId,
            requestId,
            (function(result) {
                let deviceMetadata = null;
                let deviceParameters = null;

                if (result.error) {
                    return callback(result.error, null);
                }

                if (result.response.status === apiv1.constants.PARAMETER_STATUS_WAITING) {
                    this._pollRequestStatus(deviceId, requestId, callback);
                } else {
                    deviceMetadata = this._setDeviceMetadataCache(
                        deviceId,
                        result.response
                    );
                    deviceParameters = this._setDeviceParameterCache(
                        deviceId,
                        result.response
                    );

                    callback(null, {
                        'metadata': deviceMetadata,
                        'parameters': deviceParameters
                    });
                }
            }).bind(this)
        );
    }

    _getClosestValidTemperature(temperature, scale) {
        let closestTemperature = null;

        if (scale === apiv1.constants.TEMPERATURE_SCALE_FAHRENHEIT) {
            closestTemperature = constants.VALID_FAHRENHEIT_VALUES.reduce(function(x, y) {
                return (Math.abs(y - temperature) < Math.abs(x - temperature) ? y : x);
            });
        } else if (scale === apiv1.constants.TEMPERATURE_SCALE_CELSIUS) {
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
            apiv1.constants.TEMPERATURE_SCALE_FAHRENHEIT
        );

        return constants.FAHRENHEIT_TO_CELSIUS_MAP[closestFahrenheit];
    }

    _celsiusToFahrenheit(celsius) {
        const closestCelsius = this._getClosestValidTemperature(
            celsius,
            apiv1.constants.TEMPERATURE_SCALE_CELSIUS
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
        if (value < constants.MIN_VERTICAL_DIRECTION) {
            value = constants.MIN_VERTICAL_DIRECTION;
        } else if (value > constants.MAX_VERTICAL_DIRECTION) {
            value = constants.MAX_VERTICAL_DIRECTION;
        }

        return value;
    }
}

module.exports = Client;
