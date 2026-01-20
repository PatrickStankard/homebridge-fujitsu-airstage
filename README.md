# homebridge-fujitsu-airstage

[![verified-by-homebridge](https://badgen.net/badge/homebridge/verified/purple)](https://github.com/homebridge/homebridge/wiki/Verified-Plugins)
[![npm version](https://img.shields.io/npm/v/homebridge-fujitsu-airstage?style=flat-square)](https://www.npmjs.com/package/homebridge-fujitsu-airstage)

A [Homebridge](https://github.com/homebridge/homebridge) plugin to control
Fujitsu Airstage air conditioning and heat pump devices.

This plugin supports two connection modes:

- **Cloud API** - Connect via Fujitsu's cloud service (requires Airstage account)
- **Local LAN** - Connect directly to devices on your local network (no account required)

📖 **[Read the Connectivity Guide](CONNECTIVITY.md)** for detailed information on choosing the right mode for your setup.

## Prerequisites

### For Cloud API Mode (Internet)

Before using Cloud API mode, you should have already installed the
[Airstage app](https://www.fujitsugeneral.com/us/airstage-mobile/setup.html) on
your iOS or Android device, signed up for an account, and configured your devices.

### For Local LAN Mode (Direct)

For Local LAN mode, you need:

- Your AirStage WiFi adapter already set up using the AirStage mobile app
- The adapter connected to the **same WiFi network** as your Homebridge host
- Your device's local IP address (found in your router or via network scanner)
- A static IP or DHCP reservation for your device (recommended)

**Note:** You must complete the initial WiFi adapter setup using the AirStage mobile app first. Once connected to your network, you can then control it via Local LAN mode without needing cloud access.

## Configuration

The easiest way to configure this plugin is to use
[Homebridge UI](https://github.com/homebridge/homebridge-config-ui-x).

### Connection Mode Selection

When configuring the plugin, you'll first choose a **Connection Mode**:

- **Cloud API (Internet)** - Uses Fujitsu's cloud service (⚠️ Warning: Fujitsu's API may ban your IP for excessive requests)
- **Local LAN (Direct)** - Connects directly to devices on your local network (faster, more reliable)

📖 **[See the Connectivity Guide](CONNECTIVITY.md)** for detailed setup instructions, troubleshooting, and help choosing the right mode.

### Cloud API Configuration Example

```json
{
  "platforms": [
    {
      "name": "Airstage Platform",
      "platform": "fujitsu-airstage",
      "connectionMode": "cloud",
      "region": "us",
      "country": "United States",
      "language": "en",
      "email": "test@example.com",
      "password": "test1234",
      "rememberEmailAndPassword": false,
      "enableThermostat": true,
      "enableFan": true,
      "enableVerticalAirflowDirection": false,
      "enableAutoFanSpeedSwitch": false,
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

### Local LAN Configuration Example

```json
{
  "platforms": [
    {
      "name": "Airstage Platform",
      "platform": "fujitsu-airstage",
      "connectionMode": "local",
      "localDevice": {
        "name": "Living Room AC",
        "ipAddress": "192.168.1.100",
        "deviceId": "",
        "deviceSubId": 0
      },
      "enableThermostat": true,
      "enableFan": true,
      "enableVerticalAirflowDirection": false,
      "enableAutoFanSpeedSwitch": false,
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

**Notes for Local LAN mode:**

- The AirStage WiFi adapter must be set up and connected to your network first (use the AirStage mobile app)
- The device must be on the **same local network** as your Homebridge host
- `deviceId` can be left empty for automatic detection via ARP
- `deviceSubId` should be `0` for single-zone systems, or `1-15` for multi-zone systems
- You should configure a static IP or DHCP reservation for your device
- See the [Connectivity Guide](CONNECTIVITY.md) for detailed setup instructions

## Accessories

For each device, this plugin offers several accessories that you can use to
control them. You can enable these accessories in the plugin configuration.

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

### "Auto Fan Speed" Switch

This accessory allows you to control the "Auto Fan Speed" setting (on/off) of
your device.

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
