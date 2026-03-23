/**
 * Constants for the Fujitsu Airstage Local LAN API
 */

module.exports = {
  // API Endpoints
  ENDPOINT_GET_PARAM: '/GetParam',
  ENDPOINT_SET_PARAM: '/SetParam',

  // Connection settings
  DEFAULT_PORT: 80,
  DEFAULT_TIMEOUT: 5000,

  // Set level values
  SET_LEVEL_GET: '03',
  SET_LEVEL_SET: '02',

  // Parameter names
  PARAM_POWER: 'iu_onoff',
  PARAM_TARGET_TEMP: 'iu_set_tmp',
  PARAM_INDOOR_TEMP: 'iu_indoor_tmp',
  PARAM_OPERATION_MODE: 'iu_op_mode',
  PARAM_FAN_SPEED: 'iu_fan_spd',
  PARAM_FAN_CTRL: 'iu_fan_ctrl',
  PARAM_ECONOMY: 'iu_economy',
  PARAM_POWERFUL: 'iu_powerful',
  PARAM_MIN_HEAT: 'iu_min_heat',
  PARAM_AIRFLOW_VERTICAL_DIRECTION: 'iu_af_dir_vrt',
  PARAM_AIRFLOW_VERTICAL_SWING: 'iu_af_swg_vrt',
  PARAM_MODEL: 'iu_model',
  PARAM_LOW_NOISE: 'ou_low_noise',

  // Power values
  POWER_OFF: '0',
  POWER_ON: '1',

  // Operation mode values
  MODE_AUTO: '0',
  MODE_COOL: '1',
  MODE_DRY: '2',
  MODE_FAN: '3',
  MODE_HEAT: '4',

  // Fan speed values
  FAN_SPEED_AUTO: '0',
  FAN_SPEED_QUIET: '2',
  FAN_SPEED_LOW: '5',
  FAN_SPEED_MEDIUM: '8',
  FAN_SPEED_HIGH: '11',

  // Toggle values
  TOGGLE_OFF: '0',
  TOGGLE_ON: '1',
};
