import { EventEmitter } from "events";
import JsonRpcProvider from "@json-rpc-tools/provider";
import JsonRpcRouter from "@json-rpc-tools/router";
import JsonRpcValidator from "@json-rpc-tools/validator";
import {
  IBlockchainProvider,
  BlockchainProviderConfig,
  IJsonRpcValidator,
  IJsonRpcProvider,
  IJsonRpcConnection,
  JsonRpcRequest,
  JsonRpcResult,
  JsonRpcRoutesConfig,
  IJsonRpcRouter,
  JsonRpcError,
  METHOD_NOT_FOUND,
  formatJsonRpcError,
  INVALID_REQUEST,
} from "@json-rpc-tools/utils";

function getRoutes(config: BlockchainProviderConfig) {
  const routes: JsonRpcRoutesConfig = {
    default: config.routes,
  };
  if (typeof config.signer !== "undefined") {
    routes.signer = config.signer.routes;
  }
  if (typeof config.subscriber !== "undefined") {
    routes.subscriber = config.subscriber.routes;
  }
  return routes;
}
export class BlockchainProvider extends JsonRpcProvider implements IBlockchainProvider {
  public events = new EventEmitter();

  public connection: IJsonRpcConnection;

  public chainId: string;
  public config: BlockchainProviderConfig;
  public router: IJsonRpcRouter;
  public signer: IJsonRpcProvider | undefined;
  public subscriber: IJsonRpcProvider | undefined;
  public validator: IJsonRpcValidator | undefined;

  constructor(connection: string | IJsonRpcConnection, config: BlockchainProviderConfig) {
    super(connection);
    this.connection = this.setConnection(connection);
    this.chainId = config.chainId;
    this.config = config;
    this.router = new JsonRpcRouter(getRoutes(config));
    if (typeof config.signer !== "undefined") {
      this.signer = new JsonRpcProvider(config.signer.connection);
    }
    if (typeof config.subscriber !== "undefined") {
      this.subscriber = new JsonRpcProvider(config.subscriber.connection);
    }
    if (typeof config.validator !== "undefined") {
      this.validator = new JsonRpcValidator(config.validator.schemas);
    }
  }

  public async connect(connection: string | IJsonRpcConnection = this.connection): Promise<void> {
    await this.open(connection);
  }

  public async disconnect(): Promise<void> {
    await this.close();
  }

  public on(event: string, listener: any): void {
    if (event === "message") {
      if (typeof this.subscriber === "undefined") {
        throw new Error("Cannot subscribe to messages without configuring Subscriber provider");
      }
      this.subscriber.events.on(event, listener);
    }
    this.events.on(event, listener);
  }

  public once(event: string, listener: any): void {
    if (event === "message") {
      if (typeof this.subscriber === "undefined") {
        throw new Error("Cannot subscribe to messages without configuring Subscriber provider");
      }
      this.subscriber.events.once(event, listener);
    }
    this.events.once(event, listener);
  }

  public off(event: string, listener: any): void {
    this.events.off(event, listener);
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

  public async request<Result = any, Params = any>(
    request: JsonRpcRequest<Params>,
  ): Promise<Result> {
    const response = this.assertRequest(request);
    if (typeof response !== "undefined") {
      throw new Error(response.error.message);
    }
    const target = this.getRouteTarget(request.method);
    if (target !== "default") {
      return this.requestSubprovider(target, request);
    }
    return new Promise(async (resolve, reject) => {
      if (!this.connection.connected) {
        await this.open();
      }
      this.events.on(`${request.id}`, response => {
        if (response.error) {
          reject(response.error.message);
        } else {
          const { result } = response as JsonRpcResult<Result>;
          resolve(result);
        }
      });

      await this.connection.send(request);
    });
  }

  // -- Private ----------------------------------------------- //

  private getRouteTarget(method: string): string {
    const target = this.router.getRouteTarget(method);
    if (typeof target === "undefined") {
      throw new Error(`Provider does not support method: ${method}`);
    }
    return target;
  }

  private async requestSubprovider<Result = any, Params = any>(
    target: string,
    request: JsonRpcRequest<Params>,
  ): Promise<Result> {
    const provider = this[target] as JsonRpcProvider | undefined;
    if (typeof provider === "undefined") {
      throw new Error(`Missing provider ${target} for request with method: ${request.method}`);
    }
    return provider.request<Result, Params>(request);
  }
}
