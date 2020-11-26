import axios, { AxiosInstance } from "axios";
import { EventEmitter } from "events";
import {
  IJsonRpcProvider,
  JsonRpcRequest,
  JsonRpcResponse,
  isJsonRpcError,
} from "@json-rpc-tools/utils";

export class JsonRpcProvider implements IJsonRpcProvider {
  public events = new EventEmitter();

  private api: AxiosInstance;

  constructor(public url: string) {
    this.url = url;
    this.api = axios.create({
      baseURL: this.url,
      timeout: 30000, // 30 secs
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });
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

  public async connect(params?: any): Promise<void> {
    // empty
  }

  public async disconnect(params?: any): Promise<void> {
    // empty
  }

  public async request(payload: JsonRpcRequest): Promise<any> {
    const res = await this.api.post("/", payload);
    const response = res.data as JsonRpcResponse;
    if (isJsonRpcError(response)) {
      throw new Error(response.error.message);
    }
    return response.result;
  }
}
