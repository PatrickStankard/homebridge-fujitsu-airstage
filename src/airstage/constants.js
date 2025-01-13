'use strict';

const apiv1 = require('./apiv1');

// Manufacturer
module.exports.MANUFACTURER_FUJITSU = 'Fujitsu';

// Operation modes
module.exports.OPERATION_MODE_AUTO = 'AUTO';
module.exports.OPERATION_MODE_COOL = 'COOL';
module.exports.OPERATION_MODE_DRY = 'DRY';
module.exports.OPERATION_MODE_FAN = 'FAN';
module.exports.OPERATION_MODE_HEAT = 'HEAT';

module.exports.OPERATION_MODES = [
    module.exports.OPERATION_MODE_AUTO,
    module.exports.OPERATION_MODE_COOL,
    module.exports.OPERATION_MODE_DRY,
    module.exports.OPERATION_MODE_FAN,
    module.exports.OPERATION_MODE_HEAT
];

module.exports.OPERATION_MODE_TO_PARAMETER_VALUE_MAP = {};
module.exports.OPERATION_MODE_TO_PARAMETER_VALUE_MAP[module.exports.OPERATION_MODE_AUTO] = apiv1.constants.PARAMETER_OPERATION_MODE_AUTO;
module.exports.OPERATION_MODE_TO_PARAMETER_VALUE_MAP[module.exports.OPERATION_MODE_COOL] = apiv1.constants.PARAMETER_OPERATION_MODE_COOL;
module.exports.OPERATION_MODE_TO_PARAMETER_VALUE_MAP[module.exports.OPERATION_MODE_DRY] = apiv1.constants.PARAMETER_OPERATION_MODE_DRY;
module.exports.OPERATION_MODE_TO_PARAMETER_VALUE_MAP[module.exports.OPERATION_MODE_FAN] = apiv1.constants.PARAMETER_OPERATION_MODE_FAN;
module.exports.OPERATION_MODE_TO_PARAMETER_VALUE_MAP[module.exports.OPERATION_MODE_HEAT] = apiv1.constants.PARAMETER_OPERATION_MODE_HEAT;

module.exports.PARAMETER_VALUE_TO_OPERATION_MODE_MAP = {};
module.exports.PARAMETER_VALUE_TO_OPERATION_MODE_MAP[apiv1.constants.PARAMETER_OPERATION_MODE_AUTO] = module.exports.OPERATION_MODE_AUTO;
module.exports.PARAMETER_VALUE_TO_OPERATION_MODE_MAP[apiv1.constants.PARAMETER_OPERATION_MODE_COOL] = module.exports.OPERATION_MODE_COOL;
module.exports.PARAMETER_VALUE_TO_OPERATION_MODE_MAP[apiv1.constants.PARAMETER_OPERATION_MODE_DRY] = module.exports.OPERATION_MODE_DRY;
module.exports.PARAMETER_VALUE_TO_OPERATION_MODE_MAP[apiv1.constants.PARAMETER_OPERATION_MODE_FAN] = module.exports.OPERATION_MODE_FAN;
module.exports.PARAMETER_VALUE_TO_OPERATION_MODE_MAP[apiv1.constants.PARAMETER_OPERATION_MODE_HEAT] = module.exports.OPERATION_MODE_HEAT;

// Fan speeds
module.exports.FAN_SPEED_AUTO = 'AUTO';
module.exports.FAN_SPEED_QUIET = 'QUIET';
module.exports.FAN_SPEED_LOW = 'LOW';
module.exports.FAN_SPEED_MEDIUM = 'MEDIUM';
module.exports.FAN_SPEED_HIGH = 'HIGH';

module.exports.FAN_SPEEDS = [
    module.exports.FAN_SPEED_AUTO,
    module.exports.FAN_SPEED_QUIET,
    module.exports.FAN_SPEED_LOW,
    module.exports.FAN_SPEED_MEDIUM,
    module.exports.FAN_SPEED_HIGH
];

module.exports.FAN_SPEED_TO_PARAMETER_VALUE_MAP = {};
module.exports.FAN_SPEED_TO_PARAMETER_VALUE_MAP[module.exports.FAN_SPEED_AUTO] = apiv1.constants.PARAMETER_FAN_SPEED_AUTO;
module.exports.FAN_SPEED_TO_PARAMETER_VALUE_MAP[module.exports.FAN_SPEED_QUIET] = apiv1.constants.PARAMETER_FAN_SPEED_QUIET;
module.exports.FAN_SPEED_TO_PARAMETER_VALUE_MAP[module.exports.FAN_SPEED_LOW] = apiv1.constants.PARAMETER_FAN_SPEED_LOW;
module.exports.FAN_SPEED_TO_PARAMETER_VALUE_MAP[module.exports.FAN_SPEED_MEDIUM] = apiv1.constants.PARAMETER_FAN_SPEED_MEDIUM;
module.exports.FAN_SPEED_TO_PARAMETER_VALUE_MAP[module.exports.FAN_SPEED_HIGH] = apiv1.constants.PARAMETER_FAN_SPEED_HIGH;

