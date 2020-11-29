/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.*
 */

import {Adapter} from 'gateway-addon';
import {Client} from 'xmlrpc';
import {Thermostat} from './thermostat';
import {ValveStateProperty} from './property/valve-state-property';

export class RadiatorThermostat extends Thermostat {
    private valveStateProperty: ValveStateProperty;

    constructor(adapter: Adapter, client: Client, address: string) {
      super(adapter, `${RadiatorThermostat.name}-${address}`, client, address);
      this.name = `Radiator thermostat (${address})`;

      this.valveStateProperty = new ValveStateProperty(this, 'valveState', client, address, 'VALVE_STATE');

      this.properties.set('valveState', this.valveStateProperty);
    }

    poll(): void {
      super.poll();
      this.valveStateProperty.poll();
    }
}
