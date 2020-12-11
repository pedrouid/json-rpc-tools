import { IJsonRpcConnection, IJsonRpcProvider } from "@json-rpc-tools/utils";

export abstract class IBlockchainSubprovider extends IJsonRpcProvider {
  constructor(public http: IJsonRpcProvider, connection: string | IJsonRpcConnection) {
    super(connection);
  }
}
