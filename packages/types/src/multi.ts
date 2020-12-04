import { JsonRpcError, JsonRpcMethodsMap, JsonRpcRequest } from "./jsonrpc";
import { IBaseJsonRpcProvider, IJsonRpcProvider } from "./provider";
import { IJsonRpcValidator } from "./validator";

export interface JsonRpcProvidersMap {
  [name: string]: IJsonRpcProvider;
}

export interface JsonRpcRoutesConfig {
  [provider: string]: string[];
}

export interface BaseMultiServiceProviderConfig {
  providers: JsonRpcProvidersMap;
  routes: JsonRpcRoutesConfig;
}
export interface MultiServiceProviderConfig extends BaseMultiServiceProviderConfig {
  schemas?: JsonRpcMethodsMap;
}

export type MultiServiceProviderMap = Record<string, string>;

export abstract class IMultiServiceProvider extends IBaseJsonRpcProvider {
  public abstract map: MultiServiceProviderMap;
  public abstract providers: JsonRpcProvidersMap;
  public abstract routes: JsonRpcRoutesConfig;
  public abstract validator: IJsonRpcValidator | undefined;

  constructor(public config: MultiServiceProviderConfig) {
    super();
  }

  public abstract isSupported(method: string): boolean;
  public abstract getProvider(method: string): IJsonRpcProvider;
  public abstract assertRequest(request: JsonRpcRequest): JsonRpcError | undefined;
}
