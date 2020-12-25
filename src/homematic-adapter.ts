/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.*
 */

'use strict';

import {Adapter, AddonManager} from 'gateway-addon';
import {createClient} from 'xmlrpc';
import {RadiatorThermostat} from './radiator-thermostat';
import {WallThermostat} from './wall-thermostat';
import {ShutterContact} from './shutter-contact';
import {Config} from './config';

export class HomeMaticAdapter extends Adapter {
  constructor(addonManager: AddonManager, id: string, config: Config) {
    super(addonManager, HomeMaticAdapter.name, id);
    addonManager.addAdapter(this);

    const {
      host,
      port,
    } = config;

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
      port,
    });

    client.methodCall('listDevices', [], (error, devices) => {
      if (!error) {
        for (const device of devices) {
          console.log(`${device.PARENT_TYPE} ${device.TYPE}`);
          switch (device.PARENT_TYPE) {
            case 'HM-CC-RT-DN':
              if (device.TYPE === 'CLIMATECONTROL_RT_TRANSCEIVER') {
                console.log(`Detected new radiator thermostat ${device.ADDRESS}`);
                const radiatorThermostat = new RadiatorThermostat(this, client, device.ADDRESS);
                this.handleDeviceAdded(radiatorThermostat);
                radiatorThermostat.startPolling(1);
              }
              break;
            case 'HM-TC-IT-WM-W-EU':
              if (device.TYPE === 'THERMALCONTROL_TRANSMIT') {
                console.log(`Detected new wall thermostat ${device.ADDRESS}`);
                const wallThermostat = new WallThermostat(this, client, device.ADDRESS);
                this.handleDeviceAdded(wallThermostat);
                wallThermostat.startPolling(1);
              }
              break;
            case 'HM-Sec-SCo':
              if (device.TYPE === 'SHUTTER_CONTACT') {
                console.log(`Detected new shutter contact ${device.ADDRESS}`);
                const windowSensor = new ShutterContact(this, client, device.ADDRESS);
                this.handleDeviceAdded(windowSensor);
                windowSensor.startPolling(1);
                continue;
              }
              break;
          }
        }
      } else {
        console.error(`Could not enumerate devices: ${error}`);
      }
    });
  }
}
