import * as jsonschema from "jsonschema";
import {
  IJsonRpcValidator,
  isJsonRpcRequest,
  isJsonRpcResult,
  validateJsonRpcError,
  JsonRpcMethodSchema,
  JsonRpcPayload,
  JsonRpcValidation,
  JsonRpcMethodsMap,
} from "@json-rpc-tools/utils";

export class JsonRpcValidator implements IJsonRpcValidator {
  constructor(public methods: JsonRpcMethodsMap) {
    this.methods = methods;
  }

  public isSupported(method: string): boolean {
    return Object.keys(this.methods).includes(method);
  }

  public getSchema(method: string): JsonRpcMethodSchema {
    const schema = this.methods[method];
    if (typeof schema === "undefined") {
      throw new Error(`JSON-RPC method not supported: ${method}`);
    }
    return schema;
  }

  public validate(payload: JsonRpcPayload, method?: string): JsonRpcValidation {
    let result: jsonschema.ValidatorResult;
    if (isJsonRpcRequest(payload)) {
      const schema = this.getSchema(payload.method);
      result = jsonschema.validate(payload.params, schema.params);
    } else if (isJsonRpcResult(payload)) {
      if (typeof method === "undefined") {
        throw new Error("Method argument required for validating JsonRpcResult");
      }
      const schema = this.getSchema(method);
      result = jsonschema.validate(payload.result, schema.result);
    } else {
      return validateJsonRpcError(payload);
    }
    return result.valid
      ? {
          valid: true,
        }
      : {
          valid: false,
          error: result.toString(),
        };
  }
}

export default JsonRpcValidator;
