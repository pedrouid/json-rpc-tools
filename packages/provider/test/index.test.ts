import "mocha";
import * as chai from "chai";
import { formatJsonRpcRequest } from "@json-rpc-tools/utils";

import JsonRpcProvider from "../src";

describe("@json-rpc-tools/provider", () => {
  it("HTTP", async () => {
    const provider = new JsonRpcProvider(`https://api.mycryptoapi.com/eth`);
    const request = formatJsonRpcRequest("eth_chainId", []);
    const result = await provider.request(request);
    chai.expect(!!result).to.be.true;
    chai.expect(result).to.eql("0x1");
  });

  it("WS", async () => {
    const provider = new JsonRpcProvider(`wss://staging.walletconnect.org`);
    const request = formatJsonRpcRequest("waku_subscribe", {
      topic: "ca838d59a3a3fe3824dab9ca7882ac9a2227c5d0284c88655b261a2fe85db270",
    });
    const result = await provider.request(request);
    chai.expect(!!result).to.be.true;
  });
});
