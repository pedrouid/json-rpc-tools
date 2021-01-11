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
    const target = this.getRouteTarget(method);
    return typeof target !== "undefined";
  }

  public getRouteTarget(method: string): string | undefined {
    let target: string | undefined;
    const matchingRoute = this.map[method];
    if (matchingRoute) {
      target = matchingRoute;
    }
    if (typeof target === "undefined") {
      this.getTrailingWildcardRoutes().forEach(route => {
        if (method.startsWith(route.replace("*", ""))) {
          target = this.map[route];
        }
      });
    }
    if (typeof target === "undefined") {
      this.getLeadingWildcardRoutes().forEach(route => {
        if (method.endsWith(route.replace("*", ""))) {
          target = this.map[route];
        }
      });
    }
    if (typeof target === "undefined") {
      const defaultRoute = this.map["*"];
      if (typeof defaultRoute !== "undefined") {
        target = this.map[defaultRoute];
      }
    }
    return target;
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
