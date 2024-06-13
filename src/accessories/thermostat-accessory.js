'use strict';

const airstage = require('./../airstage');

class ThermostatAccessory {

    constructor(platform, accessory) {
        this.platform = platform;
        this.accessory = accessory;

        this.deviceId = this.accessory.context.deviceId;
        this.airstageClient = this.accessory.context.airstageClient;

        this.accessory.getService(this.platform.Service.AccessoryInformation)
            .setCharacteristic(this.platform.Characteristic.Manufacturer, airstage.constants.MANUFACTURER_FUJITSU)
            .setCharacteristic(this.platform.Characteristic.Model, this.accessory.context.model)
            .setCharacteristic(this.platform.Characteristic.SerialNumber, this.accessory.context.deviceId);

        this.service = (
            this.accessory.getService(this.platform.Service.Thermostat) ||
            this.accessory.addService(this.platform.Service.Thermostat)
        );

        this.service.getCharacteristic(this.platform.Characteristic.CurrentHeatingCoolingState)
            .on('get', this.getCurrentHeatingCoolingState.bind(this));

        this.service.getCharacteristic(this.platform.Characteristic.TargetHeatingCoolingState)
            .on('get', this.getTargetHeatingCoolingState.bind(this))
            .on('set', this.setTargetHeatingCoolingState.bind(this));

        this.service.getCharacteristic(this.platform.Characteristic.CurrentTemperature)
            .on('get', this.getCurrentTemperature.bind(this));

        this.service.getCharacteristic(this.platform.Characteristic.TargetTemperature)
            .on('get', this.getTargetTemperature.bind(this))
            .on('set', this.setTargetTemperature.bind(this));

        this.service.getCharacteristic(this.platform.Characteristic.TemperatureDisplayUnits)
            .on('get', this.getTemperatureDisplayUnits.bind(this))
            .on('set', this.setTemperatureDisplayUnits.bind(this));

        this.service.getCharacteristic(this.platform.Characteristic.Name)
            .on('get', this.getName.bind(this));
    }

    getCurrentHeatingCoolingState(callback) {
        this.airstageClient.getPowerState(this.deviceId, (function(error, powerState) {
            if (error) {
                return callback(error, null);
            }

            if (powerState === airstage.constants.TOGGLE_OFF) {
                return callback(
                    null,
                    this.platform.Characteristic.CurrentHeatingCoolingState.OFF
                );
            }

            this.airstageClient.getOperationMode(this.deviceId, (function(error, operationMode) {
                let currentHeatingCoolingState = null;

                if (error) {
                    return callback(error, null);
                }

                if (operationMode === airstage.constants.OPERATION_MODE_AUTO) {
                    return this.airstageClient.getTemperatureDelta(
                        this.deviceId,
                        airstage.constants.TEMPERATURE_SCALE_CELSIUS,
                        (function(error, temperatureDelta) {
                            if (error) {
                                return callback(error, null);
                            }

                            if (temperatureDelta > 0) {
                                currentHeatingCoolingState = this.platform.Characteristic.CurrentHeatingCoolingState.COOL;
                            } else if (temperatureDelta < 0) {
                                currentHeatingCoolingState = this.platform.Characteristic.CurrentHeatingCoolingState.HEAT;
                            } else {
                                currentHeatingCoolingState = this.platform.Characteristic.CurrentHeatingCoolingState.OFF;
                            }

                            callback(null, currentHeatingCoolingState);
                        }).bind(this)
                    );
                }

                if (operationMode === airstage.constants.OPERATION_MODE_COOL) {
                    currentHeatingCoolingState = this.platform.Characteristic.CurrentHeatingCoolingState.COOL;
                } else if (operationMode === airstage.constants.OPERATION_MODE_DRY) {
                    currentHeatingCoolingState = this.platform.Characteristic.CurrentHeatingCoolingState.COOL;
                } else if (operationMode === airstage.constants.OPERATION_MODE_FAN) {
                    currentHeatingCoolingState = this.platform.Characteristic.CurrentHeatingCoolingState.OFF;
                } else if (operationMode === airstage.constants.OPERATION_MODE_HEAT) {
                    currentHeatingCoolingState = this.platform.Characteristic.CurrentHeatingCoolingState.HEAT;
                }

                callback(null, currentHeatingCoolingState);
            }).bind(this));
        }).bind(this));
    }

