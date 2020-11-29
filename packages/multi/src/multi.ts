import { EventEmitter } from "events";
import { IMultiServiceProvider, JsonRpcRequest, JsonRpcRouterConfig } from "@json-rpc-tools/utils";

import { JsonRpcRouter } from "./router";

export class MultiServiceProvider implements IMultiServiceProvider {
  public events = new EventEmitter();

  public router: JsonRpcRouter;

  constructor(public config: JsonRpcRouterConfig) {
    this.router = new JsonRpcRouter(config);
  }

  public async connect(): Promise<void> {
    await Promise.all(
      Object.keys(this.router.config.providers).map(async (provider: string) => {
        await this.router.config.providers[provider].connect();
      }),
    );
  }

  public async disconnect(): Promise<void> {
    await Promise.all(
      Object.keys(this.router.config.providers).map(async (provider: string) => {
        await this.router.config.providers[provider].disconnect();
      }),
    );
  }

  public on(event: string, listener: any): void {
    Object.keys(this.router.config.providers).forEach((provider: string) => {
      this.router.config.providers[provider].on(event, listener);
    });
  }

  public once(event: string, listener: any): void {
    Object.keys(this.router.config.providers).forEach((provider: string) => {
      this.router.config.providers[provider].once(event, listener);
    });
  }

  public off(event: string, listener: any): void {
    Object.keys(this.router.config.providers).forEach((provider: string) => {
      this.router.config.providers[provider].off(event, listener);
    });
  }

  public async request<Result = any, Params = any>(
    request: JsonRpcRequest<Params>,
  ): Promise<Result> {
    return this.router.request(request);
  }
}

export default MultiServiceProvider;
