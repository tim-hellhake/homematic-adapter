/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.*
 */

import { Device, Property } from 'gateway-addon';
import { Client } from 'xmlrpc';

export class TargetTemperatureProperty extends Property {
    constructor(device: Device, name: string, private client: Client, private address: string, private key: string) {
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
        this.client.methodCall('setValue', [this.address, this.key, value.toFixed(1)], (error) => {
            if (!error) {
                super.setValue(value);
            } else {
                console.error(`Could not read target temperature for ${this.address}`);
            }
        });
    }

    public poll() {
        this.client.methodCall('getValue', [this.address, this.key], (error, value) => {
            if (!error) {
                this.setCachedValueAndNotify(value);
            } else {
                console.error(`Could not set target temperature for ${this.address}`);
            }
        });
    }
}
