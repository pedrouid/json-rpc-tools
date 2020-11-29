import { JsonRpcPayload, JsonRpcRequest } from "./jsonrpc";
import { IEvents } from "./misc";

export abstract class IJsonRpcConnection extends IEvents {
  public abstract connected: boolean;
  constructor(opts?: any) {
    super();
  }
  public abstract open(opts?: any): Promise<void>;
  public abstract close(): Promise<void>;
  public abstract send(payload: JsonRpcPayload): Promise<void>;
}

export abstract class IBaseJsonRpcProvider extends IEvents {
  constructor() {
    super();
  }

  public abstract connect(params?: any): Promise<void>;

  public abstract disconnect(): Promise<void>;

  public abstract request<Result = any, Params = any>(
    request: JsonRpcRequest<Params>,
  ): Promise<Result>;
}

export abstract class IJsonRpcProvider extends IBaseJsonRpcProvider {
  public abstract connection: IJsonRpcConnection;

  constructor(connection: string | IJsonRpcConnection) {
    super();
  }

  public abstract connect(connection?: string | IJsonRpcConnection): Promise<void>;
}
