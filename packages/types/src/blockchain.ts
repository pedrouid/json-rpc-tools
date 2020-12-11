import {
  JsonRpcError,
  JsonRpcRequest,
  JsonRpcResponse,
  JsonRpcSchemaMap,
  JsonRpcSchemas,
} from "./jsonrpc";
import { IEvents, IStore } from "./misc";
import { IJsonRpcConnection, IJsonRpcProvider } from "./provider";
import { IJsonRpcRouter, JsonRpcRoutesConfig } from "./router";
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

export interface BlockchainAuthenticatorConfig {
  provider: IBlockchainProvider;
  requiredApproval: string[];
  store?: IStore;
}

export abstract class IBlockchainAuthenticator extends IEvents {
  public abstract chainId: string;

  public abstract pending: IPendingRequests;
  public abstract provider: IBlockchainProvider;

  constructor(public config: BlockchainAuthenticatorConfig) {
    super();
  }

  public abstract init(): Promise<void>;

  public abstract approve(request: JsonRpcRequest): Promise<JsonRpcResponse>;

  public abstract reject(request: JsonRpcRequest): Promise<JsonRpcError>;

  public abstract resolve(request: JsonRpcRequest): Promise<JsonRpcResponse>;
}

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
  schemas?: JsonRpcSchemaMap;
}

export interface BlockchainSubproviderConfig {
  connection: string | IJsonRpcConnection;
  routes: string[];
}
export interface BlockchainProviderConfig {
  chainId: string;
  routes: string[];
  signer?: BlockchainSubproviderConfig;
  subscriber?: BlockchainSubproviderConfig;
  validator?: JsonRpcSchemas;
}

export abstract class IBlockchainProvider extends IJsonRpcProvider {
  public abstract chainId: string;
  public abstract config: BlockchainProviderConfig;
  public abstract router: IJsonRpcRouter;
  public abstract signer: IJsonRpcProvider | undefined;
  public abstract subscriber: IJsonRpcProvider | undefined;
  public abstract validator: IJsonRpcValidator | undefined;

  constructor(connection: string | IJsonRpcConnection, config: BlockchainProviderConfig) {
    super(connection);
  }

  public abstract isSupported(method: string): boolean;
  public abstract assertRequest(request: JsonRpcRequest): JsonRpcError | undefined;
}
