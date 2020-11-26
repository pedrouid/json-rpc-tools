import { EventEmitter } from "events";
import * as jsonschema from "jsonschema";
import {
  formatJsonRpcError,
  JsonRpcRequest,
  JsonRpcResponse,
  INVALID_REQUEST,
  METHOD_NOT_FOUND,
  formatJsonRpcResult,
} from "@json-rpc-tools/utils";
import { IStore } from "@pedrouid/iso-store";

import { PendingRequests } from "./pending";
import {
  IJsonRpcAuthenticator,
  ISigner,
  JsonRpcAuthenticatorConfig,
  JsonRpcMethodConfig,
} from "./types";

export class JsonRpcAuthenticator extends IJsonRpcAuthenticator {
  public events = new EventEmitter();

  public pending: PendingRequests;

  constructor(public config: JsonRpcAuthenticatorConfig, public signer: ISigner, store: IStore) {
    super(config, signer, store);
    this.config = config;
    this.pending = new PendingRequests(store, config.context);
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
    return this.signer.getAccounts();
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

  public async resolve(request: JsonRpcRequest): Promise<JsonRpcResponse | undefined> {
    if (!this.supportsMethod(request)) {
      return formatJsonRpcError(request.id, METHOD_NOT_FOUND);
    }
    if (!this.validateRequest(request)) {
      return formatJsonRpcError(request.id, INVALID_REQUEST);
    }
    if (this.requiresApproval(request)) {
      await this.pending.set(request);
      this.events.emit("required_user_approval", request);
      return;
    }
    const result = await this.signer.request(request);
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
}
