import { EventEmitter } from "events";

export abstract class IEvents {
  public abstract events: EventEmitter;

  // events
  public abstract on(event: string, listener: any): void;
  public abstract once(event: string, listener: any): void;
  public abstract off(event: string, listener: any): void;
}

export declare abstract class IStore {
  abstract init(): Promise<any>;
  abstract set<T = any>(key: string, data: T): Promise<void>;
  abstract get<T = any>(key: string): Promise<T | undefined>;
  abstract delete(key: string): Promise<void>;
}
