/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.*
 */
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const gateway_addon_1 = require("gateway-addon");
const xmlrpc_1 = require("xmlrpc");
class RadiatorThermostat extends gateway_addon_1.Device {
    constructor(adapter, client, address) {
        super(adapter, `${RadiatorThermostat.name}-${address}`);
        this.client = client;
        this.address = address;
        this['@context'] = 'https://iot.mozilla.org/schemas/';
        this['@type'] = ['TemperatureSensor'];
        this.name = 'Radiator thermostat';
        this.description = 'HomeMatic radiator thermostat';
        this.temperatureProperty = new gateway_addon_1.Property(this, 'temperature', {
            type: 'number',
            '@type': 'TemperatureProperty',
            unit: 'degree celsius',
            title: 'temperature',
            description: 'The ambient temperature',
            readOnly: true
        });
        this.properties.set('temperature', this.temperatureProperty);
    }
    startPolling(interval) {
        this.poll();
        setInterval(() => {
            this.poll();
        }, interval * 1000);
    }
    poll() {
        // eslint-disable-next-line max-len
        this.client.methodCall('getValue', [this.address, 'ACTUAL_TEMPERATURE'], (error, value) => {
            if (!error) {
                this.updateValue(value);
            }
            else {
                console.error(`Could not read temperature for ${this.address}`);
            }
        });
    }
    updateValue(value) {
        this.temperatureProperty.setCachedValue(value);
        this.notifyPropertyChanged(this.temperatureProperty);
    }
}
exports.RadiatorThermostat = RadiatorThermostat;
class HomeMaticAdapter extends gateway_addon_1.Adapter {
    constructor(addonManager, manifest) {
        super(addonManager, HomeMaticAdapter.name, manifest.name);
        addonManager.addAdapter(this);
        const { host, port } = manifest.moziot.config;
        if (!host) {
            console.warn('Please specify host in the config');
            return;
        }
        if (!port) {
            console.warn('Please specify port in the config');
            return;
        }
        const client = xmlrpc_1.createClient({
            host,
            port
        });
        client.methodCall('listDevices', [], (error, devices) => {
            if (!error) {
                for (const device of devices) {
                    // eslint-disable-next-line max-len
                    if (device.PARENT_TYPE === 'HM-CC-RT-DN' && device.TYPE === 'CLIMATECONTROL_RT_TRANSCEIVER') {
                        console.log(`Detected new radiator thermostat ${device.ADDRESS}`);
                        // eslint-disable-next-line max-len
                        const radiatorThermostat = new RadiatorThermostat(this, client, device.ADDRESS);
                        this.handleDeviceAdded(radiatorThermostat);
                        radiatorThermostat.startPolling(1);
                    }
                }
            }
            else {
                console.error(`Could not enumerate devices: ${error}`);
            }
        });
    }
}
exports.HomeMaticAdapter = HomeMaticAdapter;
//# sourceMappingURL=homematic-adapter.js.map