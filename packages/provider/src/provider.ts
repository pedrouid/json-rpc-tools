import { EventEmitter } from "events";
import { IJsonRpcConnection } from "@json-rpc-tools/utils";

import { HttpConnection } from "./http";
import { WsConnection } from "./ws";
import { isHttpUrl } from "./url";
import LiteJsonRpcProvider from "./lite";

function getDefaultConnection(connection: string | IJsonRpcConnection) {
  return typeof connection === "string"
    ? isHttpUrl(connection)
      ? new HttpConnection(connection)
      : new WsConnection(connection)
    : connection;
}

export class JsonRpcProvider extends LiteJsonRpcProvider {
  public events = new EventEmitter();

  constructor(connection: string | IJsonRpcConnection) {
    super(getDefaultConnection(connection));
  }
}

export default JsonRpcProvider;
