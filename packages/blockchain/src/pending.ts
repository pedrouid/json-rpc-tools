import { IKeyValueStorage } from "keyvaluestorage";
import { JsonRpcRequest, IPendingRequests } from "@json-rpc-tools/utils";

export class PendingRequests implements IPendingRequests {
  public chainId: string | undefined;

  public pending: JsonRpcRequest[] = [];
  constructor(public storage?: IKeyValueStorage) {
    this.storage = storage;
  }

  public async init(chainId: string | undefined = this.chainId): Promise<void> {
    this.chainId = chainId;
    await this.restorage(chainId);
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

  private getStoreKey(chainId: string | undefined = this.chainId) {
    if (typeof chainId === "undefined") {
      throw new Error("Missing chainId - please intitialize BlockchainAuthenticator");
    }
    return `${chainId}:jsonrpc:pending`;
  }

  private async persist() {
    if (typeof this.storage === "undefined") return;
    await this.storage.setItem<JsonRpcRequest[]>(this.getStoreKey(), this.pending);
  }

  private async restorage(chainId: string | undefined = this.chainId) {
    if (typeof this.storage === "undefined") return;
    this.pending = (await this.storage.getItem<JsonRpcRequest[]>(this.getStoreKey(chainId))) || [];
  }
}
