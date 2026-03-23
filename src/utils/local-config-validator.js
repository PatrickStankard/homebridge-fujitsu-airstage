'use strict';

const arp = require('node-arp');
const http = require('http');

/**
 * Local Configuration Validator
 * Provides device ID auto-detection and connectivity validation
 */
class LocalConfigValidator {

    /**
     * Validate IPv4 address format
     * Prevents command injection and provides early error detection
     *
     * @param {string} ipAddress - IP address to validate
     * @returns {boolean} - True if valid IPv4 format
     */
    static isValidIpv4Format(ipAddress) {
        if (!ipAddress || typeof ipAddress !== 'string') {
            return false;
        }

        // Strict IPv4 validation: xxx.xxx.xxx.xxx where each octet is 0-255
        const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        return ipv4Regex.test(ipAddress);
    }

    /**
     * Check HTTP connectivity to device
     * Makes simple GET request to http://ipAddress/ to verify reachability
     * Side effect: Populates ARP table with device MAC address
     *
     * @param {string} ipAddress - IP address to check
     * @param {number} timeout - Timeout in milliseconds (default: 5000)
     * @returns {Promise<Object>} - { success: boolean, statusCode?: number, error?: string }
     */
    static async checkHttpConnectivity(ipAddress, timeout = 5000) {
        return new Promise((resolve) => {
            const options = {
                hostname: ipAddress,
                port: 80,
                path: '/',
                method: 'GET',
                timeout: timeout
            };

            const req = http.request(options, (res) => {
                // Any response (even 404) means device is reachable
                // We just want to confirm HTTP connectivity
                resolve({
                    success: true,
                    statusCode: res.statusCode
                });

                // Consume response data to free memory
                res.on('data', () => {});
            });

            req.on('error', (error) => {
                resolve({
                    success: false,
                    error: error.message || 'Connection failed'
                });
            });

            req.on('timeout', () => {
                req.destroy();
                resolve({
                    success: false,
                    error: 'Connection timeout - device may be offline or unreachable'
                });
            });

            req.end();
        });
    }

    /**
     * Detect device ID from IP address using ARP
     * Returns device ID in UPPERCASE format (12-character hex string without colons)
     *
     * @param {string} ipAddress - Device IP address
     * @returns {Promise<Object>} - { success: boolean, deviceId?: string, error?: string }
     */
    static async detectDeviceId(ipAddress) {
        return new Promise((resolve) => {
            arp.getMAC(ipAddress, (error, mac) => {
                if (error) {
                    return resolve({
                        success: false,
                        error: `ARP lookup failed: ${error.message || error}`,
                        details: 'The ARP table may not contain this IP address. This is unexpected as HTTP connectivity was confirmed. Try manually adding the device ID (MAC address) to your config.'
                    });
                }

                if (!mac) {
                    return resolve({
                        success: false,
                        error: 'No MAC address found in ARP table',
                        details: `The IP address ${ipAddress} is not in the ARP cache. This is unexpected as HTTP connectivity was confirmed. Try manually adding the device ID (MAC address) to your config.`
                    });
                }

                // Normalize MAC address: split by colons, pad each octet to 2 chars, join, and uppercase
                // node-arp may return MAC addresses without zero-padding (e.g., "cc:47:40:09:3:2b" instead of "cc:47:40:09:03:2b")
                const octets = mac.split(':');
                if (octets.length !== 6) {
                    return resolve({
                        success: false,
                        error: `Invalid MAC address format: ${mac}`,
                        details: `Expected 6 octets separated by colons, got ${octets.length} octets`
                    });
                }

                // Pad each octet with leading zero if needed
                const deviceId = octets.map(octet => octet.padStart(2, '0')).join('').toUpperCase();

                // Validate format (12 hexadecimal characters)
                if (/^[A-F0-9]{12}$/.test(deviceId)) {
                    resolve({
                        success: true,
                        deviceId: deviceId
                    });
                } else {
                    resolve({
                        success: false,
                        error: `Invalid MAC address format: ${mac}`,
                        details: `Expected 12 hexadecimal characters, got: ${deviceId} (${deviceId.length} characters)`
                    });
                }
            });
        });
    }

    /**
     * Validate device configuration by testing connectivity
     * Makes a test GetParam request to verify device responds correctly
     *
     * @param {string} ipAddress - Device IP address
     * @param {string} deviceId - Device ID (UPPERCASE)
     * @param {number} deviceSubId - Device sub ID (default: 0)
     * @returns {Promise<Object>} - { success: boolean, error?: string }
     */
    static async validateDeviceConfig(ipAddress, deviceId, deviceSubId = 0) {
        return new Promise((resolve) => {
            // Test connectivity with a simple GetParam request
            const payload = {
                device_id: deviceId.toUpperCase(),
                device_sub_id: deviceSubId,
                req_id: '',
                modified_by: '',
                set_level: '03',
                list: ['iu_onoff']
            };

            const postData = JSON.stringify(payload);
            const options = {
                hostname: ipAddress,
                port: 80,
                path: '/GetParam',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(postData)
                },
                timeout: 5000
            };

            const req = http.request(options, (res) => {
                let data = '';

                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    try {
                        const response = JSON.parse(data);

                        if (response.result === 'OK') {
                            resolve({ success: true });
                        } else {
                            resolve({
                                success: false,
                                error: `Device error: ${response.error || 'Unknown error'}`
                            });
                        }
                    } catch (e) {
                        resolve({
                            success: false,
                            error: `Invalid response: ${e.message}`
                        });
                    }
                });
            });

            req.on('error', (e) => {
                resolve({
                    success: false,
                    error: `Connection failed: ${e.message}`
                });
            });

            req.on('timeout', () => {
                req.destroy();
                resolve({
                    success: false,
                    error: 'Connection timeout (device may be offline or unreachable)'
                });
            });

            req.write(postData);
            req.end();
        });
    }

    /**
     * Normalize device ID to UPPERCASE format
     *
     * @param {string} deviceId - Device ID in any case
     * @returns {string} - UPPERCASE device ID
     */
    static normalizeDeviceId(deviceId) {
        return deviceId.toUpperCase().replace(/:/g, '');
    }

    /**
     * Validate device ID format
     *
     * @param {string} deviceId - Device ID to validate
     * @returns {boolean} - True if valid format
     */
    static isValidDeviceIdFormat(deviceId) {
        const normalized = this.normalizeDeviceId(deviceId);
        return /^[A-F0-9]{12}$/.test(normalized);
    }
}

module.exports = LocalConfigValidator;
