'use strict';

const http = require('http');
const localConstants = require('./constants');
const airstageConstants = require('../constants');

/**
 * Local LAN API Client for Fujitsu Airstage devices
 * Implements same interface as cloud client for compatibility with accessories
 */
class LocalClient {

    constructor(devices, logger = null, configManager = null) {
        this.devices = new Map();
        this.logger = logger;
        this.configManager = configManager;

        // Request queue to prevent overwhelming the device
        this.requestQueue = [];
        this.activeRequests = 0;
        this.maxConcurrentRequests = 2; // Limit concurrent requests to prevent device overload
        this.requestDelay = 100; // Minimum delay between requests (ms)

        // Store devices with UPPERCASE device IDs and health tracking
        if (Array.isArray(devices)) {
            devices.forEach(device => {
                const deviceId = device.deviceId.toUpperCase();
                this.devices.set(deviceId, {
                    deviceId: deviceId,
                    ipAddress: device.ipAddress,
                    deviceSubId: device.deviceSubId || 0,
                    name: device.name || deviceId,
                    // Health tracking for graceful fault handling
                    isReachable: true,
                    consecutiveFailures: 0,
                    lastSuccessfulRequest: Date.now(),
                    lastFailureTime: null,
                    lastError: null
                });
            });
        }
    }

    // ===================================================================
    // Device Health & Circuit Breaker Methods
    // ===================================================================

    /**
     * Update device health status based on request outcome
     */
    _updateDeviceHealth(deviceId, success, error = null) {
        const device = this.devices.get(deviceId.toUpperCase());
        if (!device) return;

        if (success) {
            device.isReachable = true;
            device.consecutiveFailures = 0;
            device.lastSuccessfulRequest = Date.now();
            device.lastError = null;

            this.logger?.debug(`[Local] ${device.name} is healthy`);
        } else {
            device.consecutiveFailures++;
            device.lastFailureTime = Date.now();
            device.lastError = error?.message || 'Unknown error';

            // Mark unreachable after 3 consecutive failures
            if (device.consecutiveFailures >= 3) {
                if (device.isReachable) {
                    device.isReachable = false;
                    this.logger?.warn(`[Local] ${device.name} marked as UNREACHABLE after ${device.consecutiveFailures} failures`);
                    this.logger?.warn(`[Local] Last error: ${device.lastError}`);

                    // Notify accessories about device unreachability
                    this._notifyDeviceUnreachable(deviceId);
                }
            }
        }
    }

    /**
     * Check if device should accept requests (circuit breaker)
     */
    _canMakeRequest(deviceId) {
        const device = this.devices.get(deviceId.toUpperCase());
        if (!device) return false;

        // If device is reachable, allow request
        if (device.isReachable) return true;

        // If unreachable, check if enough time has passed for retry (60 seconds)
        const timeSinceFailure = Date.now() - device.lastFailureTime;
        const RETRY_DELAY = 60000; // 1 minute

        if (timeSinceFailure >= RETRY_DELAY) {
            this.logger?.info(`[Local] Attempting to reconnect to ${device.name}...`);
            return true; // Allow retry attempt
        }

        return false; // Still in circuit breaker state
    }

    /**
     * Notify accessories that device is unreachable (stub for future event system)
     */
    _notifyDeviceUnreachable(deviceId) {
        // Placeholder for future implementation
        // Could emit events or directly update accessory StatusFault
        this.logger?.debug(`[Local] Device ${deviceId} unreachable notification triggered`);
    }

    /**
     * Process request queue to prevent overwhelming the device
     */
    _processQueue() {
        if (this.requestQueue.length === 0 || this.activeRequests >= this.maxConcurrentRequests) {
            return;
        }

        const { resolve, reject, fn } = this.requestQueue.shift();
        this.activeRequests++;

        fn()
            .then(result => {
                this.activeRequests--;
                resolve(result);
                // Add delay before processing next request
                setTimeout(() => this._processQueue(), this.requestDelay);
            })
            .catch(error => {
                this.activeRequests--;
                reject(error);
                // Add delay before processing next request
                setTimeout(() => this._processQueue(), this.requestDelay);
            });
    }

