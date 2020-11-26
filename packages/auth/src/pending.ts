import { JsonRpcRequest } from "@json-rpc-tools/utils";
import { IStore } from "@pedrouid/iso-store";

import { IPendingRequests } from "./types";

export class PendingRequests extends IPendingRequests {
  public pending: JsonRpcRequest[] = [];
  constructor(public store: IStore, public context: string) {
    super(store);
    this.store = store;
    this.context = context;
  }

  public async init(): Promise<void> {
    await this.restore();
  }

  public async set(request: JsonRpcRequest): Promise<void> {
    this.pending.push(request);
    await this.persist();
  }

  public async get(id: number): Promise<JsonRpcRequest | undefined> {
    return this.pending.find((request) => request.id === id);
  }

  public async delete(id: number): Promise<void> {
    this.pending = this.pending.filter((request) => request.id !== id);
    await this.persist();
  }

  // -- Private ----------------------------------------------- //

  private getStoreKey() {
    return `${this.context}:jsonrpc:pending`;
  }

  private async persist() {
    await this.store.set<JsonRpcRequest[]>(this.getStoreKey(), this.pending);
  }

  private async restore() {
    this.pending = (await this.store.get<JsonRpcRequest[]>(this.getStoreKey())) || [];
  }
}
