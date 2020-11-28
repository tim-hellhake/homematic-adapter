/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.*
 */

import { Adapter, Device } from 'gateway-addon';

import { Client } from 'xmlrpc';
import { TemperatureProperty } from './property/temperature-property';
import { TargetTemperatureProperty } from './property/target-temperature-property';

export class Thermostat extends Device {
    private temperatureProperty: TemperatureProperty;
    private targetTemperatureProperty: TargetTemperatureProperty;

    constructor(adapter: Adapter, id: string, client: Client, address: string) {
        super(adapter, id);
        this['@context'] = 'https://iot.mozilla.org/schemas/';
        this['@type'] = ['TemperatureSensor'];
        this.name = `Thermostat (${address})`;

        this.temperatureProperty = new TemperatureProperty(this, 'temperature', client, address, 'ACTUAL_TEMPERATURE');

        this.properties.set('temperature', this.temperatureProperty);

        this.targetTemperatureProperty = new TargetTemperatureProperty(this, 'targetTemperature', client, address, 'SET_TEMPERATURE');

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
