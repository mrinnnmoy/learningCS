import { expect } from "chai";
import { network } from "hardhat";

describe("Counter", function () {
  it("starts at zero", async function () {
    const { ethers } = await network.connect();
    const counter = await ethers.deployContract("Counter");
    expect(await counter.getCount()).to.equal(0n);
  });

  it("lets the owner incrementBy", async function () {
    const { ethers } = await network.connect();
    const counter = await ethers.deployContract("Counter");
    await counter.incrementBy(5);
    expect(await counter.getCount()).to.equal(5n);
  });

  it("reverts incrementBy for a non-owner", async function () {
    const { ethers } = await network.connect();
    const counter = await ethers.deployContract("Counter");
    const [, stranger] = await ethers.getSigners();
    await expect(counter.connect(stranger).incrementBy(5))
      .to.be.revertedWithCustomError(counter, "NotOwner")
      .withArgs(stranger.address);
  });

  it("reverts decrement at zero", async function () {
    const { ethers } = await network.connect();
    const counter = await ethers.deployContract("Counter");
    await expect(counter.decrement()).to.be.revertedWithCustomError(
      counter,
      "CountUnderflow",
    );
  });
});
