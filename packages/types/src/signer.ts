import { IJsonRpcProvider } from "./provider";

export abstract class IJsonRpcSigner extends IJsonRpcProvider {
  public abstract getAccounts(): Promise<string[]>;
}
