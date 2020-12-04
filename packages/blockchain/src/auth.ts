import { EventEmitter } from "events";
import { IStore } from "@pedrouid/iso-store";
import {
  JsonRpcRequest,
  JsonRpcResponse,
  formatJsonRpcResult,
  IBlockchainProvider,
  IBlockchainAuthenticator,
  formatJsonRpcError,
  JsonRpcError,
} from "@json-rpc-tools/utils";

import { PendingRequests } from "./pending";

export class BlockchainAuthenticator implements IBlockchainAuthenticator {
  public events = new EventEmitter();

  public pending: PendingRequests;

  constructor(public provider: IBlockchainProvider, store?: IStore) {
    this.provider = provider;
    this.pending = new PendingRequests(store);
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
    await this.pending.init(await this.provider.getChainId());
  }

  public async getChainId(): Promise<string> {
    return this.provider.getChainId();
  }

  public async getAccounts(): Promise<string[]> {
    return this.provider.getAccounts();
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

  public async request(request: JsonRpcRequest): Promise<JsonRpcResponse> {
    const error = this.provider.assertRequest(request);
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
    return this.provider.map[method] === "signer";
  }
}

["eth_chainId", "eth_*", "*", "eth_sign*", "eth+", "**", "eth_sign*Typed"];
