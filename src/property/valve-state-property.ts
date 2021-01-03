/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.*
 */

import {Device, Property} from 'gateway-addon';
import {Client} from 'xmlrpc';

export class ValveStateProperty extends Property<number> {
  // eslint-disable-next-line no-unused-vars
  constructor(device: Device, name: string, private client: Client, private address: string, private key: string) {
    super(device, name, {
      type: 'integer',
      '@type': 'LevelProperty',
      unit: 'percent',
      minimum: 0,
      maximum: 100,
      multipleOf: 1,
      title: 'Valve state',
      description: 'The valve state',
      readOnly: true,
    });
  }

  public poll(): void {
    this.client.methodCall('getValue', [this.address, this.key], (error, value) => {
      if (!error) {
        this.setCachedValueAndNotify(value);
      } else {
        console.error(`Could not read valve state for ${this.address}`);
      }
    });
  }
}
