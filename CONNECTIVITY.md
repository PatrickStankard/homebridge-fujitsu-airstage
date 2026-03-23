# Connectivity Guide

This plugin supports two different methods for connecting to your Fujitsu AirStage devices. This guide will help you understand the differences and choose the best option for your setup.

## Overview

| Feature               | Cloud API                   | Local LAN                      |
| --------------------- | --------------------------- | ------------------------------ |
| **Internet Required** | Yes                         | No                             |
| **Account Required**  | Yes (Airstage)              | No                             |
| **Multiple Devices**  | All devices in account      | One device per plugin instance |
| **Remote Access**     | Yes (via HomeKit)           | Yes (via HomeKit)              |
| **Response Speed**    | Slower (internet latency)   | Faster (local network)         |
| **Reliability**       | Depends on internet & cloud | Depends on local network       |
| **Setup Complexity**  | Easier                      | Moderate                       |

## Cloud API (Internet)

### What is it?

The Cloud API connection mode uses Fujitsu's official cloud service to communicate with your AirStage devices. This is the same backend that the official AirStage mobile app uses.

### How it works

1. You authenticate with your AirStage account credentials
2. The plugin connects to Fujitsu's cloud servers
3. Commands are routed through the internet to your devices
4. All devices registered to your account are automatically discovered

### When to use Cloud API

- You want the easiest setup experience
- You have multiple AirStage devices to control
- You don't mind internet dependency
- You already use the AirStage mobile app

### Configuration

In the Homebridge UI, select **"Cloud API (Internet)"** as the connection mode and provide:

- **Region**: Your Airstage account region (US or Europe)
- **Country**: Country associated with your account
- **Language**: Language code (e.g., "en")
- **Email**: Your Airstage account email
- **Password**: Your Airstage account password

### Important Limitations

#### ⚠️ API Rate Limiting Warning

**Fujitsu's cloud API has been known to temporarily ban IP addresses that make too many requests.** This can happen if:

- You have HomeKit automations that frequently poll device status
- Multiple plugins or apps are accessing the API simultaneously
- You have many devices configured
- You're testing or debugging frequently

**If you get banned:**

- Your IP address may be blocked for an indeterminate amount of time
- You'll see authentication or connection errors
- You won't be able to control your devices via the plugin or mobile app from the same ISP
- There is no known way to request an unban

**To avoid getting banned:**

- Consider using Local LAN mode if possible
- Minimize the number of status checks in HomeKit automations
- Avoid running multiple instances of the plugin
- Don't refresh the plugin or restart Homebridge too frequently

### Advantages

✅ Easy setup - just enter your credentials

✅ All devices automatically discovered

✅ No network configuration needed

✅ Works from anywhere (via HomeKit)

### Disadvantages

❌ Requires stable internet connection

❌ Risk of IP bans from excessive API usage

❌ Slower response times (internet latency)

❌ Depends on Fujitsu's cloud service availability

❌ Credentials stored in Homebridge config (can be removed after authentication)

## Local LAN (Direct)

### What is it?

The Local LAN connection mode connects directly to your AirStage device over your local network, completely bypassing Fujitsu's cloud servers. This provides faster response times and independence from internet connectivity.

### Prerequisites

Before using Local LAN mode, ensure:
- Your AirStage WiFi adapter is already installed and configured
- The WiFi adapter is connected to the **same local network** as your Homebridge host
- You can access your router's admin interface to find device IP addresses

**Note:** The initial WiFi adapter setup must be completed using the AirStage mobile app. Once connected to your WiFi network, you can then use Local LAN mode to control it directly without the cloud service.

### How it works

1. The plugin communicates directly with your device's IP address on your local network
2. Commands are sent via HTTP (port 80) to the WiFi adapter
3. No internet or cloud authentication required
4. Device ID is auto-detected via ARP or manually configured
5. Both Homebridge and the AirStage device must be on the same network/VLAN
6. **Hybrid Pull/Push Model**:
   - **Pull (On-Demand)**: HomeKit can query device status at any time via GET handlers
   - **Push (Polling)**: Plugin periodically polls the device and pushes updates to HomeKit only when values change
   - **Push (Optimistic)**: Instant feedback after SET operations without waiting for device confirmation
   - This hybrid approach provides responsive updates while minimizing unnecessary network traffic

### When to use Local LAN

- You want the fastest response times
- You want to avoid potential cloud API bans
- You prefer local control without internet dependency
- You're comfortable with basic network configuration
- Your AirStage device and Homebridge are on the same local network
- You only need to control a single device (or are willing to create multiple plugin instances)

### Configuration

In the Homebridge UI, select **"Local LAN (Direct)"** as the connection mode and provide:

#### Required Settings

- **Device Name**: A friendly name for your device (e.g., "Living Room AC")
- **IP Address**: The local IP address of your device (e.g., "192.168.1.100")

#### Optional Settings

- **Device ID**: 12-character device ID (MAC address without colons)
  - If left empty, the plugin will attempt to auto-detect via ARP
  - Example: `A0B1C2D3E4F5`
- **Device Sub ID**: For multi-zone systems, specify the indoor unit number (0-15)
  - Use `0` for single-zone systems (default)
  - Use `1-15` for specific zones in multi-zone systems
