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

## Homebridge Compatibility

- Supports Homebridge v1 and v2 (including child bridge mode)
- Tokens and authentication data are managed automatically using the Homebridge v2 storage API when available
- No manual editing of tokens is required or supported
- Homebridge UI configuration is improved and user-friendly

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
            "rememberEmailAndPassword": false,
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

If the `rememberEmailAndPassword` option is disabled, the `email` and `password`
values will only be set until authentication with the Airstage API has been
completed successfully. At that point, they will be set to `null`. This is the
default behavior, in order to prevent your Airstage credentials from being
stored in plaintext in the Homebridge config.

If the `rememberEmailAndPassword` option is enabled, the `email` and `password`
values will continue to be set after authentication with the Airstage API has
been completed successfully. This is useful for when the access token can't be
refreshed for whatever reason, and you need to re-authenticate with the
Airstage API.

**Note:**
- You do **not** need to set or manage `accessToken`, `accessTokenExpiry`, or `refreshToken` in your config. These are handled automatically by the plugin and are no longer shown in the Homebridge UI.

## Secure Secret Storage

This plugin securely stores all tokens and sensitive credentials using strong encryption. Secrets are never stored in plaintext.

Encryption uses AES-256-GCM with a key derived via PBKDF2 (100,000 iterations, SHA-512) and a salt based on a SHA-256 hash of unique values. The encrypted file is stored with strict permissions (0600) and is not exposed in the Homebridge UI or config.

**You do not need to manage or back up tokens or passwords manually.**

If you move your Homebridge instance to a new machine or change the setup ID, you will need to re-authenticate, as the encrypted secrets are only accessible on the original installation.

---

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
