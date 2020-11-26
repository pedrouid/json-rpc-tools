import { IJsonRpcProvider } from "@json-rpc-tools/utils";

export abstract class IJsonRpcSigner extends IJsonRpcProvider {
  public abstract getAccounts(): Promise<string[]>;
}
