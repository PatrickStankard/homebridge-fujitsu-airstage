'use strict';

const Accessory = require('./accessory');
const airstage = require('./../airstage');

class VerticalSlatsAccessory extends Accessory {

    constructor(platform, accessory) {
        super(platform, accessory);

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
        const methodName = this.getCurrentSlatState.name;

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
                    value = this.platform.Characteristic.CurrentSlatState.SWINGING;
                } else if (swingState === airstage.constants.TOGGLE_OFF) {
                    value = this.platform.Characteristic.CurrentSlatState.FIXED;
                }

                callback(null, value);
            }).bind(this)
        );
    }

    getSlatType(callback) {
        const methodName = this.getSlatType.name;

        this._logMethodCall(methodName);

        const value = this.platform.Characteristic.SlatType.VERTICAL;

        this._logMethodCallResult(methodName, null, value);

        callback(null, value);
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

                const value = name + ' Vertical Slats';

                this._logMethodCallResult(methodName, null, value);

                callback(null, value);
            }).bind(this)
        );
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
                    value = this.platform.Characteristic.SwingMode.SWING_ENABLED;
                } else if (swingState === airstage.constants.TOGGLE_OFF) {
                    value = this.platform.Characteristic.SwingMode.SWING_DISABLED;
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

        if (value === this.platform.Characteristic.SwingMode.SWING_ENABLED) {
            swingState = airstage.constants.TOGGLE_ON;
        } else if (value === this.platform.Characteristic.SwingMode.SWING_DISABLED) {
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

                callback(null);
            }).bind(this)
        );
    }

    getCurrentTiltAngle(callback) {
        const methodName = this.getCurrentTiltAngle.name;

        this._logMethodCall(methodName);

        let currentTiltAngle = null;

        this.airstageClient.getPowerState(
            this.deviceId,
            (function(error, powerState) {
                if (error) {
                    this._logMethodCallResult(methodName, error);

                    return callback(error, null);
                }

                if (powerState === airstage.constants.TOGGLE_OFF) {
                    currentTiltAngle = -90;

                    this._logMethodCallResult(methodName, null, currentTiltAngle);

                    return callback(null, currentTiltAngle);
                }

                this.airstageClient.getAirflowVerticalDirection(
                    this.deviceId,
                    (function(error, airflowVerticalDirection) {
                        if (error) {
                            this._logMethodCallResult(methodName, error);

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

                        this._logMethodCallResult(methodName, null, currentTiltAngle);

                        callback(null, currentTiltAngle);
                    }).bind(this)
                );
            }).bind(this)
        );
    }

    getTargetTiltAngle(callback) {
        const methodName = this.getTargetTiltAngle.name;

        this._logMethodCall(methodName);

        let targetTiltAngle = null;

        this.airstageClient.getPowerState(
            this.deviceId,
            (function(error, powerState) {
                if (error) {
                    this._logMethodCallResult(methodName, error);

                    return callback(error, null);
                }

                if (powerState === airstage.constants.TOGGLE_OFF) {
                    targetTiltAngle = -90;

                    this._logMethodCallResult(methodName, null, targetTiltAngle);

                    return callback(null, targetTiltAngle);
                }

                this.airstageClient.getAirflowVerticalDirection(
                    this.deviceId,
                    (function(error, airflowVerticalDirection) {
                        if (error) {
                            this._logMethodCallResult(methodName, error);

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

                        this._logMethodCallResult(methodName, null, targetTiltAngle);

                        callback(null, targetTiltAngle);
                    }).bind(this)
                );
            }).bind(this)
        );
    }

    setTargetTiltAngle(value, callback) {
        const methodName = this.setTargetTiltAngle.name;

        this._logMethodCall(methodName, value);

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
}

module.exports = VerticalSlatsAccessory;
