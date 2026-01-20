# Fujitsu Airstage Local LAN API Specification

## Overview

This specification defines the local HTTP API protocol for direct communication with Fujitsu Airstage WiFi adapters on the local network.

This spec has been derived from [pyairstage](https://github.com/danielkaldheim/pyairstage) and manual reverse engineering.

### Protocol Summary

- **Transport:** HTTP (unencrypted)
- **Port:** 80
- **Method:** POST
- **Format:** JSON request/response
- **Authentication:** None

## Device Identification

### Device ID Format

**Structure:** 12-character hexadecimal string (MAC address without colons)

**Examples:**

- MAC: `A0:B1:C2:D3:E4:F5` → Device ID: `A0B1C2D3E4F5`
- MAC: `CC:47:40:09:03:2B` → Device ID: `CC474009032B`

**Case:** Uppercase recommended (plugin normalizes to uppercase internally)

### Device ID Discovery

**Method 1: WiFi SSID Extraction**
When device is in AP mode: `AP-WH3X-{device_id}` or `AP-WJ3E-{device_id}`

**Method 2: Network Scan**
Extract from router ARP/DHCP table, remove colons, convert to lowercase

### Device Sub ID

**Type:** Integer
**Default:** `0`
**Range:** `0-15` (for multi-zone systems)

## HTTP API Endpoints

### Base URL Structure

```
http://{device_ip}/GetParam
http://{device_ip}/SetParam
```

### GetParam Endpoint

**Purpose:** Retrieve current device state and parameters

**Method:** `POST`
**Endpoint:** `/GetParam`
**Content-Type:** `application/json`

#### Request Format

```json
{
  "device_id": "A0B1C2D3E4F5",
  "device_sub_id": 0,
  "req_id": "",
  "modified_by": "",
  "set_level": "03",
  "list": ["iu_onoff", "iu_indoor_tmp", "iu_set_tmp", "iu_op_mode"]
}
```

#### Request Fields

| Field           | Type    | Required | Description                          |
| --------------- | ------- | -------- | ------------------------------------ |
| `device_id`     | string  | Yes      | 12-character device identifier       |
| `device_sub_id` | integer | Yes      | Indoor unit number (0-15)            |
| `req_id`        | string  | Yes      | Must be empty string `""`            |
| `modified_by`   | string  | Yes      | Must be empty string `""`            |
| `set_level`     | string  | Yes      | Must be `"03"` for GET operations    |
| `list`          | array   | Yes      | Array of parameter names to retrieve |

**Note:** `req_id` and `modified_by` must be present as empty strings for compatibility.

#### Response Format (Success)

```json
{
  "result": "OK",
  "value": {
    "iu_onoff": "1",
    "iu_indoor_tmp": "7200",
    "iu_set_tmp": "220",
    "iu_op_mode": "1"
  }
}
```

#### Response Format (Error)

```json
{
  "result": "NG",
  "error": "0002"
}
```

### SetParam Endpoint

**Purpose:** Modify device settings and control operation

**Method:** `POST`
**Endpoint:** `/SetParam`
**Content-Type:** `application/json`

#### Request Format

```json
{
  "device_id": "A0B1C2D3E4F5",
  "device_sub_id": 0,
  "req_id": "",
  "modified_by": "",
  "set_level": "02",
  "value": {
    "iu_onoff": "1",
    "iu_set_tmp": "220",
    "iu_op_mode": "1"
  }
}
```

#### Request Fields

| Field           | Type    | Required | Description                          |
| --------------- | ------- | -------- | ------------------------------------ |
| `device_id`     | string  | Yes      | 12-character device identifier       |
| `device_sub_id` | integer | Yes      | Indoor unit number (0-15)            |
| `req_id`        | string  | Yes      | Must be empty string `""`            |
| `modified_by`   | string  | Yes      | Must be empty string `""`            |
| `set_level`     | string  | Yes      | Must be `"02"` for SET operations    |
| `value`         | object  | Yes      | Key-value pairs of parameters to set |

**Note:** `req_id` and `modified_by` must be present as empty strings for compatibility.

#### Response Format (Success)

```json
{
  "result": "OK"
}
```

#### Response Format (Error)

```json
{
  "result": "NG",
  "error": "0002"
}
```

## Parameters

### Power Control

**Parameter:** `iu_onoff`
**Type:** String (numeric)
**Direction:** Read/Write

| Value | Description |
| ----- | ----------- |
| `"0"` | Power OFF   |
| `"1"` | Power ON    |

### Target Temperature

**Parameter:** `iu_set_tmp`
**Type:** String (numeric)
**Direction:** Read/Write
**Encoding:** Celsius × 10

**Conversion:**

```javascript
// Encode: Celsius to API value
apiValue = Math.round(celsius * 10).toString();

// Decode: API value to Celsius
celsius = parseInt(apiValue) / 10;
```

**Examples:**
| Celsius | API Value |
|---------|-----------|
| 18.0°C | `"180"` |
| 22.0°C | `"220"` |
| 24.5°C | `"245"` |
| 30.0°C | `"300"` |

**Range:** Typically 18°C - 30°C (device dependent)

### Indoor Temperature

**Parameter:** `iu_indoor_tmp`
**Type:** String (numeric)
**Direction:** Read-only
**Encoding:** Fahrenheit × 100

**Conversion:**

```javascript
// Decode: API value to Celsius
fahrenheit = parseInt(apiValue) / 100;
celsius = ((fahrenheit - 32) * 5) / 9;
```

**Example:** `"7200"` = 72.00°F = 22.22°C

### Operation Mode

**Parameter:** `iu_op_mode`
**Type:** String (numeric)
**Direction:** Read/Write

| Value | Mode | Description                   |
| ----- | ---- | ----------------------------- |
| `"0"` | Auto | Automatic mode selection      |
| `"1"` | Cool | Cooling mode                  |
| `"2"` | Dry  | Dehumidification              |
| `"3"` | Fan  | Fan only (no heating/cooling) |
| `"4"` | Heat | Heating mode                  |

**Note:** Heat mode may not be available on cooling-only units

### Fan Speed

**Parameter:** `iu_fan_spd`
**Type:** String (numeric)
**Direction:** Read/Write

| Value  | Speed  | Description             |
| ------ | ------ | ----------------------- |
| `"0"`  | Auto   | Automatic fan speed     |
| `"2"`  | Quiet  | Minimum noise operation |
| `"5"`  | Low    | Low speed               |
| `"8"`  | Medium | Medium speed            |
| `"11"` | High   | High speed              |

**Note:** Not all devices support all speeds

### Fan Control Mode

**Parameter:** `iu_fan_ctrl`
**Type:** String (numeric)
**Direction:** Read/Write

| Value | Description          |
| ----- | -------------------- |
| `"0"` | Normal fan control   |
| `"1"` | Advanced fan control |

### Economy Mode

**Parameter:** `iu_economy`
**Type:** String (numeric)
**Direction:** Read/Write

| Value | Description                     |
| ----- | ------------------------------- |
| `"0"` | Economy mode OFF                |
| `"1"` | Economy mode ON (reduced power) |

### Powerful Mode

**Parameter:** `iu_powerful`
**Type:** String (numeric)
**Direction:** Read/Write

| Value | Description                         |
| ----- | ----------------------------------- |
| `"0"` | Powerful mode OFF                   |
| `"1"` | Powerful mode ON (maximum capacity) |

**Constraint:** Requires `iu_onoff = "1"` (unit must be powered on)

### Low Noise (Outdoor Unit)

**Parameter:** `ou_low_noise`
**Type:** String (numeric)
**Direction:** Read/Write

| Value | Description                      |
| ----- | -------------------------------- |
| `"0"` | Normal outdoor unit operation    |
| `"1"` | Low noise outdoor unit operation |

### Additional Parameters

The following parameters may be available on some models:

| Parameter          | Direction | Description                  |
| ------------------ | --------- | ---------------------------- |
| `iu_filter`        | Read      | Filter status/warning        |
| `iu_error_code`    | Read      | Current error code           |
| `iu_swing`         | R/W       | Vertical swing control       |
| `iu_af_vertical`   | R/W       | Airflow vertical direction   |
| `iu_af_horizontal` | R/W       | Airflow horizontal direction |

## Error Handling

### Error Response Format

```json
{
  "result": "NG",
  "error": "XXXX"
}
```

### Error Codes

| Code     | Description             | Resolution                                                           |
| -------- | ----------------------- | -------------------------------------------------------------------- |
| `"0001"` | Invalid request format  | Check JSON syntax                                                    |
| `"0002"` | Malformed JSON          | Validate JSON structure, ensure req_id/modified_by are empty strings |
| `"0003"` | Invalid parameter name  | Check parameter spelling                                             |
| `"0004"` | Invalid parameter value | Verify value range                                                   |
| `"0005"` | Device not responding   | Check device power/network                                           |
| `"0006"` | Invalid device_id       | Verify device ID format (12 hex chars)                               |
| `"0007"` | Invalid set_level       | Use "02" for SET, "03" for GET                                       |

### HTTP Status Codes

| Status                    | Description            | Action               |
| ------------------------- | ---------------------- | -------------------- |
| 200 OK                    | Request successful     | Parse JSON response  |
| 400 Bad Request           | Malformed HTTP request | Check request format |
| 404 Not Found             | Endpoint not found     | Verify URL path      |
| 500 Internal Server Error | Device error           | Retry with backoff   |
| Timeout                   | Network/device issue   | Retry with backoff   |

### Retry Strategy

```javascript
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;
const TIMEOUT_MS = 5000;

async function requestWithRetry(url, payload, attempt = 1) {
  try {
    return await httpPost(url, payload, { timeout: TIMEOUT_MS });
  } catch (error) {
    if (attempt < MAX_RETRIES) {
      await sleep(RETRY_DELAY_MS * attempt);
      return requestWithRetry(url, payload, attempt + 1);
    }
    throw error;
  }
}
```

## Reference Implementation

### Node.js Client Example

```javascript
const http = require("http");

class AirstageLocalClient {
  constructor(ipAddress, deviceId, deviceSubId = 0) {
    this.ipAddress = ipAddress;
    this.deviceId = deviceId;
    this.deviceSubId = deviceSubId;
  }

  async getParam(parameters) {
    const payload = {
      device_id: this.deviceId,
      device_sub_id: this.deviceSubId,
      req_id: "",
      modified_by: "",
      set_level: "03",
      list: parameters,
    };

    return this.request("/GetParam", payload);
  }

  async setParam(values) {
    const payload = {
      device_id: this.deviceId,
      device_sub_id: this.deviceSubId,
      req_id: "",
      modified_by: "",
      set_level: "02",
      value: values,
    };

    return this.request("/SetParam", payload);
  }

  request(endpoint, payload) {
    return new Promise((resolve, reject) => {
      const postData = JSON.stringify(payload);

      const options = {
        hostname: this.ipAddress,
        port: 80,
        path: endpoint,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(postData),
        },
        timeout: 5000,
      };

      const req = http.request(options, (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          try {
            const response = JSON.parse(data);

            if (response.result === "OK") {
              resolve(response.value || response);
            } else {
              reject(new Error(`API Error: ${response.error || "Unknown"}`));
            }
          } catch (e) {
            reject(new Error(`JSON Parse Error: ${e.message}`));
          }
        });
      });

      req.on("error", (e) => {
        reject(new Error(`HTTP Request Error: ${e.message}`));
      });

      req.on("timeout", () => {
        req.destroy();
        reject(new Error("Request timeout"));
      });

      req.write(postData);
      req.end();
    });
  }

  // Temperature conversion helpers
  encodeTemperature(celsius) {
    return Math.round(celsius * 10).toString();
  }

  decodeCelsiusTemperature(apiValue) {
    return parseInt(apiValue) / 10;
  }

  decodeFahrenheitTemperature(apiValue) {
    const fahrenheit = parseInt(apiValue) / 100;
    return ((fahrenheit - 32) * 5) / 9;
  }
}

// Usage example
async function example() {
  const client = new AirstageLocalClient("192.168.1.100", "A0B1C2D3E4F5");

  // Get device status
  const status = await client.getParam([
    "iu_onoff",
    "iu_indoor_tmp",
    "iu_set_tmp",
    "iu_op_mode",
  ]);

  console.log("Device Status:", status);
  console.log(
    "Indoor Temp:",
    client.decodeFahrenheitTemperature(status.iu_indoor_tmp),
    "°C"
  );
  console.log(
    "Target Temp:",
    client.decodeCelsiusTemperature(status.iu_set_tmp),
    "°C"
  );

  // Set temperature to 22°C
  await client.setParam({
    iu_onoff: "1",
    iu_set_tmp: client.encodeTemperature(22),
    iu_op_mode: "1", // Cooling
  });
}
```

## Compatible Hardware

All Fujitsu wireless LAN adapters use the **same local HTTP API protocol** documented in this specification.

### Verified Compatible Models

The following models have been **confirmed** to work with this local API specification:

#### H-Series & F-Series (Wall Mount Units)

| Model      | AP Mode SSID | Region                       | Source            |
| ---------- | ------------ | ---------------------------- | ----------------- |
| UTY-TFSXH3 | AP-WH3E-\*   | Global (ex. USA/Canada)      | [ManualsLib][1]   |
| UTY-TFSXH4 | AP-WH4E-\*   | USA & Canada                 | [ManualsLib][2]   |
| UTY-TFSXF2 | AP-WH2E-\*   | Europe                       | [ManualsLib][3]   |
| UTY-TFSXF3 | AP-WH2E-\*   | Australia, New Zealand, Asia | [Manuals.Plus][4] |

#### J-Series (Ducted/Cassette Units)

| Model      | AP Mode SSID | Region                  | Source               |
| ---------- | ------------ | ----------------------- | -------------------- |
| UTY-TFSXJ3 | AP-WJ3E-\*   | Global (ex. USA/Canada) | [ManualsLib][5]      |
| UTY-TFSXJ4 | AP-WJ4E-\*   | USA & Canada            | [MyFilterCompany][6] |

#### W-Series (General Purpose)

| Model      | AP Mode SSID | Region           | Source          |
| ---------- | ------------ | ---------------- | --------------- |
| UTY-TFSXW1 | -            | Multiple regions | [ManualsLib][7] |

#### Z-Series (VRF/Commercial Systems)

| Model      | AP Mode SSID | Region                            | Source              |
| ---------- | ------------ | --------------------------------- | ------------------- |
| UTY-TFSXZ1 | -            | Europe, North America, ANZ        | [ManualsLib][8]     |
| UTY-TFSXZ2 | -            | Thailand, India, Singapore        | [FujitsuGeneral][9] |
| UTY-TFSXZ4 | -            | China                             | [FujitsuGeneral][9] |
| UTY-TFNXZ1 | -            | Europe                            | [ManualsLib][10]    |
| UTY-TFNXZ2 | -            | North America, Middle East        | [ManualsLib][10]    |
| UTY-TFNXZ3 | -            | Oceania, Thailand, Vietnam, India | [ManualsLib][10]    |
| UTY-TFNXZ4 | -            | China                             | [ManualsLib][10]    |

**Note:** All UTY-TFSX series adapters use identical local API protocol. Regional variants differ only in regulatory compliance.

### AP Mode SSID Patterns

When in Access Point mode, devices broadcast SSIDs using their AP designation followed by the device ID:

```text
AP-WH3E-{device_id}    # UTY-TFSXH3
AP-WH4E-{device_id}    # UTY-TFSXH4
AP-WJ3E-{device_id}    # UTY-TFSXJ3
AP-WJ4E-{device_id}    # UTY-TFSXJ4
```

Where `{device_id}` is the 12-character MAC address (without colons).

### Protocol Validation

This specification has been validated against:

- **[pyairstage][11]** - Python library for Fujitsu Airstage local API
- **[pyfujitsu][12]** - Python library for Fujitsu General AC API
- **homebridge-fujitsu-airstage** - This plugin's implementation
- Manual reverse engineering and packet analysis

### Important Compatibility Notes

- ✅ All UTY-TFSX series use the **identical local HTTP API**
- ✅ Regional variants (J3/J4, H3/H4, Z1-Z4) use the **same protocol**
- ✅ Both **residential** and **commercial** (VRF) adapters supported
- ✅ Compatible with **FGLair** and **AIRSTAGE Mobile** apps
- ⚠️ Adapters must be on the **same local network** as controller

[1]: https://www.manualslib.com/manual/3042184/Fujitsu-Uty-Tfsxh3.html
[2]: https://www.manualslib.com/products/Fujitsu-Uty-Tfsxh4-13254591.html
[3]: https://www.manualslib.com/manual/2941246/Fujitsu-Uty-Tfsxf2.html
[4]: https://manuals.plus/fujitsu/uty-tfsxf2-wireless-lan-adapter-manual
[5]: https://www.manualslib.com/manual/3211354/Fujitsu-Uty-Tfsxj3.html
[6]: https://www.myfiltercompany.com/products/fujitsu-general-uty-tfsxj4-wireless-lan-adapter
[7]: https://www.manualslib.com/manual/3101060/Fujitsu-Uty-Tfsxw1.html
[8]: https://www.manualslib.com/manual/2430832/Fujitsu-Uty-Tfsxz1.html
[9]: https://www.fujitsu-general.com/eu/products/split/optionalparts.html
[10]: https://www.manualslib.com/manual/1631266/Fujitsu-Uty-Tfnxz1.html
[11]: https://pypi.org/project/pyairstage/
[12]: https://github.com/Mmodarre/pyfujitsu

## Quick Reference

### Complete Parameter Table

| Parameter        | R/W | Type   | Values/Encoding                                  |
| ---------------- | --- | ------ | ------------------------------------------------ |
| `iu_onoff`       | R/W | String | "0"=OFF, "1"=ON                                  |
| `iu_set_tmp`     | R/W | String | Celsius × 10                                     |
| `iu_indoor_tmp`  | R   | String | Fahrenheit × 100                                 |
| `iu_op_mode`     | R/W | String | "0"=Auto, "1"=Cool, "2"=Dry, "3"=Fan, "4"=Heat   |
| `iu_fan_spd`     | R/W | String | "0"=Auto, "2"=Quiet, "5"=Low, "8"=Med, "11"=High |
| `iu_fan_ctrl`    | R/W | String | "0"=Normal, "1"=Advanced                         |
| `iu_economy`     | R/W | String | "0"=OFF, "1"=ON                                  |
| `iu_powerful`    | R/W | String | "0"=OFF, "1"=ON                                  |
| `ou_low_noise`   | R/W | String | "0"=OFF, "1"=ON                                  |
| `iu_filter`      | R   | String | Device dependent                                 |
| `iu_error_code`  | R   | String | Device dependent                                 |
