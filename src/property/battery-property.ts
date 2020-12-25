/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.*
 */

import {Device, Property} from 'gateway-addon';
import {Client} from 'xmlrpc';

export class BatteryProperty extends Property<number> {
  constructor(device: Device, name: string, private client: Client, private address: string, private key: string) {
    super(device, name, {
      type: 'number',
      '@type': 'LevelProperty',
      unit: 'volt',
      minimum: 0,
      maximum: 3,
      multipleOf: 0.1,
      title: 'Battery',
      readOnly: true,
    });
  }

  public poll(): void {
    this.client.methodCall('getValue', [this.address, this.key], (error, value) => {
      if (!error) {
        this.setCachedValueAndNotify(value);
      } else {
        console.error(`Could not read battery for ${this.address}`);
      }
    });
  }
}
