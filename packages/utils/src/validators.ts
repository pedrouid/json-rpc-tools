import {
  JsonRpcError,
  JsonRpcPayload,
  JsonRpcRequest,
  JsonRpcResponse,
  JsonRpcResult,
} from "./types";

export function isJsonRpcRequest<T = any>(
  payload: JsonRpcPayload
): payload is JsonRpcRequest<T> {
  return "method" in payload;
}

export function isJsonRpcResponse<T = any>(
  payload: JsonRpcPayload
): payload is JsonRpcResponse<T> {
  return !isJsonRpcRequest(payload);
}

export function isJsonRpcResult<T = any>(
  payload: JsonRpcPayload
): payload is JsonRpcResult<T> {
  return "result" in payload;
}

export function isJsonRpcError(
  payload: JsonRpcPayload
): payload is JsonRpcError {
  return "error" in payload;
}
