import "mocha";
import * as chai from "chai";
import { JsonRpcProvider } from "@json-rpc-tools/provider";
import {
  JsonRpcConfig,
  JsonRpcRequest,
  JsonRpcRouterConfig,
  JsonSchema,
} from "@json-rpc-tools/utils";
import { BlockchainAuthenticator, BlockchainProvider, SignerConnection } from "../src";

const ETHEREUM_CHAIN_ID = "eip155:1";

const ETHEREUM_TX_JSONRPC_SCHEMA: JsonSchema = {
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

const ETHEREUM_JSONRPC_METHODS = {
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
      items: ETHEREUM_TX_JSONRPC_SCHEMA,
    },
    result: {
      type: "string",
    },
  },
};

const ETHEREUM_PROVIDER_CONFIG: JsonRpcRouterConfig = {
  providers: {
    http: new JsonRpcProvider(`https://rpc.slock.it/mainnet`),
    signer: new JsonRpcProvider({} as SignerConnection),
  },
  routes: {
    http: ["eth_blockNumber"],
    signer: ["eth_accounts", "eth_sendTransaction"],
  },
  methods: ETHEREUM_JSONRPC_METHODS,
};

describe("BlockchainAuthenticator", () => {
  let ethereumAuthenticator: BlockchainAuthenticator;
  beforeAll(() => {
    const provider = new BlockchainProvider(ETHEREUM_PROVIDER_CONFIG, ETHEREUM_CHAIN_ID);
    ethereumAuthenticator = new BlockchainAuthenticator(provider);
  });
  it("init", async () => {
    chai.expect(!!ethereumAuthenticator).to.be.true;
  });
});
