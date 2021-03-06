/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.*
 */

import {Adapter} from 'gateway-addon';

import {Client} from 'xmlrpc';
import {BatteryProperty} from '../property/battery-property';
import {HumidityProperty} from '../property/humidity-property';
import {Thermostat} from './thermostat';

export class WallThermostat extends Thermostat {
    private humidityProperty: HumidityProperty;

    private batteryProperty: BatteryProperty;

    constructor(adapter: Adapter, client: Client, address: string) {
      super(adapter, `${WallThermostat.name}-${address}`, client, address);
      this['@type'].push('HumiditySensor');
      this.setTitle(`Wall thermostat (${address})`);

      this.humidityProperty = new HumidityProperty(this, 'humidity', client, address, 'ACTUAL_HUMIDITY');
      this.addProperty(this.humidityProperty);

      this.batteryProperty = new BatteryProperty(this, 'battery', client, address, 'BATTERY_STATE');
      this.addProperty(this.batteryProperty);
    }

    poll(): void {
      super.poll();
      this.humidityProperty.poll();
      this.batteryProperty.poll();
    }
}
