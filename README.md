# homebridge-fujitsu-airstage

[![verified-by-homebridge](https://badgen.net/badge/homebridge/verified/purple)](https://github.com/homebridge/homebridge/wiki/Verified-Plugins)
[![npm version](https://img.shields.io/npm/v/homebridge-fujitsu-airstage?style=flat-square)](https://www.npmjs.com/package/homebridge-fujitsu-airstage)

A [Homebridge](https://github.com/homebridge/homebridge) plugin to control
devices that use the
[Fujitsu Airstage API](https://www.fujitsugeneral.com/us/airstage-mobile/index.html).

## Prerequisites

Before using this, you should have already installed the
[Airstage app](https://www.fujitsugeneral.com/us/airstage-mobile/setup.html) on
your iOS or Android device, signed up for an account, and configured your devices.

## Configuration

The easiest way to configure this plugin is to use
[Homebridge UI](https://github.com/homebridge/homebridge-config-ui-x).

Here is an example of what you'll see in your Homebridge config once you've
installed and configured this plugin:

```json
{
    "platforms": [
        {
            "name": "Airstage Platform",
            "platform": "fujitsu-airstage",
            "region": "us",
            "country": "United States",
            "language": "en",
            "email": "test@example.com",
            "password": "test1234",
            "accessToken": null,
            "accessTokenExpiry": null,
            "refreshToken": null,
            "enableThermostat": true,
            "enableFan": true,
            "enableVerticalAirflowDirection": false,
            "enableDryModeSwitch": false,
            "enableEconomySwitch": false,
            "enableEnergySavingFanSwitch": false,
            "enableFanModeSwitch": false,
            "enableMinimumHeatModeSwitch": false,
            "enablePowerfulSwitch": false
        }
    ]
}
```

The `email` and `password` values should only be set until the initial
authentication with the Airstage API has been completed successfully. At that
point, they will be set to `null`, and the `accessToken`, `accessTokenExpiry`,
and `refreshToken` values will be set. These values will be used to authenticate
with the Airstage API going forward.

If the access token can't be refreshed for whatever reason, you will have to
re-authenticate with the Airstage API by setting `email` and `password` in the
config, and restarting Homebridge.

## Accessories

For each device in your Airstage account, this plugin offers several
accessories that you can use in order to control them. You can enable these
accessories for your devices in the plugin config.

### Thermostat

This accessory allows you to control the temperature, operating
mode (cool/heat/auto), and power state (on/off) of your device.
This is enabled by default.

### Fan

This accessory allows you to control the fan speed, fan mode (auto/manual),
oscillation state (on/off), and power state (on/off) of your device.
This is enabled by default.

### Vertical Airflow Direction

This accessory allows you to control the position of the vertical slats of
your device. Unfortunately, Apple Home does currently support the
["Slats" service](https://developers.homebridge.io/#/service/Slats), so this is
represented in the plugin using the
["Fanv2" service](https://developers.homebridge.io/#/service/Fanv2) instead.

The fan speed of this accessory represents the position of the vertical slats.
If the accessory is off, the vertical slats will oscillate.

### "Dry Mode" Switch

This accessory allows you to control the operating mode (dry) of your device.

### "Economy" Switch

This accessory allows you to control the "Economy" setting (on/off) of your device.

### "Energy Saving Fan" Switch

This accessory allows you to control the "Energy Saving Fan" setting (on/off)
of your device.

### "Fan Mode" Switch

This accessory allows you to control the operating mode (fan) of your device.

### "Minimum Heat Mode" Switch

This accessory allows you to control the operating mode (minimum heat) of your
device.

### "Powerful" Switch

This accessory allows you to control the "Powerful" setting (on/off) of your
device.
