import "mocha";
import * as chai from "chai";
import chaiAsPromised from "chai-as-promised";

import JsonRpcProvider from "../src";

chai.use(chaiAsPromised);

describe("@json-rpc-tools/provider", () => {
  it("HTTP (success)", async () => {
    const provider = new JsonRpcProvider(`https://api.mycryptoapi.com/eth`);
    const result = await provider.request({
      method: "eth_chainId",
      params: [],
    });
    chai.expect(!!result).to.be.true;
    chai.expect(result).to.eql("0x1");
  });
  it("HTTP (error)", async () => {
    const provider = new JsonRpcProvider(`http://random.domain.that.does.not.exist`);
    const promise = provider.request({ method: "test_method" });
    await chai
      .expect(promise)
      .to.eventually.be.rejectedWith(
        "Unavailable HTTP RPC url at http://random.domain.that.does.not.exist",
      );
  });
  it("WS (success)", async () => {
    const provider = new JsonRpcProvider(`wss://staging.walletconnect.org`);
    const result = await provider.request({
      method: "waku_subscribe",
      params: {
        topic: "ca838d59a3a3fe3824dab9ca7882ac9a2227c5d0284c88655b261a2fe85db270",
      },
    });
    chai.expect(!!result).to.be.true;
  });
  it("WS (error)", async () => {
    const provider = new JsonRpcProvider(`wss://staging.walletconnect.org`);
    const promise = provider.request({
      method: "waku_subscribe",
      params: {},
    });
    await chai
      .expect(promise)
      .to.eventually.be.rejectedWith("JSON-RPC Request has invalid subscribe params");
  });
});
