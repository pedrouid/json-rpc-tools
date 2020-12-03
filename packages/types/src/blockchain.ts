import { JsonRpcError, JsonRpcRequest, JsonRpcResponse } from "./jsonrpc";
import { IMultiServiceProvider, MultiServiceProviderConfig } from "./multi";
import { IEvents, IStore } from "./misc";

export abstract class IPendingRequests {
  public chainId: string | undefined;
  public abstract pending: JsonRpcRequest[];
  constructor(public store?: IStore) {}
  public abstract init(chainId?: string): Promise<void>;
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

  public abstract getChainId(): Promise<string>;

  public abstract getAccounts(): Promise<string[]>;

  public abstract approve(request: JsonRpcRequest): Promise<JsonRpcResponse>;

  public abstract reject(request: JsonRpcRequest): Promise<JsonRpcError>;

  public abstract request(request: JsonRpcRequest): Promise<JsonRpcResponse>;
}

export interface BlockchainProviderConfig extends MultiServiceProviderConfig {
  state: {
    chainId: string;
    accounts: string;
  };
}

export abstract class IBlockchainProvider extends IMultiServiceProvider {
  constructor(public config: BlockchainProviderConfig) {
    super(config);
  }
  public abstract getChainId(): Promise<string>;
  public abstract getAccounts(): Promise<string[]>;
}
