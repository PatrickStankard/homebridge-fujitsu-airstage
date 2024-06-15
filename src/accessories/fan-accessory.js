'use strict';

const airstage = require('./../airstage');

class FanAccessory {

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
            this.accessory.getService(this.platform.Service.Fanv2) ||
            this.accessory.addService(this.platform.Service.Fanv2)
        );

        this.service.getCharacteristic(this.platform.Characteristic.Active)
            .on('get', this.getActive.bind(this))
            .on('set', this.setActive.bind(this));

        this.service.getCharacteristic(this.platform.Characteristic.CurrentFanState)
            .on('get', this.getCurrentFanState.bind(this));

        this.service.getCharacteristic(this.platform.Characteristic.TargetFanState)
            .on('get', this.getTargetFanState.bind(this))
            .on('set', this.setTargetFanState.bind(this));

        this.service.getCharacteristic(this.platform.Characteristic.Name)
            .on('get', this.getName.bind(this));

        this.service.getCharacteristic(this.platform.Characteristic.RotationSpeed)
            .on('get', this.getRotationSpeed.bind(this))
            .on('set', this.setRotationSpeed.bind(this));

        this.service.getCharacteristic(this.platform.Characteristic.SwingMode)
            .on('get', this.getSwingMode.bind(this))
            .on('set', this.setSwingMode.bind(this));
    }

    getActive(callback) {
        this.airstageClient.getPowerState(this.deviceId, (function(error, powerState) {
            let value = null;

            if (error) {
                return callback(error, null);
            }

            if (powerState === airstage.constants.TOGGLE_ON) {
                value = this.platform.Characteristic.Active.ACTIVE;
            } else if (powerState === airstage.constants.TOGGLE_OFF) {
                value = this.platform.Characteristic.Active.INACTIVE;
            }

            callback(null, value);
        }).bind(this));
    }

    setActive(value, callback) {
        let powerState = null;

        if (value === this.platform.Characteristic.Active.ACTIVE) {
            powerState = airstage.constants.TOGGLE_ON;
        } else if (value === this.platform.Characteristic.Active.INACTIVE) {
            powerState = airstage.constants.TOGGLE_OFF;
        }

        this.airstageClient.setPowerState(this.deviceId, powerState, (function(error) {
            if (error) {
                return callback(error);
            }

            this._refreshRelatedAccessoryCharacteristics();

            callback(null);
        }).bind(this));
    }

    getCurrentFanState(callback) {
        this.airstageClient.getPowerState(this.deviceId, (function(error, powerState) {
            let value = null;

            if (error) {
                return callback(error, null);
            }

            if (powerState === airstage.constants.TOGGLE_ON) {
                value = this.platform.Characteristic.CurrentFanState.BLOWING_AIR;
            } else if (powerState === airstage.constants.TOGGLE_OFF) {
                value = this.platform.Characteristic.CurrentFanState.INACTIVE;
            }

            callback(null, value);
        }).bind(this));
    }

    getTargetFanState(callback) {
        this.airstageClient.getFanSpeed(this.deviceId, (function(error, fanSpeed) {
            let value = this.platform.Characteristic.TargetFanState.MANUAL;

            if (error) {
                return callback(error, null);
            }

            if (fanSpeed === airstage.constants.FAN_SPEED_AUTO) {
                value = this.platform.Characteristic.TargetFanState.AUTO;
            }

            callback(null, value);
        }).bind(this));
    }

    setTargetFanState(value, callback) {
        if (value !== this.platform.Characteristic.TargetFanState.AUTO) {
            return callback(null);
        }

        this.airstageClient.setFanSpeed(
            this.deviceId,
            airstage.constants.FAN_SPEED_AUTO,
            (function(error) {
                if (error) {
                    return callback(error);
                }

                this.service.updateCharacteristic(
                    this.platform.Characteristic.RotationSpeed,
                    0
                );

                callback(null);
            }).bind(this)
        );
    }

    getName(callback) {
        this.airstageClient.getName(this.deviceId, function(error, name) {
            if (error) {
                return callback(error, null);
            }

            callback(null, name + ' Fan');
        });
    }

    getRotationSpeed(callback) {
        this.airstageClient.getFanSpeed(this.deviceId, (function(error, fanSpeed) {
            let value = 0;

            if (error) {
                return callback(error, null);
            }

            if (fanSpeed === airstage.constants.FAN_SPEED_QUIET) {
                value = 25;
            } else if (fanSpeed === airstage.constants.FAN_SPEED_LOW) {
                value = 50;
            } else if (fanSpeed === airstage.constants.FAN_SPEED_MEDIUM) {
                value = 75;
            } else if (fanSpeed === airstage.constants.FAN_SPEED_HIGH) {
                value = 100;
            }

            callback(null, value);
        }).bind(this));
    }

    setRotationSpeed(value, callback) {
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

        this.airstageClient.setFanSpeed(
            this.deviceId,
            fanSpeed,
            (function(error) {
                if (error) {
                    return callback(error);
                }

                this.service.updateCharacteristic(
                    this.platform.Characteristic.TargetFanState,
                    this.platform.Characteristic.TargetFanState.MANUAL
                );

                callback(null);
            }).bind(this)
        );
    }

    getSwingMode(callback) {
        this.airstageClient.getAirflowVerticalSwingState(
            this.deviceId,
            (function(error, swingState) {
                let value = null;

                if (error) {
                    return callback(error, null);
                }


                if (swingState === airstage.constants.TOGGLE_ON) {
                    value = this.platform.Characteristic.SwingMode.SWING_ENABLED;
                } else if (swingState === airstage.constants.TOGGLE_OFF) {
                    value = this.platform.Characteristic.SwingMode.SWING_DISABLED;
                }

                callback(null, value);
            }).bind(this)
        );
    }

    setSwingMode(value, callback) {
        let swingState = null;

        if (value === this.platform.Characteristic.SwingMode.SWING_ENABLED) {
            swingState = airstage.constants.TOGGLE_ON;
        } else if (value === this.platform.Characteristic.SwingMode.SWING_DISABLED) {
            swingState = airstage.constants.TOGGLE_OFF;
        }

        this.airstageClient.setAirflowVerticalSwingState(
            this.deviceId,
            swingState,
            function(error) {
                callback(error);
            }
        );
    }

    _refreshRelatedAccessoryCharacteristics() {
        const accessoryManager = this.platform.accessoryManager;

        accessoryManager.refreshThermostatAccessoryCharacteristics(this.deviceId);
    }
}

module.exports = FanAccessory;
