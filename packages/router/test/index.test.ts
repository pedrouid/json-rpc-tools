import "mocha";
import * as chai from "chai";

import JsonRpcRouter from "../src";

const ETHEREUM_SIGNING_METHODS = [
  "eth_sign",
  "eth_signTypedData",
  "eth_sendTransaction",
  "personal_sign",
];

const ETHEREUM_ROUTES = {
  http: ["eth_*"],
  signer: ["eth_accounts", ...ETHEREUM_SIGNING_METHODS],
};

describe("@json-rpc-tools/router", () => {
  let router: JsonRpcRouter;
  before(() => {
    router = new JsonRpcRouter(ETHEREUM_ROUTES);
  });
  it("getRouteTarget", () => {
    chai.expect(router.getRouteTarget("eth_chainId")).to.eql("http");
  });
  it("isSupported", () => {
    chai.expect(router.isSupported("eth_chainId")).to.be.true;
  });
});