- **Local Polling Interval**: How often to poll the device for status updates (in seconds)
  - Default: `120` seconds (2 minutes)
  - Range: `0` to `600` seconds
  - Set to `0` to disable automatic polling (HomeKit will only update when you open the app)
  - Lower values provide more responsive updates but increase network traffic
  - Higher values reduce network traffic but may delay status updates

### Setup Instructions

#### 0. Initial WiFi Setup (Required First)

Before configuring Local LAN mode in Homebridge:

1. Install and configure your AirStage WiFi adapter using the official AirStage mobile app
2. Connect the adapter to your WiFi network during the initial setup process
3. Verify the device appears online in the AirStage app
4. **Ensure the device is connected to the same WiFi network as your Homebridge host**

Once this initial setup is complete, you can proceed with Local LAN configuration.

#### 1. Find your device's IP address

**Option A: Check your router (Recommended)**

- Log into your router's admin interface
- Look for connected devices or DHCP clients
- Find your AirStage device (may appear as "Fujitsu" or by MAC address)
- Note the IP address assigned to the device

**Option B: Use the AirStage app**

- Some device information may be visible in the app settings
- Note: This varies by device model and app version

**Option C: Network scanning tool**

- Use a network scanner app like Fing (iOS/Android) or Angry IP Scanner (desktop)
- Scan your network for devices on port 80
- Look for devices with MAC addresses matching Fujitsu/AirStage

#### 2. Set a static IP (STRONGLY RECOMMENDED)

To prevent the IP address from changing:

- Log into your router's admin interface
- Find the DHCP reservation or static IP assignment section
- Assign a static/fixed IP to your AirStage device

#### 3. Configure the plugin

1. Open Homebridge UI
2. Go to plugin settings for "Airstage Platform"
3. Select **"Local LAN (Direct)"** as connection mode
4. Enter the device name and IP address
5. Leave Device ID blank for auto-detection (recommended)
6. Set Device Sub ID to `0` unless you have a multi-zone system
7. Save and restart Homebridge

#### 4. Verify connection

Check the Homebridge logs for:

- `[Local] GET [Device Name] (XXXXXXXXXXXX @ 192.168.1.100)` - successful communication
- `[Local] Device XXXXXXXXXXXX detected` - successful auto-detection of Device ID

### Multi-Zone Systems

If you have a multi-zone AirStage system (one outdoor unit with multiple indoor units):

1. Configure the same IP address for each zone
2. Set a different **Device Sub ID** for each zone:
   - Zone 1: Device Sub ID = `1`
   - Zone 2: Device Sub ID = `2`
   - Zone 3: Device Sub ID = `3`
   - etc.

You'll need to create separate Homebridge platform instances for each zone.

### Troubleshooting Local LAN

#### "Device not found" or "Request timeout" errors

- **Verify the AirStage WiFi adapter is set up**: Ensure you've completed the initial setup using the AirStage mobile app
- **Check network connectivity**: Confirm the device is connected to the same WiFi network as Homebridge
- Verify the IP address is correct (check your router's DHCP client list)
- Check that the device is powered on and shows as online in your router
- Ensure your Homebridge server can reach the device (try pinging the IP: `ping 192.168.1.100`)
- Check for firewall rules blocking HTTP traffic on port 80
- **Verify same network/VLAN**: Both devices must be on the same local network segment
- Try accessing the device directly in a web browser: `http://192.168.1.100` (should show some response)

#### "Device marked as UNREACHABLE" messages

- The plugin has detected 3 consecutive failed requests
- It will automatically retry after 60 seconds
- Check network connectivity and device availability
- Verify the IP address hasn't changed (use static IP)

#### Device ID auto-detection fails

- Manually specify the Device ID (12-character MAC address without colons)
- Check your router for the device's MAC address
- Use a network scanner to find the device's MAC address
- Format: All uppercase, no colons or dashes (e.g., `A0B1C2D3E4F5`)

### Advantages

✅ Fastest response times (local network)

✅ No internet dependency

✅ No risk of cloud API bans

✅ No credentials or authentication required

✅ More reliable (no cloud service dependency)

✅ Better privacy (no data sent to cloud)

### Disadvantages

❌ Requires network configuration for stability (static IP)

❌ One device per plugin instance

❌ Device ID may need manual configuration

❌ Multi-zone systems require multiple plugin instances

❌ Requires devices to be on the same local network as Homebridge

## Switching Between Modes

You can switch between Cloud API and Local LAN modes at any time:

1. Open Homebridge UI
2. Go to plugin settings
3. Change the **Connection Mode** dropdown
4. Configure the appropriate settings for the new mode
5. Save and restart Homebridge

**Note:** Your HomeKit accessories will be removed and recreated when switching modes, requiring you to set up rooms and automations again.

## Which Should I Choose?

### Choose Cloud API if:

- You have multiple devices
- You want the easiest setup
- You're not concerned about potential rate limiting
- You don't mind internet dependency

### Choose Local LAN if:

- You want maximum speed and reliability
- You only have one device (or don't mind multiple plugin instances)
- You want to avoid potential cloud API bans
- You prefer local control without cloud dependency
- You're comfortable with basic network configuration

## Need Help?

If you encounter issues with either connectivity mode:

1. Check the Homebridge logs for error messages
2. Verify your network configuration
3. Review the troubleshooting sections above
4. Report issues at: https://github.com/homebridge-plugins/homebridge-fujitsu-airstage/issues
