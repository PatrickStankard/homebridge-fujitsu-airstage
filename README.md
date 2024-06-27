# homebridge-fujitsu-airstage

A Homebridge plugin to control devices that use the Fujitsu Airstage API.

## Example Homebridge config

```json
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
    "enableVerticalSlats": false,
    "enableVerticalAirflowDirection": false,
    "enableDryModeSwitch": false,
    "enableEconomySwitch": false,
    "enableEnergySavingFanSwitch": false,
    "enableFanModeSwitch": false,
    "enableMinimumHeatModeSwitch": false,
    "enablePowerfulSwitch": false
}
```