    /**
     * Queue a request to prevent overwhelming the device
     */
    _queueRequest(fn) {
        return new Promise((resolve, reject) => {
            this.requestQueue.push({ resolve, reject, fn });
            this._processQueue();
        });
    }

    // ===================================================================
    // Core HTTP Request Methods
    // ===================================================================

    /**
     * Make raw HTTP POST request to device (internal - bypasses queue)
     * Use _makeRequest() instead for automatic queuing
     */
    _makeRawRequest(deviceId, endpoint, payload) {
        return new Promise((resolve, reject) => {
            const device = this.devices.get(deviceId.toUpperCase());

            if (!device) {
                return reject(new Error(`Device ${deviceId} not found in configuration`));
            }

            const postData = JSON.stringify(payload);
            const options = {
                hostname: device.ipAddress,
                port: localConstants.DEFAULT_PORT,
                path: endpoint,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(postData),
                    'Connection': 'close'  // Force connection close to prevent keep-alive issues
                },
                timeout: localConstants.DEFAULT_TIMEOUT,
                agent: false  // CRITICAL: Disable connection pooling - create fresh connection each time
            };

            // Debug logging for troubleshooting
            this.logger?.debug(`[Local] HTTP ${options.method} http://${device.ipAddress}:${options.port}${options.path}`);
            this.logger?.debug(`[Local] Headers: ${JSON.stringify(options.headers)}`);
            this.logger?.debug(`[Local] Payload: ${postData.substring(0, 200)}${postData.length > 200 ? '...' : ''}`);

            const req = http.request(options, (res) => {
                this.logger?.debug(`[Local] Response status: ${res.statusCode}`);
                this.logger?.debug(`[Local] Response headers: ${JSON.stringify(res.headers)}`);
                let data = '';

                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    this.logger?.debug(`[Local] Response complete, body length: ${data.length} bytes`);
                    try {
                        const response = JSON.parse(data);

                        if (response.result === 'OK') {
                            resolve(response.value || response);
                        } else {
                            reject(new Error(`API Error: ${response.error || 'Unknown error'}`));
                        }
                    } catch (e) {
                        // Enhanced error logging with response details
                        const preview = data.length > 100 ? data.substring(0, 100) + '...' : data;
                        reject(new Error(
                            `JSON Parse Error: ${e.message}\n` +
                            `HTTP Status: ${res.statusCode}\n` +
                            `Response Preview: ${preview}\n` +
                            `Device: ${device.name} (${device.ipAddress})`
                        ));
                    }
                });
            });

            req.on('error', (e) => {
                this.logger?.debug(`[Local] Request error: ${e.message}, code: ${e.code}`);
                reject(new Error(
                    `HTTP Request Error: ${e.message}\n` +
                    `Device: ${device.name} (${device.ipAddress})\n` +
                    `Endpoint: ${endpoint}\n` +
                    `Error Code: ${e.code || 'unknown'}\n` +
                    `Hint: Check network connectivity and device availability`
                ));
            });

            req.on('timeout', () => {
                req.destroy();
                reject(new Error(
                    `Request timeout (${localConstants.DEFAULT_TIMEOUT}ms)\n` +
                    `Device: ${device.name} (${device.ipAddress})\n` +
                    `Endpoint: ${endpoint}\n` +
                    `Hint: Device may be slow to respond or unreachable`
                ));
            });

