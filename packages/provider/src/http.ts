import { EventEmitter } from "events";
import axios, { AxiosInstance } from "axios";
import { IJsonRpcConnection, JsonRpcPayload } from "@json-rpc-tools/utils";
import { safeJsonParse } from "safe-json-utils";

import { isHttpUrl } from "./url";

export class HttpConnection implements IJsonRpcConnection {
  public events = new EventEmitter();

  private api: AxiosInstance | undefined;

  constructor(public url: string) {
    if (!isHttpUrl(url)) {
      throw new Error(`Provided URL is not compatible with HTTP connection: ${url}`);
    }
    this.url = url;
  }

  get connected(): boolean {
    return typeof this.api !== "undefined";
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

  public async open(url: string = this.url): Promise<void> {
    this.api = await this.register(url);
  }

  public async close(): Promise<void> {
    this.onClose();
  }

  public async send(payload: JsonRpcPayload): Promise<void> {
    if (typeof this.api === "undefined") {
      this.api = await this.register();
    }
    this.api
      .post("/", payload)
      .then(res => this.onPayload(res))
      .catch(event => this.events.emit("error", event));
  }

  // ---------- Private ----------------------------------------------- //

  private async register(url = this.url): Promise<AxiosInstance> {
    if (!isHttpUrl(url)) {
      throw new Error(`Provided URL is not compatible with HTTP connection: ${url}`);
    }
    this.url = url;
    const api = axios.create({
      baseURL: url,
      timeout: 30000, // 30 secs
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });
    this.onOpen(api);
    return api;
  }

  private onOpen(api: AxiosInstance) {
    this.api = api;
    this.events.emit("open");
  }

  private onClose() {
    this.api = undefined;
    this.events.emit("close");
  }

  private onPayload(e: { data: any }) {
    if (typeof e.data === "undefined") return;
    const payload: JsonRpcPayload = typeof e.data === "string" ? safeJsonParse(e.data) : e.data;
    this.events.emit("payload", payload);
  }
}
