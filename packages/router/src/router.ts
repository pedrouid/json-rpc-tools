import {
  IJsonRpcRouter,
  JsonRpcRouterMap,
  JsonRpcRoutesConfig,
  isValidRoute,
  isValidTrailingWildcardRoute,
  isValidLeadingWildcardRoute,
} from "@json-rpc-tools/utils";

export class JsonRpcRouter implements IJsonRpcRouter {
  public map: JsonRpcRouterMap;

  constructor(public routes: JsonRpcRoutesConfig) {
    this.routes = routes;
    this.map = this.register(routes);
  }

  public isSupported(method: string): boolean {
    const providerId = this.getRouteProviderId(method);
    return typeof providerId !== "undefined";
  }

  public getRouteProviderId(method: string): string | undefined {
    let providerId: string | undefined;
    const matchingRoute = this.map[method];
    if (matchingRoute) {
      providerId = matchingRoute;
    }
    if (typeof providerId === "undefined") {
      this.getTrailingWildcardRoutes().forEach(route => {
        if (method.startsWith(route)) {
          providerId = this.map[route];
        }
      });
    }
    if (typeof providerId === "undefined") {
      this.getLeadingWildcardRoutes().forEach(route => {
        if (method.endsWith(route)) {
          providerId = this.map[route];
        }
      });
    }
    if (typeof providerId === "undefined") {
      const defaultRoute = this.map["*"];
      if (typeof defaultRoute !== "undefined") {
        providerId = this.map[defaultRoute];
      }
    }
    return providerId;
  }

  public getLeadingWildcardRoutes(): string[] {
    return Object.keys(this.map).filter(isValidLeadingWildcardRoute);
  }

  public getTrailingWildcardRoutes(): string[] {
    return Object.keys(this.map).filter(isValidTrailingWildcardRoute);
  }

  public register(routes: JsonRpcRoutesConfig): JsonRpcRouterMap {
    const map: JsonRpcRouterMap = {};
    Object.keys(routes).forEach((provider: string) => {
      const providerRoutes = routes[provider];

      providerRoutes.forEach((route: string) => {
        if (!isValidRoute(route)) {
          throw new Error(`Route is invalid: ${route}`);
        }
        if (typeof map[route] !== "undefined") {
          throw new Error(
            `Route already registred for route ${route} by provider ${map[route]} conflicting with provider ${provider}`,
          );
        }
        map[route] = provider;
      });
    });

    return map;
  }
}

export default JsonRpcRouter;
