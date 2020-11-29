import { IEvents, JsonRpcRequest, JsonRpcResponse } from "@json-rpc-tools/utils";

export interface KeyPair {
  privateKey: string;
  publicKey: string;
}

export abstract class ISigner {
  public abstract account: string;

  constructor(private keyPair: KeyPair) {}

  public abstract sign(message: string): Promise<string>;
}

export abstract class ISignerMiddleware extends IEvents {
  public abstract before(request: JsonRpcRequest): Promise<string>;
  public abstract after(signature: string): Promise<JsonRpcResponse>;
}
