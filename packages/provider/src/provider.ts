import { EventEmitter } from "events";
import {
  RequestArguments,
  IJsonRpcProvider,
  IJsonRpcConnection,
  JsonRpcRequest,
  JsonRpcResult,
  JsonRpcPayload,
  JsonRpcProviderMessage,
  isJsonRpcResponse,
  formatJsonRpcRequest,
} from "@json-rpc-tools/utils";

import { HttpConnection } from "./http";
import { WsConnection } from "./ws";
import { isHttpUrl } from "./url";

export class JsonRpcProvider extends IJsonRpcProvider {
  public events = new EventEmitter();

  public connection: IJsonRpcConnection;

  constructor(connection: string | IJsonRpcConnection) {
    super(connection);
    this.connection = this.setConnection(connection);
  }

  public async connect(connection: string | IJsonRpcConnection = this.connection): Promise<void> {
    await this.open(connection);
  }

  public async disconnect(): Promise<void> {
    await this.close();
  }

  public on(event: string, listener: any): void {
    this.events.on(event, listener);
    this.connection.on(event, listener);
  }

  public once(event: string, listener: any): void {
    this.events.once(event, listener);
    this.connection.once(event, listener);
  }

  public off(event: string, listener: any): void {
    this.events.off(event, listener);
    this.connection.off(event, listener);
  }

  public removeListener(event: string, listener: any): void {
    this.events.removeListener(event, listener);
    this.connection.removeListener(event, listener);
  }

  public async request<Result = any, Params = any>(
    request: RequestArguments<Params>,
  ): Promise<Result> {
    return this.requestStrict(formatJsonRpcRequest(request.method, request.params || []));
  }

  // ---------- Protected ----------------------------------------------- //

  protected async requestStrict<Result = any, Params = any>(
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

  protected setConnection(connection: string | IJsonRpcConnection = this.connection) {
    return typeof connection === "string"
      ? isHttpUrl(connection)
        ? new HttpConnection(connection)
        : new WsConnection(connection)
      : connection;
  }

  protected onPayload(payload: JsonRpcPayload): void {
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

  protected async open(connection: string | IJsonRpcConnection = this.connection) {
    if (this.connection === connection && this.connection.connected) return;
    if (this.connection.connected) this.close();
    this.connection = this.setConnection();
    await this.connection.open();
    this.connection.on("payload", (payload: JsonRpcPayload) => this.onPayload(payload));
    this.connection.on("close", () => this.events.emit("disconnect"));
    this.connection.on("error", () => this.events.emit("error"));
    this.events.emit("connect");
  }

  protected async close() {
    await this.connection.close();
    this.events.emit("disconnect");
  }
}

export default JsonRpcProvider;
