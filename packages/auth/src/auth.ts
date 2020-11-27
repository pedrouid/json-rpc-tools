import { EventEmitter } from "events";
import * as jsonschema from "jsonschema";
import {
  formatJsonRpcError,
  JsonRpcRequest,
  JsonRpcResponse,
  INVALID_REQUEST,
  METHOD_NOT_FOUND,
  formatJsonRpcResult,
  JsonRpcError,
  formatJsonRpcRequest,
} from "@json-rpc-tools/utils";
import { IStore } from "@pedrouid/iso-store";

import { PendingRequests } from "./pending";
import {
  IJsonRpcAuthenticator,
  IJsonRpcProvider,
  JsonRpcAuthConfig,
  JsonRpcMethodConfig,
} from "./types";

export class JsonRpcAuthenticator implements IJsonRpcAuthenticator {
  public events = new EventEmitter();

  public pending: PendingRequests;

  constructor(public config: JsonRpcAuthConfig, public provider: IJsonRpcProvider, store?: IStore) {
    this.config = config;
    this.pending = new PendingRequests(config.chainId, store);
  }

  public on(event: string, listener: any): void {
    this.events.on(event, listener);
  }

  public once(event: string, listener: any): void {
    this.events.once(event, listener);
  }

  public off(event: string, listener: any): void {
    this.events.off(event, listener);
  }

  public async init(): Promise<void> {
    await this.pending.init();
  }

  public async getAccounts(): Promise<string[]> {
    const request = formatJsonRpcRequest(this.config.accounts.method, []);
    return this.provider.request(request);
  }

  public supportsMethod(request: JsonRpcRequest): boolean {
    return Object.keys(this.config.methods).includes(request.method);
  }

  public requiresApproval(request: JsonRpcRequest): boolean {
    const jsonrpc = this.getJsonRpcConfig(request.method);
    return !!jsonrpc.userApproval;
  }

  public validateRequest(request: JsonRpcRequest): boolean {
    const jsonrpc = this.getJsonRpcConfig(request.method);
    const result = jsonschema.validate(request.params, jsonrpc.params);
    return result.valid;
  }

  public async approve(request: JsonRpcRequest): Promise<JsonRpcResponse> {
    const error = this.findError(request);
    if (typeof error !== "undefined") {
      return error;
    }
    const result = await this.provider.request(request);
    const response = formatJsonRpcResult(request.id, result);
    this.events.emit(`${request.id}`, response);
    return response;
  }

  public async resolve(request: JsonRpcRequest): Promise<JsonRpcResponse> {
    const error = this.findError(request);
    if (typeof error !== "undefined") {
      return error;
    }
    if (this.requiresApproval(request)) {
      await this.pending.set(request);
      this.events.emit("pending_approval", request);
      return new Promise((resolve, reject) => {
        this.events.on(`${request.id}`, async (response: JsonRpcResponse) => {
          await this.pending.delete(request.id);
          resolve(response);
        });
      });
    }
    const result = await this.provider.request(request);
    return formatJsonRpcResult(request.id, result);
  }
  // -- Private ----------------------------------------------- //

  private getJsonRpcConfig(method: string): JsonRpcMethodConfig {
    const jsonrpc = this.config.methods[method];
    if (typeof jsonrpc === "undefined") {
      throw new Error(`JSON-RPC method not supported: ${method}`);
    }
    return jsonrpc;
  }

  private findError(request: JsonRpcRequest): JsonRpcError | undefined {
    if (!this.supportsMethod(request)) {
      return formatJsonRpcError(request.id, METHOD_NOT_FOUND);
    }
    if (!this.validateRequest(request)) {
      return formatJsonRpcError(request.id, INVALID_REQUEST);
    }
    return;
  }
}
