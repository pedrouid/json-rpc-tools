import { JsonSchema, JsonRpcSchemaMap, BlockchainJsonRpcConfig } from "@json-rpc-tools/utils";

export const ETHEREUM_CHAIN_REFERENCE = "1";

export const ETHEREUM_CHAIN_ID = `eip155:${ETHEREUM_CHAIN_REFERENCE}`;

export const ETHEREUM_TX_SCHEMA: JsonSchema = {
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

export const ETHEREUM_JSONRPC_SCHEMA_MAP: JsonRpcSchemaMap = {
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

export const ETHEREUM_WALLET_METHODS = {
  accounts: "eth_accounts",
};

export const ETHEREUM_SIGNING_METHODS = [
  "eth_sign",
  "eth_signTypedData",
  "eth_sendTransaction",
  "personal_sign",
];

export const ETHEREUM_JSONRPC_CONFIG: BlockchainJsonRpcConfig = {
  routes: {
    http: ["eth_*"],
    signer: [ETHEREUM_WALLET_METHODS.accounts, ...ETHEREUM_SIGNING_METHODS],
  },
  schemas: ETHEREUM_JSONRPC_SCHEMA_MAP,
};
