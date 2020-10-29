/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.*
 */

import { Adapter, Device, Property } from 'gateway-addon';

import { Client } from 'xmlrpc';

class TemperatureProperty extends Property {
    constructor(device: Device, name: string, private client: Client, private address: string) {
        super(device, name, {
            type: 'number',
            '@type': 'TemperatureProperty',
            unit: 'degree celsius',
            multipleOf: 0.1,
            title: 'Temperature',
            description: 'The temperature',
            readOnly: true
        });
    }

    public poll() {
        this.client.methodCall('getValue', [this.address, 'ACTUAL_TEMPERATURE'], (error, value) => {
            if (!error) {
                this.setCachedValueAndNotify(value);
            } else {
                console.error(`Could not read set temperature for ${this.address}`);
            }
        });
    }
}

export class RadiatorThermostat extends Device {
    private temperatureProperty: TemperatureProperty;

    constructor(adapter: Adapter, client: Client, address: string) {
        super(adapter, `${RadiatorThermostat.name}-${address}`);
        this['@context'] = 'https://iot.mozilla.org/schemas/';
        this['@type'] = ['TemperatureSensor'];
        this.name = 'Radiator thermostat';
        this.description = 'HomeMatic radiator thermostat';

        this.temperatureProperty = new TemperatureProperty(this, 'temperature', client, address);

        this.properties.set('temperature', this.temperatureProperty);
    }

    startPolling(interval: number) {
        this.poll();

        setInterval(() => {
            this.poll();
        }, interval * 1000);
    }

    poll() {
        this.temperatureProperty.poll();
    }
}
