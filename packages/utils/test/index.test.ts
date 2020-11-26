import "mocha";
import * as chai from "chai";
import isEqual from "lodash.isequal";

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
  // ---------- Formatters ----------------------------------------------- //

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

  // ---------- Validators ----------------------------------------------- //

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

  describe("payloadId", () => {
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

    it("returns all different values", () => {
      const results: number[] = [];
      for (let i = 0; i < 10; i++) {
        results.push(payloadId());
      }
      const duplicates = findDuplicates(results);
      chai.expect(duplicates.length === 0).to.be.true;
    });
  });
});
