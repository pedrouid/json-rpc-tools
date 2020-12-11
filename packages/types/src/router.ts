export interface JsonRpcRoutesConfig {
  [providerId: string]: string[];
}
export interface JsonRpcRouterMap {
  [route: string]: string;
}

export abstract class IJsonRpcRouter {
  public abstract map: JsonRpcRouterMap;

  constructor(public routes: JsonRpcRoutesConfig) {}

  public abstract isSupported(method: string): boolean;

  public abstract getRouteProviderId(method: string): string | undefined;

  public abstract getLeadingWildcardRoutes(): string[];

  public abstract getTrailingWildcardRoutes(): string[];

  public abstract register(routes: JsonRpcRoutesConfig): JsonRpcRouterMap;
}
