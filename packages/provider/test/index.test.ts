import "mocha";
import * as chai from "chai";
import { formatJsonRpcRequest } from "@json-rpc-tools/utils";

import { JsonRpcProvider } from "../src";

describe("@json-rpc-tools/provider", () => {
  // ---------- Provider ----------------------------------------------- //

  it("JsonRpcProvider", async () => {
    const provider = new JsonRpcProvider("https://rpc.slock.it/mainnet");
    const result = await provider.request(formatJsonRpcRequest("eth_chainId", []));
    chai.expect(!!result).to.be.true;
    chai.expect(result).to.eql("0x1");
  });
});
