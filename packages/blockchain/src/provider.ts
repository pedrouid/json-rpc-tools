import MultiServiceProvider from "@json-rpc-tools/multi";
import {
  formatJsonRpcRequest,
  IBlockchainProvider,
  BlockchainProviderConfig,
  MultiServiceProviderMap,
  BlockchainProviders,
  BlockchainRoutes,
  IJsonRpcValidator,
} from "@json-rpc-tools/utils";

export class BlockchainProvider extends MultiServiceProvider implements IBlockchainProvider {
  public map: MultiServiceProviderMap = {};
  public providers: BlockchainProviders;
  public routes: BlockchainRoutes;
  public validator: IJsonRpcValidator | undefined;

  constructor(public config: BlockchainProviderConfig) {
    super(config);
    if (typeof config.providers.http === "undefined") {
      throw new Error("HTTP provider is required for BlockchainProvider");
    }
    if (typeof config.providers.signer === "undefined") {
      throw new Error("Signer provider is required for BlockchainProvider");
    }
    this.providers = config.providers;
    this.routes = config.routes;
  }

  public async getChainId(): Promise<string> {
    return this.getState("http", "chainId");
  }

  public async getAccounts(): Promise<string[]> {
    return this.getState("signer", "accounts");
  }

  // ---------- Private ----------------------------------------------- //

  public async getState<T = any>(provider: string, method: string, params: any = []): Promise<T> {
    return this.providers[provider].request(
      formatJsonRpcRequest(this.config.state[method], params),
    );
  }
}
