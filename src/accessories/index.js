'use strict';

const ThermostatAccessory = require('./thermostat-accessory');
const FanAccessory = require('./fan-accessory');
const VerticalAirflowDirectionAccessory = require('./vertical-airflow-direction-accessory');
const AutoFanSpeedSwitchAccessory = require('./auto-fan-speed-switch-accessory');
const DryModeSwitchAccessory = require('./dry-mode-switch-accessory');
const EconomySwitchAccessory = require('./economy-switch-accessory');
const EnergySavingFanSwitchAccessory = require('./energy-saving-fan-switch-accessory');
const FanModeSwitchAccessory = require('./fan-mode-switch-accessory');
const MinimumHeatModeSwitchAccessory = require('./minimum-heat-mode-switch-accessory');
const PowerfulSwitchAccessory = require('./powerful-switch-accessory');

module.exports = {
    ThermostatAccessory,
    FanAccessory,
    VerticalAirflowDirectionAccessory,
    AutoFanSpeedSwitchAccessory,
    DryModeSwitchAccessory,
    EconomySwitchAccessory,
    EnergySavingFanSwitchAccessory,
    FanModeSwitchAccessory,
    MinimumHeatModeSwitchAccessory,
    PowerfulSwitchAccessory
};
