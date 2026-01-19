import RFIDInterface from "@/RFIDInterface.js";
import assert from "assert";

describe("RFID Connection", () => {
  it("Should throw an error when no card is detected", () => {
    assert.throws(
      () => {
        new RFIDInterface();
      },
      Error,
      "Throws error",
    );
  });
});
