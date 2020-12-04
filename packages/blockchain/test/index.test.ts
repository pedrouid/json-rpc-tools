import "mocha";
import * as chai from "chai";
import { JsonRpcProvider } from "@json-rpc-tools/provider";
import {
  JsonSchema,
  BlockchainProviderConfig,
  formatJsonRpcRequest,
  isJsonRpcError,
} from "@json-rpc-tools/utils";

import { BlockchainAuthenticator, BlockchainProvider, ISignerConnection } from "../src";

const ETHEREUM_CHAIN_ID = "1";

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

const ETHEREUM_JSONRPC_SCHEMAS = {
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

const ETHEREUM_PROVIDER_CONFIG: BlockchainProviderConfig = {
  providers: {
    http: new JsonRpcProvider(`https://rpc.slock.it/mainnet`),
    signer: new JsonRpcProvider({} as ISignerConnection),
  },
  routes: {
    http: ["eth_chainId", "eth_blockNumber"],
    signer: ["eth_accounts", "eth_sendTransaction"],
  },
  state: {
    chainId: "eth_chainId",
    accounts: "eth_accounts",
  },
  schemas: ETHEREUM_JSONRPC_SCHEMAS,
};

describe("BlockchainAuthenticator", () => {
  let authenticator: BlockchainAuthenticator;
  beforeAll(() => {
    const provider = new BlockchainProvider(ETHEREUM_PROVIDER_CONFIG);
    authenticator = new BlockchainAuthenticator(provider);
  });
  it("init", async () => {
    chai.expect(!!authenticator).to.be.true;
  });
  it("eth_chainId", async () => {
    const request = formatJsonRpcRequest("eth_chainId", []);
    const response = await authenticator.request(request);
    if (isJsonRpcError(response)) return;
    chai.expect(response.result).to.eql(`0x${ETHEREUM_CHAIN_ID}`);
  });
});
