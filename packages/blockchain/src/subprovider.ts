import JsonRpcProvider from "@json-rpc-tools/provider";
import {
  IJsonRpcConnection,
  IJsonRpcProvider,
  isJsonRpcResponse,
  JsonRpcPayload,
  JsonRpcProviderMessage,
} from "@json-rpc-tools/utils";

import { IBlockchainSubprovider } from "./types";

export class BlockchainSubprovider extends JsonRpcProvider implements IBlockchainSubprovider {
  constructor(public http: IJsonRpcProvider, connection: string | IJsonRpcConnection) {
    super(connection);
  }

  // ---------- Protected ----------------------------------------------- //

  protected onPayload(payload: JsonRpcPayload): void {
    this.events.emit("payload", payload);
    if (isJsonRpcResponse(payload)) {
      this.events.emit(`${payload.id}`, payload);
    } else {
      // IMPORTANT: Messages are emitted on the parent provider instead
      this.http.events.emit("message", {
        type: payload.method,
        data: payload.params,
      } as JsonRpcProviderMessage);
    }
  }
}
