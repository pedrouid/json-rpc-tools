import MultiServiceProvider from "@json-rpc-tools/multi";
import { JsonRpcRouterConfig } from "@json-rpc-tools/utils";

import { SignerConnection } from "./signer";

export class BlockchainProvider extends MultiServiceProvider {
  constructor(public config: JsonRpcRouterConfig, public chainId: string) {
    super(config);
  }
  public async getAccounts(): Promise<string[]> {
    const connection = this.router.config.providers.signer.connection as SignerConnection;
    return [connection.signer.account];
  }
}
