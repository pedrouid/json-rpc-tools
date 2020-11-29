import { EventEmitter } from "events";
import {
  formatJsonRpcError,
  JsonRpcRequest,
  JsonRpcResponse,
  INVALID_REQUEST,
  METHOD_NOT_FOUND,
  formatJsonRpcResult,
  JsonRpcError,
  IBlockchainProvider,
  IBlockchainAuthenticator,
} from "@json-rpc-tools/utils";
import { IStore } from "@pedrouid/iso-store";

import { PendingRequests } from "./pending";

export class BlockchainAuthenticator implements IBlockchainAuthenticator {
  public events = new EventEmitter();

  public pending: PendingRequests;

  constructor(public provider: IBlockchainProvider, store?: IStore) {
    this.provider = provider;
    this.pending = new PendingRequests(this.provider.chainId, store);
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
    return this.provider.getAccounts();
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
    if (this.requiresApproval(request.method)) {
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

  private requiresApproval(method: string): boolean {
    return this.provider.router.map[method] === "signer";
  }

  private findError(request: JsonRpcRequest): JsonRpcError | undefined {
    if (!this.provider.router.isSupported(request.method)) {
      return formatJsonRpcError(request.id, METHOD_NOT_FOUND);
    }
    if (!this.provider.router.validate(request)) {
      return formatJsonRpcError(request.id, INVALID_REQUEST);
    }
    return;
  }
}
