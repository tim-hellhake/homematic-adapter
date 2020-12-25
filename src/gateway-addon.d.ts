/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

declare module 'gateway-addon' {
    class Event {
      constructor(device: Record<string, unknown>, name: string, data?: Record<string, unknown>);
    }

    interface EventDescription {
        name: string;
        metadata: EventMetadata;
    }

    interface EventMetadata {
        description: string,
        type: string
    }

    class Property {
        public name: string;

        protected title: string;

        constructor(device: Device, name: string, propertyDescr: Record<string, unknown>);

        public setCachedValue(value: unknown): void;

        public setCachedValueAndNotify(value: unknown): void;

        public setValue(value: unknown): Promise<void>
    }

    class Device {
        protected '@context': string;

        protected '@type': string[];

        public id: string;

        public name: string;

        protected description: string;

        constructor(adapter: Adapter, id: string);

        public properties: Map<string, Property>;

        public notifyPropertyChanged(property: Property): void;

        public addAction(name: string, metadata: Record<string, unknown>): void;

        public events: Map<string, EventDescription>;

        public eventNotify(event: Event): void;
    }

    class Adapter {
      constructor(addonManager: AddonManager, id: string, packageName: string);

      public handleDeviceAdded(device: Device): void;
    }

    class Database {
      constructor(packageName: string, path?: string);

      public open(): Promise<void>;

      public close(): void;

      public loadConfig(): Promise<Record<string, unknown>>;

      public saveConfig(config: Record<string, unknown>): Promise<void>;
    }

    class AddonManager {
      public addAdapter(adapter: Adapter): void;
    }
}
