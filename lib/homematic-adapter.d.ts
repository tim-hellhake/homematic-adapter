/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.*
 */
import { Adapter, Device } from 'gateway-addon';
import { Client } from 'xmlrpc';
export declare class RadiatorThermostat extends Device {
    private client;
    private address;
    private temperatureProperty;
    constructor(adapter: Adapter, client: Client, address: string);
    startPolling(interval: number): void;
    poll(): void;
    private updateValue;
}
export declare class HomeMaticAdapter extends Adapter {
    constructor(addonManager: any, manifest: any);
}
//# sourceMappingURL=homematic-adapter.d.ts.map