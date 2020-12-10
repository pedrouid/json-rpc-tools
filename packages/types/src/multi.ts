import { JsonRpcError, JsonRpcSchemaMap, JsonRpcRequest } from "./jsonrpc";
import { IBaseJsonRpcProvider, IJsonRpcProvider } from "./provider";
import { IJsonRpcValidator } from "./validator";

export interface JsonRpcProvidersMap {
  [providerId: string]: IJsonRpcProvider;
}

export interface JsonRpcRoutesConfig {
  [providerId: string]: string[];
}

export interface BaseMultiServiceProviderConfig {
  providers: JsonRpcProvidersMap;
  routes: JsonRpcRoutesConfig;
}
export interface MultiServiceProviderConfig extends BaseMultiServiceProviderConfig {
  schemas?: JsonRpcSchemaMap;
}

export type MultiServiceProviderMap = {
  [route: string]: string;
};

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
