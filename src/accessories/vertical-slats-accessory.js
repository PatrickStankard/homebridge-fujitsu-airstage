'use strict';

const airstage = require('./../airstage');

class VerticalSlatsAccessory {

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
            this.accessory.getService(this.platform.Service.Slats) ||
            this.accessory.addService(this.platform.Service.Slats)
        );

        this.service.getCharacteristic(this.platform.Characteristic.CurrentSlatState)
            .on('get', this.getCurrentSlatState.bind(this))

        this.service.getCharacteristic(this.platform.Characteristic.SlatType)
            .on('get', this.getSlatType.bind(this))

        this.service.getCharacteristic(this.platform.Characteristic.Name)
            .on('get', this.getName.bind(this));

        this.service.getCharacteristic(this.platform.Characteristic.SwingMode)
            .on('get', this.getSwingMode.bind(this))
            .on('set', this.setSwingMode.bind(this));

        this.service.getCharacteristic(this.platform.Characteristic.CurrentTiltAngle)
            .on('get', this.getCurrentTiltAngle.bind(this))

        this.service.getCharacteristic(this.platform.Characteristic.TargetTiltAngle)
            .on('get', this.getTargetTiltAngle.bind(this))
            .on('set', this.setTargetTiltAngle.bind(this));
    }

    getCurrentSlatState(callback) {
        this.airstageClient.getAirflowVerticalSwingState(this.deviceId, (function(error, swingState) {
            let value = null;

            if (error) {
                return callback(error, null);
            }

            if (swingState === airstage.constants.TOGGLE_ON) {
                value = this.platform.Characteristic.CurrentSlatState.SWINGING;
            } else if (swingState === airstage.constants.TOGGLE_OFF) {
                value = this.platform.Characteristic.CurrentSlatState.FIXED;
            }

            callback(null, value);
        }).bind(this));
    }

    getSlatType(callback) {
        callback(null, this.platform.Characteristic.SlatType.VERTICAL);
    }

    getName(callback) {
        this.airstageClient.getName(this.deviceId, function(error, name) {
            if (error) {
                return callback(error, null);
            }

            callback(null, name + ' Vertical Slats');
        });
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

    getCurrentTiltAngle(callback) {
        let currentTiltAngle = null;

        this.airstageClient.getPowerState(this.deviceId, (function(error, powerState) {
            if (error) {
                return callback(error, null);
            }

            if (powerState === airstage.constants.TOGGLE_OFF) {
                currentTiltAngle = -90;

                return callback(null, currentTiltAngle);
            }

            this.airstageClient.getAirflowVerticalDirection(
                this.deviceId,
                function(error, airflowVerticalDirection) {
                    if (error) {
                        return callback(error, null);
                    }

                    if (airflowVerticalDirection === 1) {
                        currentTiltAngle = -68;
                    } else if (airflowVerticalDirection === 2) {
                        currentTiltAngle = -46;
                    } else if (airflowVerticalDirection === 3) {
                        currentTiltAngle = -24
                    } else if (airflowVerticalDirection === 4) {
                        currentTiltAngle = 0;
                    }

                    return callback(null, currentTiltAngle);
                }
            );
        }).bind(this));
    }

    getTargetTiltAngle(callback) {
        let targetTiltAngle = null;

        this.airstageClient.getPowerState(this.deviceId, (function(error, powerState) {
            if (error) {
                return callback(error, null);
            }

            if (powerState === airstage.constants.TOGGLE_OFF) {
                targetTiltAngle = -90;

                return callback(null, targetTiltAngle);
            }

            this.airstageClient.getAirflowVerticalDirection(
                this.deviceId,
                function(error, airflowVerticalDirection) {
                    if (error) {
                        return callback(error, null);
                    }

                    if (airflowVerticalDirection === 1) {
                        targetTiltAngle = -67;
                    } else if (airflowVerticalDirection === 2) {
                        targetTiltAngle = -45;
                    } else if (airflowVerticalDirection === 3) {
                        targetTiltAngle = -22
                    } else if (airflowVerticalDirection === 4) {
                        targetTiltAngle = 0;
                    }

                    return callback(null, targetTiltAngle);
                }
            );
        }).bind(this));
    }

    setTargetTiltAngle(value, callback) {
        let airflowVerticalDirection = null;

        if (value >= 0) {
            airflowVerticalDirection = 4;
        } else if (value >= -22) {
            airflowVerticalDirection = 3;
        } else if (value >= -45) {
            airflowVerticalDirection = 2;
        } else if (value >= -67) {
            airflowVerticalDirection = 1;
        }

        this.airstageClient.setAirflowVerticalDirection(
            this.deviceId,
            airflowVerticalDirection,
            function(error) {
                callback(error);
            }
        );
    }
}

module.exports = VerticalSlatsAccessory;
