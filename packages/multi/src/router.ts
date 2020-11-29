import difference from "lodash.difference";
import JsonRpcValidator from "@json-rpc-tools/validator";
import { IJsonRpcProvider, JsonRpcRequest, JsonRpcRouterConfig } from "@json-rpc-tools/utils";

export class JsonRpcRouter extends JsonRpcValidator {
  public map: Record<string, string>;

  constructor(public config: JsonRpcRouterConfig) {
    super(config);
    this.config = config;
    this.map = this.register(config);
  }

  public getProviderByMethod(method: string): IJsonRpcProvider {
    return this.config.providers[this.map[method]];
  }

  public request<Result = any, Params = any>(request: JsonRpcRequest<Params>): Promise<Result> {
    return this.getProviderByMethod(request.method).request(request);
  }

  // -- Private ----------------------------------------------- //

  private register(config: JsonRpcRouterConfig): Record<string, string> {
    const routesDiff = difference(Object.keys(config.providers), Object.keys(config.routes));
    if (routesDiff.length) {
      throw new Error(`Providers are configured for missing routes: ${routesDiff.toString()}`);
    }
    const providersDiff = difference(Object.keys(config.routes), Object.keys(config.providers));
    if (providersDiff.length) {
      throw new Error(`Routes are configured for missing providers: ${providersDiff.toString()}`);
    }
    const map: Record<string, string> = {};
    Object.keys(config.routes).forEach((provider: string) => {
      const routes = config.routes[provider];
      const methodsDiff = difference(config.routes[provider], Object.keys(config.methods));
      if (methodsDiff.length) {
        throw new Error(
          `Provider ${provider} is configured for missing methods: ${methodsDiff.toString()}`,
        );
      }
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
