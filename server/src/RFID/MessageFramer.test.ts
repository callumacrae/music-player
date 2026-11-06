import { expect } from "chai";
import MessageFramer from "./MessageFramer";

describe("MessageFramer", () => {
  let framer: MessageFramer;

  beforeEach(() => {
    framer = new MessageFramer();
  });

  it("should return no messages for an empty chunk", () => {
    expect(framer.push("")).to.deep.equal([]);
  });

  it("should return a complete message", () => {
    expect(framer.push("message\n")).to.deep.equal(["message"]);
  });

  it("should return multiple complete messages", () => {
    expect(framer.push("first\nsecond\n")).to.deep.equal(["first", "second"]);
  });

  it("should retain an incomplete message", () => {
    expect(framer.push("incomplete")).to.deep.equal([]);
  });

  it("should complete a message across multiple chunks", () => {
    expect(framer.push("mes")).to.deep.equal([]);
    expect(framer.push("sage\n")).to.deep.equal(["message"]);
  });

  it("should preserve incomplete trailing data after complete messages", () => {
    expect(framer.push("first\nsec")).to.deep.equal(["first"]);
    expect(framer.push("ond\n")).to.deep.equal(["second"]);
  });

  it("should preserve empty messages", () => {
    expect(framer.push("\n\n")).to.deep.equal(["", ""]);
  });

  it("should preserve message ordering", () => {
    expect(framer.push("A\nB\nC\n")).to.deep.equal(["A", "B", "C"]);
  });
});
