import "mocha";
import * as chai from "chai";
import isEqual from "lodash.isequal";
import { delay } from "@pedrouid/timestamp";

import {
  formatJsonRpcRequest,
  formatJsonRpcResult,
  formatJsonRpcError,
  formatErrorMessage,
  isJsonRpcRequest,
  isJsonRpcResponse,
  isJsonRpcResult,
  isJsonRpcError,
  payloadId,
  isValidRoute,
  isValidDefaultRoute,
  isValidWildcardRoute,
  isValidLeadingWildcardRoute,
  isValidTrailingWildcardRoute,
} from "../src";

function findDuplicates(arr: number[]): number[] {
  return arr.filter((item, index) => arr.indexOf(item) !== index);
}

const TEST_ID = 1;
const TEST_METHOD = "test_method";
const TEST_PARAMS = { something: true };
const TEST_RESULT = { whatever: true };
const TEST_ERROR_MESSAGE = "Something went wrong";
const TEST_ERROR = { code: -32000, message: TEST_ERROR_MESSAGE };
const TEST_JSONRPC_REQUEST = {
  id: TEST_ID,
  jsonrpc: "2.0",
  method: TEST_METHOD,
  params: TEST_PARAMS,
};
const TEST_JSONRPC_RESULT = {
  id: TEST_ID,
  jsonrpc: "2.0",
  result: TEST_RESULT,
};
const TEST_JSONRPC_ERROR = {
  id: TEST_ID,
  jsonrpc: "2.0",
  error: TEST_ERROR,
};
describe("@json-rpc-tools/utils", () => {
  describe("Formatters", () => {
    it("formatJsonRpcRequest", () => {
      const result = formatJsonRpcRequest(TEST_METHOD, TEST_PARAMS, TEST_ID);
      const expected = TEST_JSONRPC_REQUEST;
      chai.expect(isEqual(result, expected)).to.be.true;
    });

    it("formatJsonRpcResult", () => {
      const result = formatJsonRpcResult(TEST_ID, TEST_RESULT);
      const expected = TEST_JSONRPC_RESULT;
      chai.expect(isEqual(result, expected)).to.be.true;
    });

    it("formatJsonRpcError", () => {
      const result = formatJsonRpcError(TEST_ID, TEST_ERROR_MESSAGE);
      const expected = TEST_JSONRPC_ERROR;
      chai.expect(isEqual(result, expected)).to.be.true;
    });

    it("formatErrorMessage", () => {
      const message = "Something went wrong";
      const result = formatErrorMessage(message);
      const expected = TEST_ERROR;
      chai.expect(isEqual(result, expected)).to.be.true;
    });
  });

  describe("Validators", () => {
    it("isJsonRpcRequest", () => {
      chai.expect(isJsonRpcRequest(TEST_JSONRPC_REQUEST)).to.be.true;
      chai.expect(isJsonRpcRequest(TEST_JSONRPC_RESULT)).to.be.false;
      chai.expect(isJsonRpcRequest(TEST_JSONRPC_ERROR)).to.be.false;
    });

    it("isJsonRpcResponse", () => {
      chai.expect(isJsonRpcResponse(TEST_JSONRPC_REQUEST)).to.be.false;
      chai.expect(isJsonRpcResponse(TEST_JSONRPC_RESULT)).to.be.true;
      chai.expect(isJsonRpcResponse(TEST_JSONRPC_ERROR)).to.be.true;
    });

    it("isJsonRpcResult", () => {
      chai.expect(isJsonRpcResult(TEST_JSONRPC_REQUEST)).to.be.false;
      chai.expect(isJsonRpcResult(TEST_JSONRPC_RESULT)).to.be.true;
      chai.expect(isJsonRpcResult(TEST_JSONRPC_ERROR)).to.be.false;
    });

    it("isJsonRpcError", () => {
      chai.expect(isJsonRpcError(TEST_JSONRPC_REQUEST)).to.be.false;
      chai.expect(isJsonRpcError(TEST_JSONRPC_RESULT)).to.be.false;
      chai.expect(isJsonRpcError(TEST_JSONRPC_ERROR)).to.be.true;
    });
  });

  describe("Payload Id", () => {
    it("returns a number", () => {
      const result = payloadId();
      chai.expect(!!result).to.be.true;
      chai.expect(typeof result === "number").to.be.true;
    });

    it("returns a time-based number", () => {
      const before = Date.now();
      const result = payloadId();
      const time = Math.floor(result * 1e-3);
      const after = Date.now();
      chai.expect(before <= time).to.be.true;
      chai.expect(after >= time).to.be.true;
    });

    it("returns all different values", async () => {
      const results: number[] = await Promise.all(
        Array(10)
          .fill(0)
          .map(async () => {
            await delay(10);
            return payloadId();
          }),
      );
      const duplicates = findDuplicates(results);
      chai.expect(duplicates.length === 0).to.be.true;
    });
  });

  describe("Routing", () => {
    it("isValidRoute", () => {
      chai.expect(isValidRoute("eth_signTypedData_v1")).to.be.true;
      chai.expect(isValidRoute("eth_signTypedData_*")).to.be.true;
      chai.expect(isValidRoute("*_blockNumber")).to.be.true;
      chai.expect(isValidRoute("eth_chainId")).to.be.true;
      chai.expect(isValidRoute("eth_*")).to.be.true;
      chai.expect(isValidRoute("*")).to.be.true;
      chai.expect(isValidRoute("eth_sign*")).to.be.true;
      chai.expect(isValidRoute("eth+")).to.be.false;
      chai.expect(isValidRoute("**")).to.be.false;
      chai.expect(isValidRoute("eth_sign*Typed")).to.be.false;
    });
    it("isValidDefaultRoute", () => {
      chai.expect(isValidDefaultRoute("eth_signTypedData_v1")).to.be.false;
      chai.expect(isValidDefaultRoute("eth_signTypedData_*")).to.be.false;
      chai.expect(isValidDefaultRoute("*_blockNumber")).to.be.false;
      chai.expect(isValidDefaultRoute("eth_chainId")).to.be.false;
      chai.expect(isValidDefaultRoute("eth_*")).to.be.false;
      chai.expect(isValidDefaultRoute("*")).to.be.true;
      chai.expect(isValidDefaultRoute("eth_sign*")).to.be.false;
      chai.expect(isValidDefaultRoute("eth+")).to.be.false;
      chai.expect(isValidDefaultRoute("**")).to.be.false;
      chai.expect(isValidDefaultRoute("eth_sign*Typed")).to.be.false;
    });
    it("isValidWildcardRoute", () => {
      chai.expect(isValidWildcardRoute("eth_signTypedData_v1")).to.be.false;
      chai.expect(isValidWildcardRoute("eth_signTypedData_*")).to.be.true;
      chai.expect(isValidWildcardRoute("*_blockNumber")).to.be.true;
      chai.expect(isValidWildcardRoute("eth_chainId")).to.be.false;
      chai.expect(isValidWildcardRoute("eth_*")).to.be.true;
      chai.expect(isValidWildcardRoute("*")).to.be.true;
      chai.expect(isValidWildcardRoute("eth_sign*")).to.be.true;
      chai.expect(isValidWildcardRoute("eth+")).to.be.false;
      chai.expect(isValidWildcardRoute("**")).to.be.false;
      chai.expect(isValidWildcardRoute("eth_sign*Typed")).to.be.false;
    });
    it("isValidLeadingWildcardRoute", () => {
      chai.expect(isValidLeadingWildcardRoute("eth_signTypedData_v1")).to.be.false;
      chai.expect(isValidLeadingWildcardRoute("eth_signTypedData_*")).to.be.false;
      chai.expect(isValidLeadingWildcardRoute("*_blockNumber")).to.be.true;
      chai.expect(isValidLeadingWildcardRoute("eth_chainId")).to.be.false;
      chai.expect(isValidLeadingWildcardRoute("eth_*")).to.be.false;
      chai.expect(isValidLeadingWildcardRoute("*")).to.be.false;
      chai.expect(isValidLeadingWildcardRoute("eth_sign*")).to.be.false;
      chai.expect(isValidLeadingWildcardRoute("eth+")).to.be.false;
      chai.expect(isValidLeadingWildcardRoute("**")).to.be.false;
      chai.expect(isValidLeadingWildcardRoute("eth_sign*Typed")).to.be.false;
    });
    it("isValidTrailingWildcardRoute", () => {
      chai.expect(isValidTrailingWildcardRoute("eth_signTypedData_v1")).to.be.false;
      chai.expect(isValidTrailingWildcardRoute("eth_signTypedData_*")).to.be.true;
      chai.expect(isValidTrailingWildcardRoute("*_blockNumber")).to.be.false;
      chai.expect(isValidTrailingWildcardRoute("eth_chainId")).to.be.false;
      chai.expect(isValidTrailingWildcardRoute("eth_*")).to.be.true;
      chai.expect(isValidTrailingWildcardRoute("*")).to.be.false;
      chai.expect(isValidTrailingWildcardRoute("eth_sign*")).to.be.true;
      chai.expect(isValidTrailingWildcardRoute("eth+")).to.be.false;
      chai.expect(isValidTrailingWildcardRoute("**")).to.be.false;
      chai.expect(isValidTrailingWildcardRoute("eth_sign*Typed")).to.be.false;
    });
  });
});
