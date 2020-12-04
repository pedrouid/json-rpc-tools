import { IJsonRpcConnection, IJsonRpcProvider } from "@json-rpc-tools/utils";

interface KeyPair {
  privateKey: string;
  publicKey: string;
}

export interface SignerConnectionOptions {
  keyPair: KeyPair;
  provider?: string | IJsonRpcProvider;
}

export abstract class ISignerConnection extends IJsonRpcConnection {
  constructor(opts: SignerConnectionOptions) {
    super();
  }
}