            req.write(postData);
            req.end();
        });
    }

    /**
     * Make HTTP POST request to device (automatically queued with circuit breaker)
     * This is the public-facing method that handles queuing and health tracking
     */
    _makeRequest(deviceId, endpoint, payload) {
        const normalizedId = deviceId.toUpperCase();
        const device = this.devices.get(normalizedId);

        // If device doesn't exist, let _makeRawRequest handle the error
        if (!device) {
            return this._queueRequest(() =>
                this._makeRawRequest(normalizedId, endpoint, payload)
            );
        }

        // Circuit breaker check for known devices
        if (!this._canMakeRequest(normalizedId)) {
            const timeUntilRetry = Math.ceil((60000 - (Date.now() - device.lastFailureTime)) / 1000);
            return Promise.reject(new Error(
                `Device ${device.name} is currently unreachable. ` +
                `Last error: ${device.lastError || 'Unknown'}. ` +
                `Will retry in ${timeUntilRetry}s`
            ));
        }

        return this._queueRequest(() =>
            this._makeRawRequest(normalizedId, endpoint, payload)
                .then(result => {
                    this._updateDeviceHealth(normalizedId, true);
                    return result;
                })
                .catch(error => {
                    this._updateDeviceHealth(normalizedId, false, error);
                    throw error;
                })
        );
    }

    /**
     * Get parameter(s) from device
     */
    async _getParam(deviceId, parameters) {
        const device = this.devices.get(deviceId.toUpperCase());

        if (!device) {
            throw new Error(`Device ${deviceId} not found`);
        }

        const paramList = Array.isArray(parameters) ? parameters : [parameters];
        this.logger?.debug(`[Local] GET ${device.name} (${device.deviceId} @ ${device.ipAddress}) - Parameters: ${paramList.join(', ')}`);

        const payload = {
            device_id: device.deviceId,
            device_sub_id: device.deviceSubId,
            req_id: '',
            modified_by: '',
            set_level: localConstants.SET_LEVEL_GET,
            list: paramList
        };

        // Request is automatically queued by _makeRequest
        const result = await this._makeRequest(device.deviceId, localConstants.ENDPOINT_GET_PARAM, payload);

        // Log parameter values in a readable format
        const resultValues = paramList.map(param => `${param}=${result[param]}`).join(', ');
        this.logger?.debug(`[Local] GET ${device.name} (${device.deviceId} @ ${device.ipAddress}) - Values: ${resultValues}`);

        return result;
    }

    /**
     * Set parameter(s) on device
     */
    async _setParam(deviceId, values) {
        const device = this.devices.get(deviceId.toUpperCase());

        if (!device) {
            throw new Error(`Device ${deviceId} not found`);
        }

        // Log parameter values being set in a readable format
        const paramPairs = Object.entries(values).map(([key, val]) => `${key}=${val}`).join(', ');
        this.logger?.debug(`[Local] SET ${device.name} (${device.deviceId} @ ${device.ipAddress}) - Parameters: ${paramPairs}`);

        const payload = {
            device_id: device.deviceId,
            device_sub_id: device.deviceSubId,
            req_id: '',
            modified_by: '',
            set_level: localConstants.SET_LEVEL_SET,
            value: values
        };

        // Request is automatically queued by _makeRequest
        const result = await this._makeRequest(device.deviceId, localConstants.ENDPOINT_SET_PARAM, payload);
        this.logger?.debug(`[Local] SET ${device.name} (${device.deviceId} @ ${device.ipAddress}) - Success`);

        return result;
    }

    // ===================================================================
    // Temperature Conversion Methods
    // ===================================================================

    /**
     * Encode temperature for SetParam (Celsius × 10)
     */
    _encodeTemperature(celsius) {
        return Math.round(celsius * 10).toString();
    }

    /**
     * Decode target temperature from GetParam (value ÷ 10)
     */
    _decodeTemperature(apiValue) {
        return parseInt(apiValue) / 10;
    }

    /**
     * Decode indoor temperature from local API (Fahrenheit × 100)
     * LOCAL API DIFFERS FROM CLOUD: Uses Fahrenheit × 100, not (Celsius + 50) × 100
     */
    _decodeFahrenheitToCelsius(apiValue) {
        const fahrenheit = parseInt(apiValue) / 100;
        return (fahrenheit - 32) * 5 / 9;
    }

    /**
     * Get closest valid temperature
     */
    _getClosestValidTemperature(temperature, scale) {
        if (scale === airstageConstants.TEMPERATURE_SCALE_FAHRENHEIT) {
            return airstageConstants.VALID_FAHRENHEIT_VALUES.reduce(function(x, y) {
                return (Math.abs(y - temperature) < Math.abs(x - temperature) ? y : x);
            });
        } else if (scale === airstageConstants.TEMPERATURE_SCALE_CELSIUS) {
            return airstageConstants.VALID_CELSIUS_VALUES.reduce(function(x, y) {
                return (Math.abs(y - temperature) < Math.abs(x - temperature) ? y : x);
            });
        }
        return temperature;
    }

    /**
     * Convert Fahrenheit to Celsius using lookup map
     */
    _fahrenheitToCelsius(fahrenheit) {
        const closestFahrenheit = this._getClosestValidTemperature(
            fahrenheit,
            airstageConstants.TEMPERATURE_SCALE_FAHRENHEIT
        );
        return airstageConstants.FAHRENHEIT_TO_CELSIUS_MAP[closestFahrenheit];
    }

    /**
     * Convert Celsius to Fahrenheit using lookup map
     */
    _celsiusToFahrenheit(celsius) {
        const closestCelsius = this._getClosestValidTemperature(
            celsius,
            airstageConstants.TEMPERATURE_SCALE_CELSIUS
        );
        return airstageConstants.CELSIUS_TO_FAHRENHEIT_MAP[closestCelsius];
    }

    // ===================================================================
    // Value Mapping Methods (reused from cloud client pattern)
    // ===================================================================

    _toggleToParameterValue(toggle) {
        return airstageConstants.TOGGLE_TO_PARAMETER_VALUE_MAP[toggle];
    }

    _parameterValueToToggle(parameterValue) {
        return airstageConstants.PARAMETER_VALUE_TO_TOGGLE_MAP[parameterValue];
    }

    _operationModeToParameterValue(operationMode) {
        return airstageConstants.OPERATION_MODE_TO_PARAMETER_VALUE_MAP[operationMode];
    }

    _parameterValueToOperationMode(parameterValue) {
        return airstageConstants.PARAMETER_VALUE_TO_OPERATION_MODE_MAP[parameterValue];
    }

    _fanSpeedToParameterValue(fanSpeed) {
        return airstageConstants.FAN_SPEED_TO_PARAMETER_VALUE_MAP[fanSpeed];
    }

    _parameterValueToFanSpeed(parameterValue) {
        return airstageConstants.PARAMETER_VALUE_TO_FAN_SPEED_MAP[parameterValue];
    }

    _validateAirflowVerticalDirectionValue(value) {
        if (value < airstageConstants.MIN_AIRFLOW_VERTICAL_DIRECTION) {
            value = airstageConstants.MIN_AIRFLOW_VERTICAL_DIRECTION;
        } else if (value > airstageConstants.MAX_AIRFLOW_VERTICAL_DIRECTION) {
            value = airstageConstants.MAX_AIRFLOW_VERTICAL_DIRECTION;
        }
        return value;
    }

    // ===================================================================
    // Device Metadata Methods
    // ===================================================================

    getName(deviceId, callback) {
        const device = this.devices.get(deviceId.toUpperCase());

        if (!device) {
            return callback(new Error(`Device ${deviceId} not found`), null);
        }

        callback(null, device.name);
    }

    getModel(deviceId, callback) {
        this._getParam(deviceId, localConstants.PARAM_MODEL)
            .then(response => {
                callback(null, response[localConstants.PARAM_MODEL] || null);
            })
            .catch(error => callback(error, null));
    }

    // ===================================================================
    // Power Control Methods
    // ===================================================================

    getPowerState(deviceId, callback) {
        this._getParam(deviceId, localConstants.PARAM_POWER)
            .then(response => {
                const toggle = this._parameterValueToToggle(response[localConstants.PARAM_POWER]);
                callback(null, toggle);
            })
            .catch(error => callback(error, null));
    }

    setPowerState(deviceId, toggle, callback) {
        const device = this.devices.get(deviceId.toUpperCase());
        const state = toggle === airstageConstants.TOGGLE_ON ? 'ON' : 'OFF';
        this.logger?.info(`[Local] ${device ? device.name : deviceId} (${deviceId} @ ${device ? device.ipAddress : 'unknown'}) - Power: ${state}`);

        const parameterValue = this._toggleToParameterValue(toggle);
        const values = {};
        values[localConstants.PARAM_POWER] = parameterValue;

        this._setParam(deviceId, values)
            .then(() => {
                callback(null, toggle);
            })
            .catch(error => callback(error));
    }

    // ===================================================================
    // Operation Mode Methods
    // ===================================================================

    getOperationMode(deviceId, callback) {
        this._getParam(deviceId, localConstants.PARAM_OPERATION_MODE)
            .then(response => {
                const mode = this._parameterValueToOperationMode(response[localConstants.PARAM_OPERATION_MODE]);
                callback(null, mode);
            })
            .catch(error => callback(error, null));
    }

    setOperationMode(deviceId, operationMode, callback) {
        const device = this.devices.get(deviceId.toUpperCase());
        const modeNames = {
            [airstageConstants.OPERATION_MODE_AUTO]: 'Auto',
            [airstageConstants.OPERATION_MODE_COOL]: 'Cool',
            [airstageConstants.OPERATION_MODE_DRY]: 'Dry',
            [airstageConstants.OPERATION_MODE_FAN]: 'Fan',
            [airstageConstants.OPERATION_MODE_HEAT]: 'Heat'
        };
        const modeName = modeNames[operationMode] || operationMode;
        this.logger?.info(`[Local] ${device ? device.name : deviceId} (${deviceId} @ ${device ? device.ipAddress : 'unknown'}) - Operation Mode: ${modeName}`);

        const parameterValue = this._operationModeToParameterValue(operationMode);
        const values = {};
        values[localConstants.PARAM_OPERATION_MODE] = parameterValue;

        this._setParam(deviceId, values)
            .then(() => {
                callback(null, operationMode);
            })
            .catch(error => callback(error));
    }

    // ===================================================================
    // Temperature Methods
    // ===================================================================

    getIndoorTemperature(deviceId, scale, callback) {
        this._getParam(deviceId, localConstants.PARAM_INDOOR_TEMP)
            .then(response => {
                const device = this.devices.get(deviceId.toUpperCase());
                const deviceName = device ? device.name : deviceId;

                // Local API uses Fahrenheit × 100 encoding
                const rawValue = response[localConstants.PARAM_INDOOR_TEMP];
                this.logger?.debug(`[Local] getIndoorTemperature for ${deviceName} - Raw API value: ${rawValue}, Requested scale: ${scale}`);

                let celsius = this._decodeFahrenheitToCelsius(rawValue);
                this.logger?.debug(`[Local] getIndoorTemperature for ${deviceName} - After F→C conversion: ${celsius}°C`);

                if (scale === airstageConstants.TEMPERATURE_SCALE_FAHRENHEIT) {
                    const fahrenheit = this._celsiusToFahrenheit(celsius);
                    this.logger?.debug(`[Local] getIndoorTemperature for ${deviceName} - After C→F conversion: ${fahrenheit}°F (returning)`);
                    celsius = fahrenheit;
                } else {
                    this.logger?.debug(`[Local] getIndoorTemperature for ${deviceName} - Returning Celsius: ${celsius}°C`);
                }

                callback(null, celsius);
            })
            .catch(error => callback(error, null));
    }

    getTargetTemperature(deviceId, scale, callback) {
        this._getParam(deviceId, localConstants.PARAM_TARGET_TEMP)
            .then(response => {
                const device = this.devices.get(deviceId.toUpperCase());
                const deviceName = device ? device.name : deviceId;

                const rawValue = response[localConstants.PARAM_TARGET_TEMP];
                this.logger?.debug(`[Local] getTargetTemperature for ${deviceName} - Raw API value: ${rawValue}, Requested scale: ${scale}`);

                let celsius = this._decodeTemperature(rawValue);
                this.logger?.debug(`[Local] getTargetTemperature for ${deviceName} - After decoding: ${celsius}°C`);

                if (scale === airstageConstants.TEMPERATURE_SCALE_FAHRENHEIT) {
                    const fahrenheit = this._celsiusToFahrenheit(celsius);
                    this.logger?.debug(`[Local] getTargetTemperature for ${deviceName} - After C→F conversion: ${fahrenheit}°F (returning)`);
                    celsius = fahrenheit;
                } else {
                    this.logger?.debug(`[Local] getTargetTemperature for ${deviceName} - Returning Celsius: ${celsius}°C`);
                }

                callback(null, celsius);
            })
            .catch(error => callback(error, null));
    }

    setTargetTemperature(deviceId, temperature, scale, callback) {
        const device = this.devices.get(deviceId.toUpperCase());
        const deviceName = device ? device.name : deviceId;
        const scaleLabel = scale === airstageConstants.TEMPERATURE_SCALE_FAHRENHEIT ? '°F' : '°C';

        this.logger?.debug(`[Local] setTargetTemperature for ${deviceName} - Received from HomeKit: ${temperature}${scaleLabel}`);

        let celsius = temperature;

        if (scale === airstageConstants.TEMPERATURE_SCALE_FAHRENHEIT) {
            celsius = this._fahrenheitToCelsius(temperature);
            this.logger?.debug(`[Local] setTargetTemperature for ${deviceName} - After F→C conversion: ${celsius}°C`);
        } else {
            const original = celsius;
            celsius = this._getClosestValidTemperature(temperature, airstageConstants.TEMPERATURE_SCALE_CELSIUS);
            this.logger?.debug(`[Local] setTargetTemperature for ${deviceName} - After rounding ${original}°C to nearest valid: ${celsius}°C`);
        }

        const apiValue = this._encodeTemperature(celsius);
        this.logger?.debug(`[Local] setTargetTemperature for ${deviceName} - Encoded API value: ${apiValue} (${celsius}°C × 10)`);

        const values = {};
        values[localConstants.PARAM_TARGET_TEMP] = apiValue;

        this._setParam(deviceId, values)
            .then(() => {
                let result = celsius;
                if (scale === airstageConstants.TEMPERATURE_SCALE_FAHRENHEIT) {
                    result = this._celsiusToFahrenheit(celsius);
                }
                this.logger?.debug(`[Local] setTargetTemperature for ${deviceName} - SET completed successfully, returning: ${result}${scaleLabel}`);
                callback(null, result);
            })
            .catch(error => {
                this.logger?.error(`[Local] setTargetTemperature for ${deviceName} - SET failed: ${error.message}`);
                callback(error);
            });
    }

    getTemperatureDelta(deviceId, scale, callback) {
        this.getIndoorTemperature(deviceId, scale, (error, indoorTemperature) => {
            if (error) {
                return callback(error, null);
            }

            this.getTargetTemperature(deviceId, scale, (error, targetTemperature) => {
                if (error) {
                    return callback(error, null);
                }

                const temperatureDelta = indoorTemperature - targetTemperature;
                callback(null, temperatureDelta);
            });
        });
    }

    // ===================================================================
    // Fan Speed Methods
    // ===================================================================

    getFanSpeed(deviceId, callback) {
        this._getParam(deviceId, localConstants.PARAM_FAN_SPEED)
            .then(response => {
                const fanSpeed = this._parameterValueToFanSpeed(response[localConstants.PARAM_FAN_SPEED]);
                callback(null, fanSpeed);
            })
            .catch(error => callback(error, null));
    }

    setFanSpeed(deviceId, fanSpeed, callback) {
        const device = this.devices.get(deviceId.toUpperCase());
        const speedNames = {
            [airstageConstants.FAN_SPEED_AUTO]: 'Auto',
            [airstageConstants.FAN_SPEED_QUIET]: 'Quiet',
            [airstageConstants.FAN_SPEED_LOW]: 'Low',
            [airstageConstants.FAN_SPEED_MEDIUM]: 'Medium',
            [airstageConstants.FAN_SPEED_HIGH]: 'High'
        };
        const speedName = speedNames[fanSpeed] || fanSpeed;
        this.logger?.info(`[Local] ${device ? device.name : deviceId} (${deviceId} @ ${device ? device.ipAddress : 'unknown'}) - Fan Speed: ${speedName}`);

        const parameterValue = this._fanSpeedToParameterValue(fanSpeed);
        const values = {};
        values[localConstants.PARAM_FAN_SPEED] = parameterValue;

        this._setParam(deviceId, values)
            .then(() => {
                callback(null, fanSpeed);
            })
            .catch(error => callback(error));
    }

    // ===================================================================
    // Airflow Methods
    // ===================================================================

    getAirflowVerticalDirection(deviceId, callback) {
        this._getParam(deviceId, localConstants.PARAM_AIRFLOW_VERTICAL_DIRECTION)
            .then(response => {
                const value = this._validateAirflowVerticalDirectionValue(
                    parseInt(response[localConstants.PARAM_AIRFLOW_VERTICAL_DIRECTION])
                );
                callback(null, value);
            })
            .catch(error => callback(error, null));
    }

    setAirflowVerticalDirection(deviceId, value, callback) {
        const validatedValue = this._validateAirflowVerticalDirectionValue(value);
        const values = {};
        values[localConstants.PARAM_AIRFLOW_VERTICAL_DIRECTION] = validatedValue.toString();

        this._setParam(deviceId, values)
            .then(() => {
                callback(null, validatedValue);
            })
            .catch(error => callback(error));
    }

    getAirflowVerticalSwingState(deviceId, callback) {
        this._getParam(deviceId, localConstants.PARAM_AIRFLOW_VERTICAL_SWING)
            .then(response => {
                const toggle = this._parameterValueToToggle(response[localConstants.PARAM_AIRFLOW_VERTICAL_SWING]);
                callback(null, toggle);
            })
            .catch(error => callback(error, null));
    }

    setAirflowVerticalSwingState(deviceId, toggle, callback) {
        const parameterValue = this._toggleToParameterValue(toggle);
        const values = {};
        values[localConstants.PARAM_AIRFLOW_VERTICAL_SWING] = parameterValue;

        this._setParam(deviceId, values)
            .then(() => {
                callback(null, toggle);
            })
            .catch(error => callback(error));
    }

    // ===================================================================
    // Special Mode Methods
    // ===================================================================

    getPowerfulState(deviceId, callback) {
        this._getParam(deviceId, localConstants.PARAM_POWERFUL)
            .then(response => {
                const toggle = this._parameterValueToToggle(response[localConstants.PARAM_POWERFUL]);
                callback(null, toggle);
            })
            .catch(error => callback(error, null));
    }

    setPowerfulState(deviceId, toggle, callback) {
        const parameterValue = this._toggleToParameterValue(toggle);
        const values = {};
        values[localConstants.PARAM_POWERFUL] = parameterValue;

        this._setParam(deviceId, values)
            .then(() => {
                callback(null, toggle);
            })
            .catch(error => callback(error));
    }

    getEconomyState(deviceId, callback) {
        this._getParam(deviceId, localConstants.PARAM_ECONOMY)
            .then(response => {
                const toggle = this._parameterValueToToggle(response[localConstants.PARAM_ECONOMY]);
                callback(null, toggle);
            })
            .catch(error => callback(error, null));
    }

    setEconomyState(deviceId, toggle, callback) {
        const parameterValue = this._toggleToParameterValue(toggle);
        const values = {};
        values[localConstants.PARAM_ECONOMY] = parameterValue;

        this._setParam(deviceId, values)
            .then(() => {
                callback(null, toggle);
            })
            .catch(error => callback(error));
    }

    getEnergySavingFanState(deviceId, callback) {
        this._getParam(deviceId, localConstants.PARAM_FAN_CTRL)
            .then(response => {
                const toggle = this._parameterValueToToggle(response[localConstants.PARAM_FAN_CTRL]);
                callback(null, toggle);
            })
            .catch(error => callback(error, null));
    }

    setEnergySavingFanState(deviceId, toggle, callback) {
        const parameterValue = this._toggleToParameterValue(toggle);
        const values = {};
        values[localConstants.PARAM_FAN_CTRL] = parameterValue;

        this._setParam(deviceId, values)
            .then(() => {
                callback(null, toggle);
            })
            .catch(error => callback(error));
    }

    getMinimumHeatState(deviceId, callback) {
        this._getParam(deviceId, localConstants.PARAM_MIN_HEAT)
            .then(response => {
                const toggle = this._parameterValueToToggle(response[localConstants.PARAM_MIN_HEAT]);
                callback(null, toggle);
            })
            .catch(error => callback(error, null));
    }

    setMinimumHeatState(deviceId, toggle, callback) {
        const parameterValue = this._toggleToParameterValue(toggle);
        const values = {};
        values[localConstants.PARAM_MIN_HEAT] = parameterValue;

        this._setParam(deviceId, values)
            .then(() => {
                callback(null, toggle);
            })
            .catch(error => callback(error));
    }

    // ===================================================================
    // Device Health Status Methods
    // ===================================================================

    /**
     * Get device reachability status
     */
    getDeviceStatus(deviceId, callback) {
        const device = this.devices.get(deviceId.toUpperCase());

        if (!device) {
            return callback(new Error(`Device ${deviceId} not found`), null);
        }

        callback(null, {
            isReachable: device.isReachable,
            consecutiveFailures: device.consecutiveFailures,
            lastSuccessfulRequest: device.lastSuccessfulRequest,
            lastError: device.lastError,
            timeSinceLastSuccess: Date.now() - device.lastSuccessfulRequest
        });
    }

    // ===================================================================
    // Generic Parameter Methods
    // ===================================================================

    getParameter(deviceId, parameterName, callback) {
        this._getParam(deviceId, parameterName)
            .then(response => {
                callback(null, response[parameterName] || null);
            })
            .catch(error => callback(error, null));
    }

    setParameter(deviceId, parameterName, parameterValue, callback) {
        const values = {};
        values[parameterName] = parameterValue;

        this._setParam(deviceId, values)
            .then(response => {
                // Return device-like object for compatibility with cloud client pattern
                callback(null, {
                    parameters: response
                });
            })
            .catch(error => callback(error));
    }

    // ===================================================================
    // Stub Methods (not applicable for local mode)
    // ===================================================================

    // These methods are not applicable for local mode but included for interface compatibility
    refreshTokenOrAuthenticate(callback) {
        callback(null, null);
    }

    getDevices(callback) {
        const devices = Array.from(this.devices.values()).map(device => ({
            deviceId: device.deviceId,
            name: device.name,
            ipAddress: device.ipAddress
        }));
        callback(null, devices);
    }

    getTemperatureScale(callback) {
        // Check if any device has a stored temperature scale preference
        // Since temperature scale is per-user, not per-device, use first device's setting
        // or default to Celsius
        let scale = airstageConstants.TEMPERATURE_SCALE_CELSIUS;

        if (this.configManager && this.devices.size > 0) {
            const firstDeviceId = Array.from(this.devices.keys())[0];
            const storedScale = this.configManager.getTemperatureScale(firstDeviceId);
            if (storedScale) {
                scale = storedScale;
            }
        }

        callback(null, scale);
    }

    setTemperatureScale(scale, callback) {
        if (!this.configManager) {
            return callback(new Error('ConfigManager not available'), null);
        }

        // Store scale preference for all devices
        this.devices.forEach((device, deviceId) => {
            this.configManager.saveTemperatureScale(deviceId, scale);
        });

        this.logger?.info(`[Local] Temperature display units changed to: ${scale === airstageConstants.TEMPERATURE_SCALE_FAHRENHEIT ? '°F' : '°C'}`);

        callback(null, scale);
    }
}

module.exports = LocalClient;
