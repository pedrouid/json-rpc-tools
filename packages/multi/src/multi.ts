import { EventEmitter } from "events";
import difference from "lodash.difference";
import {
  formatJsonRpcError,
  IJsonRpcProvider,
  IMultiServiceProvider,
  INVALID_REQUEST,
  JsonRpcError,
  JsonRpcProvidersMap,
  JsonRpcRequest,
  METHOD_NOT_FOUND,
  MultiServiceProviderConfig,
} from "@json-rpc-tools/utils";
import JsonRpcValidator from "@json-rpc-tools/validator";
import JsonRpcRouter from "@json-rpc-tools/router";
export class MultiServiceProvider implements IMultiServiceProvider {
  public events = new EventEmitter();

  public providers: JsonRpcProvidersMap;
  public router: JsonRpcRouter;
  public validator: JsonRpcValidator | undefined;

  constructor(public config: MultiServiceProviderConfig) {
    this.config = config;
    const routesDiff = difference(Object.keys(config.providers), Object.keys(config.routes));
    if (routesDiff.length) {
      throw new Error(`Providers are configured for missing routes: ${routesDiff.toString()}`);
    }
    const providersDiff = difference(Object.keys(config.routes), Object.keys(config.providers));
    if (providersDiff.length) {
      throw new Error(`Routes are configured for missing providers: ${providersDiff.toString()}`);
    }
    this.providers = config.providers;
    this.router = new JsonRpcRouter(config.routes);
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
    Object.keys(this.providers).forEach((target: string) => {
      this.providers[target].once(event, listener);
    });
  }

  public off(event: string, listener: any): void {
    Object.keys(this.providers).forEach((target: string) => {
      this.providers[target].off(event, listener);
    });
  }

  public removeListener(event: string, listener: any): void {
    Object.keys(this.providers).forEach((target: string) => {
      this.providers[target].removeListener(event, listener);
    });
  }

  public isSupported(method: string): boolean {
    return this.router.isSupported(method);
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

  public getProvider(method: string): IJsonRpcProvider {
    const target = this.router.getRouteTarget(method);
    if (typeof target === "undefined") {
      throw new Error(`No provider route defined for method: ${method}`);
    }
    return this.providers[target];
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
}

export default MultiServiceProvider;
