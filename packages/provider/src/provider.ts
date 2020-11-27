import { EventEmitter } from "events";
import {
  IJsonRpcProvider,
  IJsonRpcConnection,
  JsonRpcRequest,
  JsonRpcResult,
  JsonRpcPayload,
  JsonRpcProviderMessage,
  isJsonRpcResponse,
} from "@json-rpc-tools/utils";

import { HttpConnection } from "./http";
import { WsConnection } from "./ws";
import { isHttpUrl } from "./url";

export class JsonRpcProvider implements IJsonRpcProvider {
  public events = new EventEmitter();

  public connection: IJsonRpcConnection;

  constructor(public url: string) {
    this.url = url;
    this.connection = this.setConnection(url);
  }

  public async connect(url = this.url): Promise<void> {
    await this.open(url);
  }

  public async disconnect(): Promise<void> {
    await this.close();
  }

  public on(event: string, listener: any): void {
    this.events.on(event, listener);
  }

  public once(event: string, listener: any): void {
    this.events.once(event, listener);
  }

  public off(event: string, listener: any): void {
    this.events.off(event, listener);
  }

  public async request<Result = any, Params = any>(
    request: JsonRpcRequest<Params>,
  ): Promise<Result> {
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

  // ---------- Private ----------------------------------------------- //

  private setConnection(url: string): IJsonRpcConnection {
    return isHttpUrl(url) ? new HttpConnection(url) : new WsConnection(url);
  }

  private onPayload(payload: JsonRpcPayload): void {
    this.events.emit("payload", payload);
    if (isJsonRpcResponse(payload)) {
      this.events.emit(`${payload.id}`, payload);
    } else {
      this.events.emit("message", {
        type: payload.method,
        data: payload.params,
      } as JsonRpcProviderMessage);
    }
  }

  private async open(url = this.url) {
    if (this.url === url && this.connection.connected) return;
    if (this.connection.connected) this.close();
    this.url = url;
    this.connection = this.setConnection(url);
    await this.connection.open(url);
    this.connection.on("payload", (payload: JsonRpcPayload) => this.onPayload(payload));
    this.connection.on("close", () => this.events.emit("disconnect"));
    this.events.emit("connect");
  }

  private async close() {
    await this.connection.close();
    this.events.emit("disconnect");
  }
}

export default JsonRpcProvider;
