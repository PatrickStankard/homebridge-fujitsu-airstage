'use strict';

const Accessory = require('./accessory');
const airstage = require('./../airstage');

class EnergySavingFanSwitchAccessory extends Accessory {

    constructor(platform, accessory) {
        super(platform, accessory);

        this.service = (
            this.accessory.getService(this.platform.Service.Switch) ||
            this.accessory.addService(this.platform.Service.Switch)
        );

        this.service.getCharacteristic(this.platform.Characteristic.On)
            .on('get', this.getOn.bind(this))
            .on('set', this.setOn.bind(this));

        this.service.getCharacteristic(this.platform.Characteristic.Name)
            .on('get', this.getName.bind(this));
    }

    getOn(callback) {
        const methodName = this.getOn.name;

        this._logMethodCall(methodName);

        this.airstageClient.getEnergySavingFanState(
            this.deviceId,
            (function(error, energySavingFanState) {
                let value = null;

                if (error) {
                    this._logMethodCallResult(methodName, error);

                    return callback(error, null);
                }

                if (energySavingFanState === airstage.constants.TOGGLE_ON) {
                    value = true;
                } else if (energySavingFanState === airstage.constants.TOGGLE_OFF) {
                    value = false;
                }

                this._logMethodCallResult(methodName, null, value);

                callback(null, value);
            }).bind(this)
        );
    }

    setOn(value, callback) {
        const methodName = this.setOn.name;

        this._logMethodCall(methodName, value);

        let energySavingFanState = null;

        if (value) {
            energySavingFanState = airstage.constants.TOGGLE_ON;
        } else {
            energySavingFanState = airstage.constants.TOGGLE_OFF;
        }

        this.airstageClient.setEnergySavingFanState(
            this.deviceId,
            energySavingFanState,
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

                const value = name + ' Energy Saving Fan Switch';

                this._logMethodCallResult(methodName, null, value);

                callback(null, value);
            }).bind(this)
        );
    }
}

module.exports = EnergySavingFanSwitchAccessory;
