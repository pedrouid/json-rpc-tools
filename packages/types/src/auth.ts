import { JsonRpcConfig, JsonRpcRequest, JsonRpcResponse } from "./jsonrpc";
import { IEvents, IStore } from "./misc";
import { IJsonRpcProvider } from "./provider";

export abstract class IPendingRequests {
  public abstract pending: JsonRpcRequest[];
  constructor(public context: string, public store?: IStore) {}
  public abstract init(): Promise<void>;
  public abstract set(request: JsonRpcRequest): Promise<void>;
  public abstract get(id: number): Promise<JsonRpcRequest | undefined>;
  public abstract delete(id: number): Promise<void>;
}

export abstract class IJsonRpcAuthenticator extends IEvents {
  public abstract pending: IPendingRequests;

  constructor(public config: JsonRpcConfig, public provider: IJsonRpcProvider, store?: IStore) {
    super();
  }

  public abstract init(): Promise<void>;

  public abstract getAccounts(): Promise<string[]>;

  public abstract supportsMethod(request: JsonRpcRequest): boolean;

  public abstract requiresApproval(request: JsonRpcRequest): boolean;

  public abstract validateRequest(request: JsonRpcRequest): boolean;

  public abstract approve(request: JsonRpcRequest): Promise<JsonRpcResponse>;

  public abstract resolve(request: JsonRpcRequest): Promise<JsonRpcResponse>;
}
