import { JsonRpcRequest, IPendingRequests } from "@json-rpc-tools/utils";
import { IStore } from "@pedrouid/iso-store";

export class PendingRequests implements IPendingRequests {
  public pending: JsonRpcRequest[] = [];
  constructor(public chainId: string, public store?: IStore) {
    this.store = store;
    this.chainId = chainId;
  }

  public async init(): Promise<void> {
    await this.restore();
  }

  public async set(request: JsonRpcRequest): Promise<void> {
    this.pending.push(request);
    await this.persist();
  }

  public async get(id: number): Promise<JsonRpcRequest | undefined> {
    return this.pending.find(request => request.id === id);
  }

  public async delete(id: number): Promise<void> {
    this.pending = this.pending.filter(request => request.id !== id);
    await this.persist();
  }

  // -- Private ----------------------------------------------- //

  private getStoreKey() {
    return `${this.chainId}:jsonrpc:pending`;
  }

  private async persist() {
    if (typeof this.store === "undefined") return;
    await this.store.set<JsonRpcRequest[]>(this.getStoreKey(), this.pending);
  }

  private async restore() {
    if (typeof this.store === "undefined") return;
    this.pending = (await this.store.get<JsonRpcRequest[]>(this.getStoreKey())) || [];
  }
}
