import { JsonRpcRequest } from "./jsonrpc";
import { IEvents } from "./misc";

export abstract class IJsonRpcProvider extends IEvents {
  //connection
  public abstract connect(params?: any): Promise<void>;
  public abstract disconnect(params?: any): Promise<void>;

  // jsonrpc
  public abstract request(payload: JsonRpcRequest): Promise<any>;
}
