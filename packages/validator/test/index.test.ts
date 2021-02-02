import "mocha";
import * as chai from "chai";
import {
  JsonRpcSchemaMap,
  JsonRpcRequest,
  JsonRpcResponse,
  JsonSchema,
} from "@json-rpc-tools/utils";

import JsonRpcValidator from "../src";

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

const ETHEREUM_JSONRPC_METHODS_MAP: JsonRpcSchemaMap = {
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

const TEST_JSON_RPC_REQUEST: { [method: string]: JsonRpcRequest } = {
  eth_accounts: {
    id: 1,
    jsonrpc: "2.0",
    method: "eth_accounts",
    params: [],
  },
  eth_sendTransaction: {
    id: 1,
    jsonrpc: "2.0",
    method: "eth_sendTransaction",
    params: [
      {
        data:
          "0xd46e8dd67c5d32be8d46e8dd67c5d32be8058bb8eb970870f072445675058bb8eb970870f072445675",
        from: "0xb60e8dd61c5d32be8058bb8eb970870f07233155",
        gas: "0x76c0",
        gasPrice: "0x9184e72a000",
        to: "0xd46e8dd67c5d32be8058bb8eb970870f07244567",
        value: "0x9184e72a",
      },
    ],
  },
  invalid_method: {
    id: 1,
    jsonrpc: "2.0",
    method: "invalid_method",
    params: [],
  },
};

const TEST_JSON_RPC_RESPONSE: { [method: string]: JsonRpcResponse } = {
  eth_sendTransaction: {
    id: 1,
    jsonrpc: "2.0",
    result: "0x2258e30e987613c859172f271c0b8a2d4dcc9d9258455170fcebca15d281a7fc",
  },
};

describe("JsonRpcValidator", () => {
  let validator: JsonRpcValidator;
  before(() => {
    validator = new JsonRpcValidator(ETHEREUM_JSONRPC_METHODS_MAP);
  });
  it("init", async () => {
    chai.expect(!!validator).to.be.true;
  });
  it("isSupported", async () => {
    chai.expect(validator.isSupported(TEST_JSON_RPC_REQUEST.eth_sendTransaction.method)).to.be.true;
    chai.expect(validator.isSupported(TEST_JSON_RPC_REQUEST.invalid_method.method)).to.be.false;
  });

  it("validate", async () => {
    chai
      .expect(validator.validate(TEST_JSON_RPC_REQUEST.eth_sendTransaction))
      .to.be.eql({ valid: true });
    chai
      .expect(validator.validate(TEST_JSON_RPC_REQUEST.eth_sendTransaction))
      .to.be.eql({ valid: true });
    chai
      .expect(() => validator.validate(TEST_JSON_RPC_REQUEST.invalid_method))
      .to.throw(`JSON-RPC method not supported: invalid_method`);
    chai
      .expect(validator.validate(TEST_JSON_RPC_RESPONSE.eth_sendTransaction, "eth_sendTransaction"))
      .to.be.eql({ valid: true });
    chai
      .expect(() => validator.validate(TEST_JSON_RPC_RESPONSE.eth_sendTransaction))
      .to.throw("Method argument required for validating JsonRpcResult");
  });
});