    getTargetHeatingCoolingState(callback) {
        this.airstageClient.getPowerState(this.deviceId, (function(error, powerState) {
            if (error) {
                return callback(error, null);
            }

            if (powerState === airstage.constants.TOGGLE_OFF) {
                return callback(
                    null,
                    this.platform.Characteristic.TargetHeatingCoolingState.OFF
                );
            }

            this.airstageClient.getOperationMode(this.deviceId, (function(error, operationMode) {
                let targetHeatingCoolingState = null;

                if (error) {
                    return callback(error, null);
                }

                if (operationMode === airstage.constants.OPERATION_MODE_COOL) {
                    targetHeatingCoolingState = this.platform.Characteristic.TargetHeatingCoolingState.COOL;
                } else if (operationMode === airstage.constants.OPERATION_MODE_DRY) {
                    targetHeatingCoolingState = this.platform.Characteristic.TargetHeatingCoolingState.COOL;
                } else if (operationMode === airstage.constants.OPERATION_MODE_FAN) {
                    targetHeatingCoolingState = this.platform.Characteristic.TargetHeatingCoolingState.OFF;
                } else if (operationMode === airstage.constants.OPERATION_MODE_HEAT) {
                    targetHeatingCoolingState = this.platform.Characteristic.TargetHeatingCoolingState.HEAT;
                } else if (operationMode === airstage.constants.OPERATION_MODE_AUTO) {
                    targetHeatingCoolingState = this.platform.Characteristic.TargetHeatingCoolingState.AUTO;
                }

                callback(null, targetHeatingCoolingState);
            }).bind(this));
        }).bind(this));
    }

    setTargetHeatingCoolingState(value, callback) {
        let operationMode = null;

        if (value === this.platform.Characteristic.TargetHeatingCoolingState.OFF) {
            return this.airstageClient.setPowerState(
                this.deviceId,
                airstage.constants.TOGGLE_OFF,
                (function(error) {
                    if (error) {
                        return callback(error);
                    }

                    this._updateFanServiceCharacteristics();
                    this._updateFanModeSwitchCharacteristics();
                    this._updateDryModeSwitchCharacteristics();

                    callback(null);
                }).bind(this)
            );
        }

        this.airstageClient.setPowerState(
            this.deviceId,
            airstage.constants.TOGGLE_ON,
            (function(error) {
                if (error) {
                    return callback(error);
                }

                if (value === this.platform.Characteristic.TargetHeatingCoolingState.COOL) {
                    operationMode = airstage.constants.OPERATION_MODE_COOL;
                } else if (value === this.platform.Characteristic.TargetHeatingCoolingState.HEAT) {
                    operationMode = airstage.constants.OPERATION_MODE_HEAT;
                } else if (value === this.platform.Characteristic.TargetHeatingCoolingState.AUTO) {
                    operationMode = airstage.constants.OPERATION_MODE_AUTO;
                }

                this.airstageClient.setOperationMode(
                    this.deviceId,
                    operationMode,
                    (function(error) {
                        if (error) {
                            return callback(error);
                        }

                        this._updateFanServiceCharacteristics();
                        this._updateFanModeSwitchCharacteristics();
                        this._updateDryModeSwitchCharacteristics();

                        callback(null);
                    }).bind(this)
                );
            }).bind(this)
        );
    }

    getCurrentTemperature(callback) {
        this.airstageClient.getIndoorTemperature(
            this.deviceId,
            airstage.constants.TEMPERATURE_SCALE_CELSIUS,
            function (error, indoorTemperature) {
                if (error) {
                    return callback(error, null);
                }

                if (indoorTemperature === null) {
                    throw new this.platform.api.hap.HapStatusError(
                        this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE
                    );
                }

                callback(null, indoorTemperature);
            }
        );
    }

    getTargetTemperature(callback) {
        this.airstageClient.getTargetTemperature(
            this.deviceId,
            airstage.constants.TEMPERATURE_SCALE_CELSIUS,
            function (error, targetTemperature) {
                if (error) {
                    return callback(error, null);
                }

                callback(null, targetTemperature);
            }
        );
    }

    setTargetTemperature(value, callback) {
        this.airstageClient.setTargetTemperature(
            this.deviceId,
            value,
            airstage.constants.TEMPERATURE_SCALE_CELSIUS,
            function (error) {
                callback(error);
            }
        );
    }

