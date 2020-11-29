import { JsonRpcConfig, JsonRpcMethodSchema, JsonRpcPayload, JsonRpcRequest } from "./jsonrpc";
import {
  IBaseJsonRpcProvider,
  IJsonRpcProvider,
  IMiniminumViableJsonRpcProvider,
} from "./provider";

export interface JsonRpcRouterConfig extends JsonRpcConfig {
  providers: {
    [name: string]: IJsonRpcProvider;
  };
  routes: {
    [provider: string]: string[];
  };
}

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
  constructor(public config: JsonRpcConfig) {}
  public abstract isSupported(method: string): boolean;
  public abstract getSchema(method: string): JsonRpcMethodSchema;
  public abstract validate(payload: JsonRpcPayload, method?: string): JsonRpcValidation;
}

export abstract class IJsonRpcRouter extends IJsonRpcValidator
  implements IMiniminumViableJsonRpcProvider {
  public abstract map: Record<string, string>;

  constructor(public config: JsonRpcRouterConfig) {
    super(config);
  }

  public abstract getProviderByMethod(method: string): IJsonRpcProvider;

  public abstract request<Result = any, Params = any>(
    request: JsonRpcRequest<Params>,
  ): Promise<Result>;
}

export abstract class IMultiServiceProvider extends IBaseJsonRpcProvider {
  public abstract router: IJsonRpcRouter;

  constructor(public config: JsonRpcRouterConfig) {
    super();
  }
}
