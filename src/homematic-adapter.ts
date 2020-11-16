/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.*
 */

'use strict';

import { Adapter } from 'gateway-addon';
import { createClient } from 'xmlrpc';
import { RadiatorThermostat } from './radiator-thermostat';
import { WallThermostat } from './wall-thermostat';

export class HomeMaticAdapter extends Adapter {
  constructor(addonManager: any, manifest: any) {
    super(addonManager, HomeMaticAdapter.name, manifest.name);
    addonManager.addAdapter(this);

    const {
      host,
      port
    } = manifest.moziot.config;

    if (!host) {
      console.warn('Please specify host in the config');
      return;
    }

    if (!port) {
      console.warn('Please specify port in the config');
      return;
    }

    const client = createClient({
      host,
      port
    });

    client.methodCall('listDevices', [], (error, devices) => {
      if (!error) {
        for (const device of devices) {
          if (device.PARENT_TYPE === 'HM-CC-RT-DN' && device.TYPE === 'CLIMATECONTROL_RT_TRANSCEIVER') {
            console.log(`Detected new radiator thermostat ${device.ADDRESS}`);
            const radiatorThermostat = new RadiatorThermostat(this, client, device.ADDRESS);
            this.handleDeviceAdded(radiatorThermostat);
            radiatorThermostat.startPolling(1);
            continue;
          }

          if (device.PARENT_TYPE === 'HM-TC-IT-WM-W-EU' && device.TYPE === 'THERMALCONTROL_TRANSMIT') {
            console.log(`Detected new wall thermostat ${device.ADDRESS}`);
            const wallThermostat = new WallThermostat(this, client, device.ADDRESS);
            this.handleDeviceAdded(wallThermostat);
            wallThermostat.startPolling(1);
          }
        }
      } else {
        console.error(`Could not enumerate devices: ${error}`);
      }
    });
  }
}
