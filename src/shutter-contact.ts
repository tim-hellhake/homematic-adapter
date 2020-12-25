/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.*
 */

import {Adapter, Device} from 'gateway-addon';

import {Client} from 'xmlrpc';
import {ShutterStateProperty} from './property/shutter-state-property';

export class ShutterContact extends Device {
    private shutterStateProperty: ShutterStateProperty;

    constructor(adapter: Adapter, client: Client, address: string) {
      super(adapter, `${ShutterContact.name}-${address}`);
      this['@context'] = 'https://iot.mozilla.org/schemas/';
      this['@type'] = ['DoorSensor'];
      this.setTitle(`Shutter contact (${address})`);

      this.shutterStateProperty = new ShutterStateProperty(this, 'state', client, address, 'STATE');

      this.addProperty(this.shutterStateProperty);
    }

    startPolling(interval: number): void {
      this.poll();

      setInterval(() => {
        this.poll();
      }, interval * 1000);
    }

    poll(): void {
      this.shutterStateProperty.poll();
    }
}
