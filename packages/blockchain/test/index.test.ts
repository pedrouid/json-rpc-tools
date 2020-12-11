import "mocha";
import * as chai from "chai";
import {
  JsonSchema,
  JsonRpcSchemaMap,
  BlockchainProviderConfig,
  formatJsonRpcRequest,
  isJsonRpcError,
  BlockchainJsonRpcConfig,
} from "@json-rpc-tools/utils";

import { BlockchainAuthenticator, BlockchainProvider, ISignerConnection } from "../src";

const ETHEREUM_CHAIN_REFERENCE = "1";

const ETHEREUM_CHAIN_ID = `eip155:${ETHEREUM_CHAIN_REFERENCE}`;

const ETHEREUM_TX_SCHEMA: JsonSchema = {
  type: "object",
  properties: {
    from: { type: "string", required: true },
    to: { type: "string" },
    gas: { type: "string" },
    gasPrice: { type: "string" },
    value: { type: "string" },
    data: { type: "string" },
    nonce: { type: "string" },
  },
};

const ETHEREUM_JSONRPC_SCHEMA_MAP: JsonRpcSchemaMap = {
  eth_blockNumber: {
    name: "eth_blockNumber",
    description: "Fetches highest block number",
    params: {
      type: "array",
      items: {},
    },
    result: {
      type: "array",
      items: {
        type: "string",
      },
    },
  },
  eth_chainId: {
    name: "eth_chainId",
    description: "Fetches chain identifier",
    params: {
      type: "array",
      items: {},
    },
    result: {
      type: "array",
      items: {
        type: "string",
      },
    },
  },
  eth_accounts: {
    name: "eth_accounts",
    description: "Exposes user account addresses",
    params: {
      type: "array",
      items: {},
    },
    result: {
      type: "array",
      items: {
        type: "string",
      },
    },
  },
  eth_sendTransaction: {
    name: "eth_sendTransaction",
    description: "Creates, signs, and sends a new transaction to the network",
    params: {
      type: "array",
      items: ETHEREUM_TX_SCHEMA,
    },
    result: {
      type: "string",
    },
  },
};

const ETHEREUM_SIGNING_METHODS = [
  "eth_sign",
  "eth_signTypedData",
  "eth_sendTransaction",
  "personal_sign",
];

const ETHEREUM_JSONRPC_CONFIG: BlockchainJsonRpcConfig = {
  routes: {
    http: ["eth_*"],
    signer: ["eth_accounts", ...ETHEREUM_SIGNING_METHODS],
  },
  schemas: ETHEREUM_JSONRPC_SCHEMA_MAP,
};

const ETHEREUM_PROVIDER_CONFIG: BlockchainProviderConfig = {
  chainId: ETHEREUM_CHAIN_ID,
  routes: ETHEREUM_JSONRPC_CONFIG.routes.http,
  signer: {
    routes: ETHEREUM_JSONRPC_CONFIG.routes.signer,
    connection: {} as ISignerConnection,
  },
  validator: {
    schemas: ETHEREUM_JSONRPC_SCHEMA_MAP,
  },
};

describe("BlockchainAuthenticator", () => {
  let authenticator: BlockchainAuthenticator;
  beforeAll(() => {
    const provider = new BlockchainProvider(
      `https://rpc.slock.it/mainnet`,
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
