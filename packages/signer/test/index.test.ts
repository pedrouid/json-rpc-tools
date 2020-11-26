import "mocha";
import * as chai from "chai";
import { formatJsonRpcRequest } from "@json-rpc-tools/utils";

import { JsonRpcSigner } from "../src";

describe("@json-rpc-tools/signer", () => {
  // ---------- Signer ----------------------------------------------- //

  it("init", async () => {
    const provider = new JsonRpcSigner("https://api.mycryptoapi.com/eth");
    const result = await provider.request(formatJsonRpcRequest("eth_chainId", []));
    chai.expect(!!provider).to.be.true;
    chai.expect(result).to.eql("0x1");
  });
});
