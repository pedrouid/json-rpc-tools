import { JsonRpcError, JsonRpcSchemaMap, JsonRpcRequest, JsonRpcResponse } from "./jsonrpc";
import {
  IMultiServiceProvider,
  JsonRpcProvidersMap,
  JsonRpcRoutesConfig,
  MultiServiceProviderMap,
} from "./multi";
import { IEvents, IStore } from "./misc";
import { IJsonRpcProvider } from "./provider";
import { IJsonRpcValidator } from "./validator";

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

export interface BaseBlockchainProviders extends JsonRpcProvidersMap {
  http: IJsonRpcProvider;
  signer: IJsonRpcProvider;
}

export interface BlockchainProvidersWithWebsockets extends BaseBlockchainProviders {
  ws: IJsonRpcProvider;
}

export type BlockchainProviders = BaseBlockchainProviders | BlockchainProvidersWithWebsockets;
export interface BaseBlockchainRoutes extends JsonRpcRoutesConfig {
  http: string[];
  signer: string[];
}

export interface BlockchainRoutesWithWebsockets extends BaseBlockchainRoutes {
  ws: string[];
}

export type BlockchainRoutes = BaseBlockchainRoutes | BlockchainRoutesWithWebsockets;

export interface BlockchainJsonRpcConfig {
  routes: BlockchainRoutes;
  state: {
    chainId: string;
    accounts: string;
  };
  schemas?: JsonRpcSchemaMap;
}

export interface BlockchainProviderConfig extends BlockchainJsonRpcConfig {
  providers: BlockchainProviders;
}

export abstract class IBlockchainProvider extends IMultiServiceProvider {
  public abstract map: MultiServiceProviderMap;
  public abstract providers: BlockchainProviders;
  public abstract routes: BlockchainRoutes;
  public abstract validator: IJsonRpcValidator | undefined;

  constructor(public config: BlockchainProviderConfig) {
    super(config);
  }

  public abstract getChainId(): Promise<string>;

  public abstract getAccounts(): Promise<string[]>;
}
