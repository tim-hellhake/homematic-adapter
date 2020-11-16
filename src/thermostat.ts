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
                console.error(`Could not read temperature for ${this.address}`);
            }
        });
    }
}

class TargetTemperatureProperty extends Property {
    constructor(device: Device, name: string, private client: Client, private address: string) {
        super(device, name, {
            type: 'number',
            '@type': 'TargetTemperatureProperty',
            unit: 'degree celsius',
            multipleOf: 0.5,
            title: 'Target temperature',
            description: 'The target temperature'
        });
    }

    public async setValue(value: number) {
        this.client.methodCall('setValue', [this.address, 'SET_TEMPERATURE', value.toFixed(1)], (error) => {
            if (!error) {
                super.setValue(value);
            } else {
                console.error(`Could not set target temperature for ${this.address}`);
            }
        });
    }

    public poll() {
        this.client.methodCall('getValue', [this.address, 'SET_TEMPERATURE'], (error, value) => {
            if (!error) {
                this.setCachedValueAndNotify(value);
            } else {
                console.error(`Could not read target temperature for ${this.address}`);
            }
        });
    }
}

export class Thermostat extends Device {
    private temperatureProperty: TemperatureProperty;
    private targetTemperatureProperty: TargetTemperatureProperty;

    constructor(adapter: Adapter, id: string, client: Client, address: string) {
        super(adapter, id);
        this['@context'] = 'https://iot.mozilla.org/schemas/';
        this['@type'] = ['TemperatureSensor'];
        this.name = 'Radiator thermostat';
        this.description = 'HomeMatic thermostat';

        this.temperatureProperty = new TemperatureProperty(this, 'temperature', client, address);

        this.properties.set('temperature', this.temperatureProperty);

        this.targetTemperatureProperty = new TargetTemperatureProperty(this, 'targetTemperature', client, address);

        this.properties.set('targetTemperature', this.targetTemperatureProperty);
    }

    startPolling(interval: number) {
        this.poll();

        setInterval(() => {
            this.poll();
        }, interval * 1000);
    }

    poll() {
        this.temperatureProperty.poll();
        this.targetTemperatureProperty.poll();
    }
}
