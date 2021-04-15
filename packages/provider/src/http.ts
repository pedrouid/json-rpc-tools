import { EventEmitter } from "events";
import axios, { AxiosInstance } from "axios";
import { formatJsonRpcError, IJsonRpcConnection, JsonRpcPayload } from "@json-rpc-tools/utils";
import { safeJsonParse } from "safe-json-utils";

import { isHttpUrl } from "./url";

export class HttpConnection implements IJsonRpcConnection {
  public events = new EventEmitter();

  private api: AxiosInstance | undefined;

  private registering = false;

  constructor(public url: string) {
    if (!isHttpUrl(url)) {
      throw new Error(`Provided URL is not compatible with HTTP connection: ${url}`);
    }
    this.url = url;
  }

  get connected(): boolean {
    return typeof this.api !== "undefined";
  }

  get connecting(): boolean {
    return this.registering;
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

  public removeListener(event: string, listener: any): void {
    this.events.removeListener(event, listener);
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
      .catch(err => this.onError(payload.id, err));
  }

  // ---------- Private ----------------------------------------------- //

  private async register(url = this.url): Promise<AxiosInstance> {
    if (!isHttpUrl(url)) {
      throw new Error(`Provided URL is not compatible with HTTP connection: ${url}`);
    }
    if (this.registering) {
      return new Promise((resolve, reject) => {
        this.events.once("open", () => {
          if (typeof this.api === "undefined") {
            return reject(new Error("HTTP connection is missing or invalid"));
          }
          resolve(this.api);
        });
      });
    }
    this.url = url;
    this.registering = true;
    const api = axios.create({
      baseURL: url,
      timeout: 30_000, // 30 secs
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
    this.registering = false;
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

  private onError(id: number, e: Error) {
    const message = e.message || e.toString();
    const payload = formatJsonRpcError(id, message);
    this.events.emit("payload", payload);
  }
}
