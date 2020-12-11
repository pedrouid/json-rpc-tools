import { JsonRpcError, JsonRpcSchemaMap, JsonRpcRequest } from "./jsonrpc";
import { IBaseJsonRpcProvider, IJsonRpcProvider } from "./provider";
import { IJsonRpcRouter, JsonRpcRoutesConfig } from "./router";
import { IJsonRpcValidator } from "./validator";

export interface JsonRpcProvidersMap {
  [providerId: string]: IJsonRpcProvider;
}

export interface BaseMultiServiceProviderConfig {
  providers: JsonRpcProvidersMap;
  routes: JsonRpcRoutesConfig;
}
export interface MultiServiceProviderConfig extends BaseMultiServiceProviderConfig {
  schemas?: JsonRpcSchemaMap;
}

export abstract class IMultiServiceProvider extends IBaseJsonRpcProvider {
  public abstract providers: JsonRpcProvidersMap;
  public abstract router: IJsonRpcRouter;
  public abstract validator: IJsonRpcValidator | undefined;

  constructor(public config: MultiServiceProviderConfig) {
    super();
  }

  public abstract isSupported(method: string): boolean;
  public abstract assertRequest(request: JsonRpcRequest): JsonRpcError | undefined;
  public abstract getProvider(method: string): IJsonRpcProvider;
}
