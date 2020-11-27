import { JsonRpcPayload, JsonRpcRequest } from "./jsonrpc";
import { IEvents } from "./misc";

export abstract class IJsonRpcConnection extends IEvents {
  public abstract connected: boolean;
  constructor(public url: string) {
    super();
  }
  public abstract open(url?: string): Promise<void>;
  public abstract close(): Promise<void>;
  public abstract send(payload: JsonRpcPayload): Promise<void>;
}

export abstract class IJsonRpcProvider extends IEvents {
  public abstract connection: IJsonRpcConnection;

  constructor(public url: string) {
    super();
  }

  public abstract connect(url?: string): Promise<void>;

  public abstract disconnect(): Promise<void>;

  public abstract request<Result = any, Params = any>(
    payload: JsonRpcRequest<Params>,
  ): Promise<Result>;
}
