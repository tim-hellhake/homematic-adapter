/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.*
 */

import { Adapter, Device, Property } from 'gateway-addon';

import { Client } from 'xmlrpc';
import { Thermostat } from './thermostat';

class ValveStateProperty extends Property {
    constructor(device: Device, name: string, private client: Client, private address: string) {
        super(device, name, {
            type: 'integer',
            '@type': 'LevelProperty',
            unit: 'percent',
            minimum: 0,
            maximum: 100,
            multipleOf: 1,
            title: 'Valve state',
            description: 'The valve state',
            readOnly: true
        });
    }

    public poll() {
        this.client.methodCall('getValue', [this.address, 'VALVE_STATE'], (error, value) => {
            if (!error) {
                this.setCachedValueAndNotify(value);
            } else {
                console.error(`Could not read valve state for ${this.address}`);
            }
        });
    }
}

export class RadiatorThermostat extends Thermostat {
    private valveStateProperty: ValveStateProperty;

    constructor(adapter: Adapter, client: Client, address: string) {
        super(adapter, `${RadiatorThermostat.name}-${address}`, client, address);
        this.name = 'Radiator thermostat';
        this.description = 'HomeMatic radiator thermostat';

        this.valveStateProperty = new ValveStateProperty(this, 'valveState', client, address);

        this.properties.set('valveState', this.valveStateProperty);
    }

    poll() {
        super.poll();
        this.valveStateProperty.poll();
    }
}
