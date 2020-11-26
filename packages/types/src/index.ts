import { EventEmitter } from "events";

export interface JsonRpcRequest<T = any> {
  id: number;
  jsonrpc: string;
  method: string;
  params: T;
}

export interface JsonRpcResult<T = any> {
  id: number;
  jsonrpc: string;
  result: T;
}

export interface JsonRpcError {
  id: number;
  jsonrpc: string;
  error: ErrorResponse;
}

export interface ErrorResponse {
  code: number;
  message: string;
}

export type JsonRpcResponse<T = any> = JsonRpcResult<T> | JsonRpcError;

export type JsonRpcPayload<P = any, R = any> =
  | JsonRpcRequest<P>
  | JsonRpcResponse<R>;

export abstract class IEvents {
  public abstract events: EventEmitter;

  // events
  public abstract on(event: string, listener: any): void;
  public abstract once(event: string, listener: any): void;
  public abstract off(event: string, listener: any): void;
}

export abstract class IJsonRpcProvider extends IEvents {
  //connection
  public abstract connect(params?: any): Promise<void>;
  public abstract disconnect(params?: any): Promise<void>;

  // jsonrpc
  public abstract request(payload: JsonRpcRequest): Promise<any>;
}
