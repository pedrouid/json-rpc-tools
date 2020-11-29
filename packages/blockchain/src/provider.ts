import MultiServiceProvider from "@json-rpc-tools/multi";
import {
  formatJsonRpcRequest,
  IBlockchainProvider,
  BlockchainProviderConfig,
} from "@json-rpc-tools/utils";

export class BlockchainProvider extends MultiServiceProvider implements IBlockchainProvider {
  constructor(public config: BlockchainProviderConfig) {
    super(config);
    if (typeof config.providers.signer === "undefined") {
      throw new Error("Signer provider is required for BlockchainProvider");
    }
  }

  public async getChainId(): Promise<string> {
    return this.getState("chainId");
  }

  public async getAccounts(): Promise<string[]> {
    return this.getState("accounts");
  }

  // ---------- Private ----------------------------------------------- //

  public async getState<T = any>(method: string, params: any = []): Promise<T> {
    return this.request(formatJsonRpcRequest(this.config.state[method], params));
  }
}
