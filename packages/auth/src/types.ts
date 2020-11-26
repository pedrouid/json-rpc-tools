import { EventEmitter } from "events";
import * as jsonschema from "jsonschema";
import { IStore } from "@pedrouid/iso-store";

import { IJsonRpcProvider, JsonRpcRequest, JsonRpcResponse } from "@json-rpc-tools/utils";

export type JsonSchema = jsonschema.Schema;
export interface JsonRpcMethodConfig {
  name: string;
  description: string;
  params: JsonSchema;
  result: JsonSchema;
  userApproval?: boolean;
}
export interface JsonRpcAuthenticatorConfig {
  context: string;
  methods: {
    [method: string]: JsonRpcMethodConfig;
  };
}

export abstract class ISigner extends IJsonRpcProvider {
  public abstract getAccounts(): Promise<string[]>;
}
export abstract class IPendingRequests {
  public abstract pending: JsonRpcRequest[];
  constructor(public store: IStore) {}
  public abstract init(): Promise<void>;
  public abstract set(request: JsonRpcRequest): Promise<void>;
  public abstract get(id: number): Promise<JsonRpcRequest | undefined>;
  public abstract delete(id: number): Promise<void>;
}

export abstract class IEvents {
  public abstract events: EventEmitter;

  public abstract on(event: string, listener: any): void;
  public abstract once(event: string, listener: any): void;
  public abstract off(event: string, listener: any): void;
}

export abstract class IJsonRpcAuthenticator extends IEvents {
  public abstract pending: IPendingRequests;

  constructor(public config: JsonRpcAuthenticatorConfig, public signer: ISigner, store: IStore) {
    super();
  }

  public abstract init(): Promise<void>;

  public abstract getAccounts(): Promise<string[]>;

  public abstract supportsMethod(request: JsonRpcRequest): boolean;

  public abstract requiresApproval(request: JsonRpcRequest): boolean;

  public abstract validateRequest(request: JsonRpcRequest): boolean;

  public abstract resolve(request: JsonRpcRequest): Promise<JsonRpcResponse | undefined>;
}
