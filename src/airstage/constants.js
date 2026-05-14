'use strict';

// Manufacturer
module.exports.MANUFACTURER_FUJITSU = 'Fujitsu';

// Parameter names
module.exports.PARAMETER_MODEL = 'iu_model';
module.exports.PARAMETER_FAN_SPEED = 'iu_fan_spd';
module.exports.PARAMETER_ON_OFF = 'iu_onoff'
module.exports.PARAMETER_SET_TEMPERATURE = 'iu_set_tmp';
module.exports.PARAMETER_INDOOR_TEMPERATURE = 'iu_indoor_tmp';
module.exports.PARAMETER_OPERATION_MODE = 'iu_op_mode';
module.exports.PARAMETER_FAN_SPEED = 'iu_fan_spd';
module.exports.PARAMETER_AIRFLOW_VERTICAL_DIRECTION = 'iu_af_dir_vrt';
module.exports.PARAMETER_AIRFLOW_VERTICAL_SWING = 'iu_af_swg_vrt';
module.exports.PARAMETER_POWERFUL = 'iu_powerful';
module.exports.PARAMETER_ECONOMY = 'iu_economy';
module.exports.PARAMETER_ENERGY_SAVING_FAN = 'iu_fan_ctrl';
module.exports.PARAMETER_MINIMUM_HEAT = 'iu_min_heat';

module.exports.ALL_PARAMETERS = [
    module.exports.PARAMETER_MODEL,
    module.exports.PARAMETER_FAN_SPEED,
    module.exports.PARAMETER_ON_OFF,
    module.exports.PARAMETER_SET_TEMPERATURE,
    module.exports.PARAMETER_INDOOR_TEMPERATURE,
    module.exports.PARAMETER_OPERATION_MODE,
    module.exports.PARAMETER_FAN_SPEED,
    module.exports.PARAMETER_AIRFLOW_VERTICAL_DIRECTION,
    module.exports.PARAMETER_AIRFLOW_VERTICAL_SWING,
    module.exports.PARAMETER_POWERFUL,
    module.exports.PARAMETER_ECONOMY,
    module.exports.PARAMETER_ENERGY_SAVING_FAN,
    module.exports.PARAMETER_MINIMUM_HEAT
];

// Parameter values
module.exports.PARAMETER_ON = '1';
module.exports.PARAMETER_OFF = '0';
module.exports.PARAMETER_NOT_AVAILABLE = '65535';
module.exports.PARAMETER_OPERATION_MODE_AUTO = '0';
module.exports.PARAMETER_OPERATION_MODE_COOL = '1';
module.exports.PARAMETER_OPERATION_MODE_DRY = '2';
module.exports.PARAMETER_OPERATION_MODE_FAN = '3';
module.exports.PARAMETER_OPERATION_MODE_HEAT = '4';
module.exports.PARAMETER_FAN_SPEED_AUTO = '0';
module.exports.PARAMETER_FAN_SPEED_QUIET = '2';
module.exports.PARAMETER_FAN_SPEED_LOW = '5';
module.exports.PARAMETER_FAN_SPEED_MEDIUM = '8';
module.exports.PARAMETER_FAN_SPEED_HIGH = '11';

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
module.exports.OPERATION_MODE_TO_PARAMETER_VALUE_MAP[module.exports.OPERATION_MODE_AUTO] = module.exports.PARAMETER_OPERATION_MODE_AUTO;
module.exports.OPERATION_MODE_TO_PARAMETER_VALUE_MAP[module.exports.OPERATION_MODE_COOL] = module.exports.PARAMETER_OPERATION_MODE_COOL;
module.exports.OPERATION_MODE_TO_PARAMETER_VALUE_MAP[module.exports.OPERATION_MODE_DRY] = module.exports.PARAMETER_OPERATION_MODE_DRY;
module.exports.OPERATION_MODE_TO_PARAMETER_VALUE_MAP[module.exports.OPERATION_MODE_FAN] = module.exports.PARAMETER_OPERATION_MODE_FAN;
module.exports.OPERATION_MODE_TO_PARAMETER_VALUE_MAP[module.exports.OPERATION_MODE_HEAT] = module.exports.PARAMETER_OPERATION_MODE_HEAT;