    getTemperatureDisplayUnits(callback) {
        this.airstageClient.getTemperatureScale((function (error, temperatureScale) {
            let temperatureDisplayUnits = null;

            if (error) {
                return callback(error, null);
            }

            if (temperatureScale === airstage.constants.TEMPERATURE_SCALE_CELSIUS) {
                temperatureDisplayUnits = this.platform.Characteristic.TemperatureDisplayUnits.CELSIUS;
            } else if (temperatureScale === airstage.constants.TEMPERATURE_SCALE_FAHRENHEIT) {
                temperatureDisplayUnits = this.platform.Characteristic.TemperatureDisplayUnits.FAHRENHEIT;
            }

            callback(null, temperatureDisplayUnits);
        }).bind(this));
    }

    setTemperatureDisplayUnits(value, callback) {
        let scale = null;

        if (value === this.platform.Characteristic.TemperatureDisplayUnits.FAHRENHEIT) {
            temperatureScale = airstage.constants.TEMPERATURE_SCALE_FAHRENHEIT;
        } else if (value === this.platform.Characteristic.TemperatureDisplayUnits.CELSIUS) {
            temperatureScale = airstage.constants.TEMPERATURE_SCALE_CELSIUS;
        }

        this.airstageClient.setTemperatureScale(scale, function(error) {
            callback(error);
        });
    }

    getName(callback) {
        this.airstageClient.getName(this.deviceId, function(error, name) {
            if (error) {
                return callback(error, null);
            }

            callback(null, name + ' Thermostat');
        });
    }

    _updateFanServiceCharacteristics() {
        const fanService = this._getFanService();

        if (fanService === null) {
            return false;
        }

        const active = fanService.getCharacteristic(
            this.platform.Characteristic.Active
        );
        const currentFanState = fanService.getCharacteristic(
            this.platform.Characteristic.CurrentFanState
        );
        const targetFanState = fanService.getCharacteristic(
            this.platform.Characteristic.TargetFanState
        );
        const rotationSpeed = fanService.getCharacteristic(
            this.platform.Characteristic.RotationSpeed
        );

        active.emit('get', function(error, value) {
            if (error === null) {
                active.sendEventNotification(value);
            }
        });

        currentFanState.emit('get', function(error, value) {
            if (error === null) {
                currentFanState.sendEventNotification(value);
            }
        });

        targetFanState.emit('get', function(error, value) {
            if (error === null) {
                targetFanState.sendEventNotification(value);
            }
        });

        rotationSpeed.emit('get', function(error, value) {
            if (error === null) {
                rotationSpeed.sendEventNotification(value);
            }
        });

        return true;
    }

    _updateFanModeSwitchCharacteristics() {
        const fanModeSwitch = this._getFanModeSwitch();

        if (fanModeSwitch === null) {
            return false;
        }

        const on = fanModeSwitch.getCharacteristic(
            this.platform.Characteristic.on
        );

        on.emit('get', function(error, value) {
            if (error === null) {
                on.sendEventNotification(value);
            }
        });

        return true;
    }

    _updateDryModeSwitchCharacteristics() {
        const dryModeSwitch = this._getDryModeSwitch();

        if (dryModeSwitch === null) {
            return false;
        }

        const on = dryModeSwitch.getCharacteristic(
            this.platform.Characteristic.on
        );

        on.emit('get', function(error, value) {
            if (error === null) {
                on.sendEventNotification(value);
            }
        });

        return true;
    }

    _getFanService() {
        let fanService = null;
        const uuid = this.platform.api.hap.uuid.generate(
            this.deviceId + '-fan'
        );
        const existingAccessory = this.platform.accessories.find(
            accessory => accessory.UUID === uuid
        );

        if (existingAccessory) {
            fanService = existingAccessory.services.find(
                service => service instanceof this.platform.Service.Fanv2
            );
        }

        return fanService;
    }

    _getFanModeSwitch() {
        let fanModeSwitch = null;
        const uuid = this.platform.api.hap.uuid.generate(
            this.deviceId + '-fan-mode-switch'
        );
        const existingAccessory = this.platform.accessories.find(
            accessory => accessory.UUID === uuid
        );

        if (existingAccessory) {
            fanModeSwitch = existingAccessory.services.find(
                service => service instanceof this.platform.Service.Switch
            );
        }

        return fanModeSwitch;
    }

    _getDryModeSwitch() {
        let dryModeSwitch = null;
        const uuid = this.platform.api.hap.uuid.generate(
            this.deviceId + '-dry-mode-switch'
        );
        const existingAccessory = this.platform.accessories.find(
            accessory => accessory.UUID === uuid
        );

        if (existingAccessory) {
            dryModeSwitch = existingAccessory.services.find(
                service => service instanceof this.platform.Service.Switch
            );
        }

        return dryModeSwitch;
    }
}

module.exports = ThermostatAccessory;
