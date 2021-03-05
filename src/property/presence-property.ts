/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.*
 */

import {Device, Property} from 'gateway-addon';
import {Client} from 'xmlrpc';

export class PresenceProperty extends Property<boolean> {
  // eslint-disable-next-line no-unused-vars
  constructor(device: Device, name: string, private client: Client, private address: string, private key: string) {
    super(device, name, {
      '@type': 'MotionProperty',
      type: 'boolean',
      title: 'Presence detected',
      readOnly: true,
    });
  }

  public poll(): void {
    this.client.methodCall('getValue', [this.address, this.key], (error, value) => {
      if (!error) {
        this.setCachedValueAndNotify(value);
      } else {
        console.error(`Could not read presence state for ${this.address}`);
      }
    });
  }
}