module.exports.PARAMETER_VALUE_TO_FAN_SPEED_MAP = {};
module.exports.PARAMETER_VALUE_TO_FAN_SPEED_MAP[apiv1.constants.PARAMETER_FAN_SPEED_AUTO] = module.exports.FAN_SPEED_AUTO;
module.exports.PARAMETER_VALUE_TO_FAN_SPEED_MAP[apiv1.constants.PARAMETER_FAN_SPEED_QUIET] = module.exports.FAN_SPEED_QUIET;
module.exports.PARAMETER_VALUE_TO_FAN_SPEED_MAP[apiv1.constants.PARAMETER_FAN_SPEED_LOW] = module.exports.FAN_SPEED_LOW;
module.exports.PARAMETER_VALUE_TO_FAN_SPEED_MAP[apiv1.constants.PARAMETER_FAN_SPEED_MEDIUM] = module.exports.FAN_SPEED_MEDIUM;
module.exports.PARAMETER_VALUE_TO_FAN_SPEED_MAP[apiv1.constants.PARAMETER_FAN_SPEED_HIGH] = module.exports.FAN_SPEED_HIGH;

// Toggle values
module.exports.TOGGLE_ON = 'ON';
module.exports.TOGGLE_OFF = 'OFF';

module.exports.TOGGLE_VALUES = [
    module.exports.TOGGLE_ON,
    module.exports.TOGGLE_OFF
];

module.exports.TOGGLE_TO_PARAMETER_VALUE_MAP = {};
module.exports.TOGGLE_TO_PARAMETER_VALUE_MAP[module.exports.TOGGLE_ON] = apiv1.constants.PARAMETER_ON;
module.exports.TOGGLE_TO_PARAMETER_VALUE_MAP[module.exports.TOGGLE_OFF] = apiv1.constants.PARAMETER_OFF;

module.exports.PARAMETER_VALUE_TO_TOGGLE_MAP = {};
module.exports.PARAMETER_VALUE_TO_TOGGLE_MAP[apiv1.constants.PARAMETER_ON] = module.exports.TOGGLE_ON;
module.exports.PARAMETER_VALUE_TO_TOGGLE_MAP[apiv1.constants.PARAMETER_OFF] = module.exports.TOGGLE_OFF;

// Airflow vertical directions
module.exports.MIN_AIRFLOW_VERTICAL_DIRECTION = 1;
module.exports.MAX_AIRFLOW_VERTICAL_DIRECTION = 4;

// Temperatures
module.exports.TEMPERATURE_SCALE_FAHRENHEIT = apiv1.constants.TEMPERATURE_SCALE_FAHRENHEIT;
module.exports.TEMPERATURE_SCALE_CELSIUS = apiv1.constants.TEMPERATURE_SCALE_CELSIUS;

module.exports.FAHRENHEIT_TO_CELSIUS_MAP = {
    50: 10.0,
    60: 16.0,
    61: 16.5,
    62: 17.0,
    63: 17.5,
    64: 18.0,
    65: 18.5,
    66: 19.0,
    67: 19.5,
    68: 20.0,
    69: 20.5,
    70: 21.0,
    71: 21.5,
    72: 22.0,
    73: 22.5,
    74: 23.0,
    75: 23.5,
    76: 24.0,
    77: 24.5,
    78: 25.0,
    79: 25.5,
    80: 26.0,
    81: 26.5,
    82: 27.0,
    83: 27.5,
    84: 28.0,
    85: 28.5,
    86: 29.0,
    87: 29.5,
    88: 30.0
};

module.exports.CELSIUS_TO_FAHRENHEIT_MAP = {
    10.0: 50,
    16.0: 60,
    16.5: 61,
    17.0: 62,
    17.5: 63,
    18.0: 64,
    18.5: 65,
    19.0: 66,
    19.5: 67,
    20.0: 68,
    20.5: 69,
    21.0: 70,
    21.5: 71,
    22.0: 72,
    22.5: 73,
    23.0: 74,
    23.5: 75,
    24.0: 76,
    24.5: 77,
    25.0: 78,
    25.5: 79,
    26.0: 80,
    26.5: 81,
    27.0: 82,
    27.5: 83,
    28.0: 84,
    28.5: 85,
    29.0: 86,
    29.5: 87,
    30.0: 88
};

module.exports.VALID_FAHRENHEIT_VALUES = Object.keys(module.exports.FAHRENHEIT_TO_CELSIUS_MAP);
module.exports.VALID_CELSIUS_VALUES = Object.keys(module.exports.CELSIUS_TO_FAHRENHEIT_MAP);
