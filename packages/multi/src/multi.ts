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
      typeof config.methods !== "undefined" ? new JsonRpcValidator(config.methods) : undefined;
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
    Object.keys(this.providers).forEach((provider: string) => {
      this.providers[provider].once(event, listener);
    });
  }

  public off(event: string, listener: any): void {
    Object.keys(this.providers).forEach((provider: string) => {
      this.providers[provider].off(event, listener);
    });
  }

  public isSupported(method: string): boolean {
    return Object.keys(this.map).includes(method);
  }

  public getProvider(method: string): IJsonRpcProvider {
    return this.providers[this.map[method]];
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
    return this.getProvider(request.method).request(request);
  }

  // -- Private ----------------------------------------------- //

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

      routes.forEach((method: string) => {
        if (typeof map[method] !== "undefined") {
          throw new Error(
            `Route already registred for method ${method} by provider ${map[method]} conflicting with provider ${provider}`,
          );
        }
        map[method] = provider;
      });
    });

    return map;
  }
}

export default MultiServiceProvider;
