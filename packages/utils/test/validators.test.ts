import "mocha";
import * as chai from "chai";

import {
  isJsonRpcRequest,
  isJsonRpcResponse,
  isJsonRpcResult,
  isJsonRpcError,
  isJsonRpcPayload,
} from "../src";
import { TEST_JSONRPC_ERROR, TEST_JSONRPC_REQUEST, TEST_JSONRPC_RESULT } from "./shared";

describe("Validators", () => {
  it("isJsonRpcPayload", () => {
    chai.expect(isJsonRpcPayload(TEST_JSONRPC_REQUEST)).to.be.true;
    chai.expect(isJsonRpcPayload(TEST_JSONRPC_RESULT)).to.be.true;
    chai.expect(isJsonRpcPayload(TEST_JSONRPC_ERROR)).to.be.true;
  });

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

  it("isJsonRpcError verifies ErrorResponse", () => {
    const INCORRECT_STRING: any = { ...TEST_JSONRPC_ERROR, error: "hello" };
    const INCORRECT_UNDEFINED: any = { ...TEST_JSONRPC_ERROR, error: undefined };
    const INCORRECT_OBJECT: any = { ...TEST_JSONRPC_ERROR, error: {} };

    const INCOMPLETE_OBJECT_1: any = {
      ...TEST_JSONRPC_ERROR,
      error: { code: 0, message: undefined },
    };

    const INCOMPLETE_OBJECT_2: any = {
      ...TEST_JSONRPC_ERROR,
      error: { message: "hello" },
    };

    const CORRECT_ERROR_RESPONSE = {
      ...TEST_JSONRPC_ERROR,
      error: { code: -1, message: "hello" },
    };

    chai.expect(isJsonRpcError(INCORRECT_STRING)).to.be.false;
    chai.expect(isJsonRpcError(INCORRECT_UNDEFINED)).to.be.false;
    chai.expect(isJsonRpcError(INCORRECT_OBJECT)).to.be.false;
    chai.expect(isJsonRpcError(INCOMPLETE_OBJECT_1)).to.be.false;
    chai.expect(isJsonRpcError(INCOMPLETE_OBJECT_2)).to.be.false;
    chai.expect(isJsonRpcError(CORRECT_ERROR_RESPONSE)).to.be.true;
  });
});