module.exports.PARAMETER_VALUE_TO_OPERATION_MODE_MAP = {};
module.exports.PARAMETER_VALUE_TO_OPERATION_MODE_MAP[module.exports.PARAMETER_OPERATION_MODE_AUTO] = module.exports.OPERATION_MODE_AUTO;
module.exports.PARAMETER_VALUE_TO_OPERATION_MODE_MAP[module.exports.PARAMETER_OPERATION_MODE_COOL] = module.exports.OPERATION_MODE_COOL;
module.exports.PARAMETER_VALUE_TO_OPERATION_MODE_MAP[module.exports.PARAMETER_OPERATION_MODE_DRY] = module.exports.OPERATION_MODE_DRY;
module.exports.PARAMETER_VALUE_TO_OPERATION_MODE_MAP[module.exports.PARAMETER_OPERATION_MODE_FAN] = module.exports.OPERATION_MODE_FAN;
module.exports.PARAMETER_VALUE_TO_OPERATION_MODE_MAP[module.exports.PARAMETER_OPERATION_MODE_HEAT] = module.exports.OPERATION_MODE_HEAT;

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
module.exports.FAN_SPEED_TO_PARAMETER_VALUE_MAP[module.exports.FAN_SPEED_AUTO] = module.exports.PARAMETER_FAN_SPEED_AUTO;
module.exports.FAN_SPEED_TO_PARAMETER_VALUE_MAP[module.exports.FAN_SPEED_QUIET] = module.exports.PARAMETER_FAN_SPEED_QUIET;
module.exports.FAN_SPEED_TO_PARAMETER_VALUE_MAP[module.exports.FAN_SPEED_LOW] = module.exports.PARAMETER_FAN_SPEED_LOW;
module.exports.FAN_SPEED_TO_PARAMETER_VALUE_MAP[module.exports.FAN_SPEED_MEDIUM] = module.exports.PARAMETER_FAN_SPEED_MEDIUM;
module.exports.FAN_SPEED_TO_PARAMETER_VALUE_MAP[module.exports.FAN_SPEED_HIGH] = module.exports.PARAMETER_FAN_SPEED_HIGH;

module.exports.PARAMETER_VALUE_TO_FAN_SPEED_MAP = {};
module.exports.PARAMETER_VALUE_TO_FAN_SPEED_MAP[module.exports.PARAMETER_FAN_SPEED_AUTO] = module.exports.FAN_SPEED_AUTO;
module.exports.PARAMETER_VALUE_TO_FAN_SPEED_MAP[module.exports.PARAMETER_FAN_SPEED_QUIET] = module.exports.FAN_SPEED_QUIET;
module.exports.PARAMETER_VALUE_TO_FAN_SPEED_MAP[module.exports.PARAMETER_FAN_SPEED_LOW] = module.exports.FAN_SPEED_LOW;
module.exports.PARAMETER_VALUE_TO_FAN_SPEED_MAP[module.exports.PARAMETER_FAN_SPEED_MEDIUM] = module.exports.FAN_SPEED_MEDIUM;
module.exports.PARAMETER_VALUE_TO_FAN_SPEED_MAP[module.exports.PARAMETER_FAN_SPEED_HIGH] = module.exports.FAN_SPEED_HIGH;

// Toggle values
module.exports.TOGGLE_ON = 'ON';
module.exports.TOGGLE_OFF = 'OFF';

module.exports.TOGGLE_VALUES = [
    module.exports.TOGGLE_ON,
    module.exports.TOGGLE_OFF
];

module.exports.TOGGLE_TO_PARAMETER_VALUE_MAP = {};
module.exports.TOGGLE_TO_PARAMETER_VALUE_MAP[module.exports.TOGGLE_ON] = module.exports.PARAMETER_ON;
module.exports.TOGGLE_TO_PARAMETER_VALUE_MAP[module.exports.TOGGLE_OFF] = module.exports.PARAMETER_OFF;

module.exports.PARAMETER_VALUE_TO_TOGGLE_MAP = {};
module.exports.PARAMETER_VALUE_TO_TOGGLE_MAP[module.exports.PARAMETER_ON] = module.exports.TOGGLE_ON;
module.exports.PARAMETER_VALUE_TO_TOGGLE_MAP[module.exports.PARAMETER_OFF] = module.exports.TOGGLE_OFF;

// Airflow vertical directions
module.exports.MIN_AIRFLOW_VERTICAL_DIRECTION = 1;
module.exports.MAX_AIRFLOW_VERTICAL_DIRECTION = 4;

// Temperatures
module.exports.TEMPERATURE_SCALE_CELSIUS = 'C';
module.exports.TEMPERATURE_SCALE_FAHRENHEIT = 'F';

module.exports.TEMPERATURE_SCALES = [
    module.exports.TEMPERATURE_SCALE_CELSIUS,
    module.exports.TEMPERATURE_SCALE_FAHRENHEIT
];

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
