/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.*
 */

import { Adapter, Device, Property } from 'gateway-addon';

import { Client } from 'xmlrpc';
import { Thermostat } from './thermostat';

class HumidityProperty extends Property {
    constructor(device: Device, name: string, private client: Client, private address: string) {
        super(device, name, {
            type: 'integer',
            '@type': 'HumidityProperty',
            unit: 'percent',
            minimum: 0,
            maximum: 100,
            multipleOf: 1,
            title: 'Humidity',
            readOnly: true
        });
    }

    public poll() {
        this.client.methodCall('getValue', [this.address, 'ACTUAL_HUMIDITY'], (error, value) => {
            if (!error) {
                this.setCachedValueAndNotify(value);
            } else {
                console.error(`Could not read humidity for ${this.address}`);
            }
        });
    }
}

class BatteryProperty extends Property {
    constructor(device: Device, name: string, private client: Client, private address: string) {
        super(device, name, {
            type: 'number',
            '@type': 'LevelProperty',
            unit: 'volt',
            minimum: 0,
            maximum: 3,
            multipleOf: 0.1,
            title: 'Battery',
            readOnly: true
        });
    }

    public poll() {
        this.client.methodCall('getValue', [this.address, 'BATTERY_STATE'], (error, value) => {
            if (!error) {
                this.setCachedValueAndNotify(value);
            } else {
                console.error(`Could not read battery for ${this.address}`);
            }
        });
    }
}

export class WallThermostat extends Thermostat {
    private humidityProperty: HumidityProperty;
    private batteryProperty: BatteryProperty;

    constructor(adapter: Adapter, client: Client, address: string) {
        super(adapter, `${WallThermostat.name}-${address}`, client, address);
        this['@type'].push('HumiditySensor');
        this.name = 'Wall thermostat';
        this.description = 'HomeMatic wall thermostat';

        this.humidityProperty = new HumidityProperty(this, 'humidity', client, address);

        this.properties.set('humidity', this.humidityProperty);

        this.batteryProperty = new BatteryProperty(this, 'battery', client, address);

        this.properties.set('battery', this.batteryProperty);
    }

    poll() {
        super.poll();
        this.humidityProperty.poll();
        this.batteryProperty.poll();
    }
}
