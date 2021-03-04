import "mocha";
import * as chai from "chai";
import {
  BlockchainProviderConfig,
  formatJsonRpcRequest,
  isJsonRpcError,
  IJsonRpcConnection,
} from "@json-rpc-tools/utils";
import JsonRpcValidator from "@json-rpc-tools/validator";
import { BlockchainAuthenticator, BlockchainProvider } from "../src";

import {
  ETHEREUM_CHAIN_ID,
  ETHEREUM_CHAIN_REFERENCE,
  ETHEREUM_JSONRPC_CONFIG,
  ETHEREUM_JSONRPC_SCHEMA_MAP,
  ETHEREUM_SIGNING_METHODS,
} from "./shared";

const ETHEREUM_PROVIDER_CONFIG: BlockchainProviderConfig = {
  chainId: ETHEREUM_CHAIN_ID,
  routes: ETHEREUM_JSONRPC_CONFIG.routes.http,
  signer: {
    routes: ETHEREUM_JSONRPC_CONFIG.routes.signer,
    connection: {} as IJsonRpcConnection,
  },
  validator: new JsonRpcValidator(ETHEREUM_JSONRPC_SCHEMA_MAP),
};

describe("BlockchainAuthenticator", () => {
  describe("Ethereum", () => {
    let authenticator: BlockchainAuthenticator;
    before(() => {
      const provider = new BlockchainProvider(
        `https://api.mycryptoapi.com/eth`,
        ETHEREUM_PROVIDER_CONFIG,
      );
      authenticator = new BlockchainAuthenticator({
        provider,
        requiredApproval: ETHEREUM_SIGNING_METHODS,
      });
    });
    it("init", async () => {
      chai.expect(!!authenticator).to.be.true;
    });
    it("eth_chainId", async () => {
      const request = formatJsonRpcRequest("eth_chainId", []);
      const response = await authenticator.resolve(request);
      if (isJsonRpcError(response)) return;
      chai.expect(response.result).to.eql(`0x${ETHEREUM_CHAIN_REFERENCE}`);
    });
  });
});
