import { JsonRpcSchema, JsonRpcSchemaMap, JsonRpcPayload } from "./jsonrpc";

export interface JsonRpcValidationResult {
  valid: boolean;
  error?: string;
}

export interface JsonRpcValidationValid extends JsonRpcValidationResult {
  valid: true;
}

export interface JsonRpcValidationInvalid extends JsonRpcValidationResult {
  valid: false;
  error: string;
}

export type JsonRpcValidation = JsonRpcValidationValid | JsonRpcValidationInvalid;

export abstract class IJsonRpcValidator {
  constructor(public methods: JsonRpcSchemaMap) {}
  public abstract isSupported(method: string): boolean;
  public abstract getSchema(method: string): JsonRpcSchema;
  public abstract validate(payload: JsonRpcPayload, method?: string): JsonRpcValidation;
}
