/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.*
 */

'use strict';

import {Adapter, AddonManagerProxy} from 'gateway-addon';
import {createClient} from 'xmlrpc';
import {Config} from '../config';
import {PresenceSensor} from './presence-sensor';
import {RadiatorThermostat} from './radiator-thermostat';
import {WallThermostat} from './wall-thermostat';

export class HomeMaticIPAdapter extends Adapter {
  constructor(addonManager: AddonManagerProxy, id: string, config: Config) {
    super(addonManager, HomeMaticIPAdapter.name, id);
    addonManager.addAdapter(this);

    const {
      ipHost,
      ipPort,
    } = config;

    if (!ipHost) {
      console.warn('Please specify host in the config');
      return;
    }

    if (!ipPort) {
      console.warn('Please specify port in the config');
      return;
    }

    const client = createClient({
      host: ipHost,
      port: ipPort,
    });

    client.methodCall('listDevices', [], (error, devices) => {
      if (!error) {
        for (const device of devices) {
          if (device.PARENT_TYPE === 'HMIP-eTRV' && device.TYPE === 'HEATING_CLIMATECONTROL_TRANSCEIVER') {
            console.log(`Detected new IP radiator thermostat ${device.ADDRESS}`);
            const radiatorThermostat = new RadiatorThermostat(this, client, device.ADDRESS);
            this.handleDeviceAdded(radiatorThermostat);
            radiatorThermostat.startPolling(1);
            continue;
          }

          if (device.PARENT_TYPE === 'HmIP-WTH-2' && device.TYPE === 'HEATING_CLIMATECONTROL_TRANSCEIVER') {
            console.log(`Detected new IP wall thermostat ${device.ADDRESS}`);
            const wallThermostat = new WallThermostat(this, client, device.ADDRESS);
            this.handleDeviceAdded(wallThermostat);
            wallThermostat.startPolling(1);
          }

          if (device.PARENT_TYPE === 'HmIP-SPI' && device.TYPE === 'PRESENCEDETECTOR_TRANSCEIVER') {
            console.log(`Detected new IP presence sensor ${device.ADDRESS}`);
            const presenceSensor = new PresenceSensor(this, client, device.ADDRESS);
            this.handleDeviceAdded(presenceSensor);
            presenceSensor.startPolling(1);
          }
        }
      } else {
        console.error(`Could not enumerate devices: ${error}`);
      }
    });
  }
}
