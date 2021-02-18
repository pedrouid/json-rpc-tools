import { EventEmitter } from "events";
import {
  JsonRpcRequest,
  JsonRpcResponse,
  formatJsonRpcResult,
  IBlockchainProvider,
  IBlockchainAuthenticator,
  formatJsonRpcError,
  JsonRpcError,
  BlockchainAuthenticatorConfig,
} from "@json-rpc-tools/utils";

import { PendingRequests } from "./pending";

export class BlockchainAuthenticator implements IBlockchainAuthenticator {
  public events = new EventEmitter();

  public pending: PendingRequests;
  public provider: IBlockchainProvider;

  constructor(public config: BlockchainAuthenticatorConfig) {
    this.config = config;
    this.provider = config.provider;
    this.pending = new PendingRequests(config.storage);
  }

  get chainId(): string {
    return this.provider.chainId;
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

  public removeListener(event: string, listener: any): void {
    this.events.removeListener(event, listener);
  }
  public async init(): Promise<void> {
    await this.pending.init(this.provider.chainId);
  }

  public async approve(request: JsonRpcRequest): Promise<JsonRpcResponse> {
    const error = this.provider.assertRequest(request);
    if (typeof error !== "undefined") {
      return error;
    }
    const result = await this.provider.request(request);
    const response = formatJsonRpcResult(request.id, result);
    this.events.emit(`${request.id}`, response);
    return response;
  }

  public async reject(request: JsonRpcRequest): Promise<JsonRpcError> {
    const response = formatJsonRpcError(request.id, "User rejected request");
    this.events.emit(`${request.id}`, response);
    return response;
  }

  public async resolve(request: JsonRpcRequest): Promise<JsonRpcResponse> {
    const error = this.provider.assertRequest(request);
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

  public async assert(request: JsonRpcRequest): Promise<boolean> {
    const error = this.provider.assertRequest(request);
    if (typeof error !== "undefined") {
      throw new Error(error.error.message);
    }
    return this.requiresApproval(request);
  }

  private requiresApproval(request: JsonRpcRequest): boolean {
    return this.config.requiredApproval.includes(request.method);
  }
}
