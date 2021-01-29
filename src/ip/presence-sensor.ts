/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.*
 */

import {Adapter, Device} from 'gateway-addon';

import {Client} from 'xmlrpc';
import {PresenceProperty} from '../property/presence-property';

export class PresenceSensor extends Device {
    private presenceProperty: PresenceProperty;

    constructor(adapter: Adapter, client: Client, address: string, value: string) {
      super(adapter, `${PresenceSensor.name}-${address}`);
      this.setTitle(`Presence sensor (${address})`);

      this.presenceProperty = new PresenceProperty(this, 'presence', client, address, value);

      this.addProperty(this.presenceProperty);
    }

    startPolling(interval: number): void {
      this.poll();

      setInterval(() => {
        this.poll();
      }, interval * 1000);
    }

    poll(): void {
      this.presenceProperty.poll();
    }
}
