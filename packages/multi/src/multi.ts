import { EventEmitter } from "events";
import difference from "lodash.difference";
import {
  formatJsonRpcError,
  IJsonRpcProvider,
  IJsonRpcValidator,
  IMultiServiceProvider,
  INVALID_REQUEST,
  JsonRpcError,
  JsonRpcProvidersMap,
  JsonRpcRequest,
  JsonRpcRoutesConfig,
  METHOD_NOT_FOUND,
  MultiServiceProviderConfig,
  MultiServiceProviderMap,
  isValidRoute,
  isValidTrailingWildcardRoute,
  isValidLeadingWildcardRoute,
} from "@json-rpc-tools/utils";
import { JsonRpcValidator } from "@json-rpc-tools/validator";

export class MultiServiceProvider implements IMultiServiceProvider {
  public events = new EventEmitter();

  public map: MultiServiceProviderMap;
  public providers: JsonRpcProvidersMap;
  public routes: JsonRpcRoutesConfig;
  public validator: IJsonRpcValidator | undefined;

  constructor(public config: MultiServiceProviderConfig) {
    this.config = config;
    this.map = this.register(config);
    this.providers = config.providers;
    this.routes = config.routes;
    this.validator =
      typeof config.schemas !== "undefined" ? new JsonRpcValidator(config.schemas) : undefined;
  }

  public async connect(): Promise<void> {
    await Promise.all(
      Object.keys(this.providers).map(async (provider: string) => {
        await this.providers[provider].connect();
      }),
    );
  }

  public async disconnect(): Promise<void> {
    await Promise.all(
      Object.keys(this.providers).map(async (provider: string) => {
        await this.providers[provider].disconnect();
      }),
    );
  }

  public on(event: string, listener: any): void {
    Object.keys(this.providers).forEach((provider: string) => {
      this.providers[provider].on(event, listener);
    });
  }

  public once(event: string, listener: any): void {
    Object.keys(this.providers).forEach((providerId: string) => {
      this.providers[providerId].once(event, listener);
    });
  }

  public off(event: string, listener: any): void {
    Object.keys(this.providers).forEach((providerId: string) => {
      this.providers[providerId].off(event, listener);
    });
  }

  public isSupported(method: string): boolean {
    const providerId = this.getRouteProviderId(method);
    return typeof providerId !== "undefined";
  }

  public getProvider(method: string): IJsonRpcProvider {
    const providerId = this.getRouteProviderId(method);
    if (typeof providerId === "undefined") {
      throw new Error(`No provider route defined for method: ${method}`);
    }
    return this.providers[providerId];
  }

  public assertRequest(request: JsonRpcRequest): JsonRpcError | undefined {
    if (!this.isSupported(request.method)) {
      return formatJsonRpcError(request.id, METHOD_NOT_FOUND);
    }
    if (
      typeof this.validator !== "undefined" &&
      typeof this.validator.isSupported(request.method)
    ) {
      if (!this.validator.validate(request)) {
        return formatJsonRpcError(request.id, INVALID_REQUEST);
      }
    }

    return;
  }

  public async request<Result = any, Params = any>(
    request: JsonRpcRequest<Params>,
  ): Promise<Result> {
    const response = this.assertRequest(request);
    if (typeof response !== "undefined") {
      throw new Error(response.error.message);
    }
    const provider = this.getProvider(request.method);
    return provider.request(request);
  }

  // -- Private ----------------------------------------------- //

  private getRouteProviderId(method: string): string | undefined {
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

  private getLeadingWildcardRoutes(): string[] {
    return Object.keys(this.map).filter(isValidLeadingWildcardRoute);
  }

  private getTrailingWildcardRoutes(): string[] {
    return Object.keys(this.map).filter(isValidTrailingWildcardRoute);
  }

  private register(config: MultiServiceProviderConfig): MultiServiceProviderMap {
    const routesDiff = difference(Object.keys(config.providers), Object.keys(config.routes));
    if (routesDiff.length) {
      throw new Error(`Providers are configured for missing routes: ${routesDiff.toString()}`);
    }
    const providersDiff = difference(Object.keys(config.routes), Object.keys(config.providers));
    if (providersDiff.length) {
      throw new Error(`Routes are configured for missing providers: ${providersDiff.toString()}`);
    }
    const map: MultiServiceProviderMap = {};
    Object.keys(config.routes).forEach((provider: string) => {
      const routes = config.routes[provider];

      routes.forEach((route: string) => {
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

export default MultiServiceProvider;
