/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.*
 */

import { Adapter, Device, Property } from 'gateway-addon';

import { Client } from 'xmlrpc';

export class RadiatorThermostat extends Device {
    private temperatureProperty: Property;

    constructor(adapter: Adapter, private client: Client, private address: string) {
        super(adapter, `${RadiatorThermostat.name}-${address}`);
        this['@context'] = 'https://iot.mozilla.org/schemas/';
        this['@type'] = ['TemperatureSensor'];
        this.name = 'Radiator thermostat';
        this.description = 'HomeMatic radiator thermostat';

        this.temperatureProperty = new Property(this, 'temperature', {
            type: 'number',
            '@type': 'TemperatureProperty',
            unit: 'degree celsius',
            title: 'temperature',
            description: 'The ambient temperature',
            readOnly: true
        });

        this.properties.set('temperature', this.temperatureProperty);
    }

    startPolling(interval: number) {
        this.poll();

        setInterval(() => {
            this.poll();
        }, interval * 1000);
    }

    poll() {
        this.client.methodCall('getValue', [this.address, 'ACTUAL_TEMPERATURE'], (error, value) => {
            if (!error) {
                this.updateValue(value);
            } else {
                console.error(`Could not read temperature for ${this.address}`);
            }
        });
    }

    private updateValue(value: any) {
        this.temperatureProperty.setCachedValue(value);
        this.notifyPropertyChanged(this.temperatureProperty);
    }
}
