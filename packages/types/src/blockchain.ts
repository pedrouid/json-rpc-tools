import { JsonRpcRequest, JsonRpcResponse } from "./jsonrpc";
import { IMultiServiceProvider, JsonRpcRouterConfig } from "./multi";
import { IEvents, IStore } from "./misc";

export abstract class IPendingRequests {
  public abstract pending: JsonRpcRequest[];
  constructor(public chainId: string, public store?: IStore) {}
  public abstract init(): Promise<void>;
  public abstract set(request: JsonRpcRequest): Promise<void>;
  public abstract get(id: number): Promise<JsonRpcRequest | undefined>;
  public abstract delete(id: number): Promise<void>;
}

export abstract class IBlockchainAuthenticator extends IEvents {
  public abstract pending: IPendingRequests;

  constructor(public provider: IBlockchainProvider, store?: IStore) {
    super();
  }

  public abstract init(): Promise<void>;

  public abstract getAccounts(): Promise<string[]>;

  public abstract approve(request: JsonRpcRequest): Promise<JsonRpcResponse>;

  public abstract resolve(request: JsonRpcRequest): Promise<JsonRpcResponse>;
}

export abstract class IBlockchainProvider extends IMultiServiceProvider {
  constructor(public config: JsonRpcRouterConfig, public chainId: string) {
    super(config);
  }
  public abstract getAccounts(): Promise<string[]>;
}
