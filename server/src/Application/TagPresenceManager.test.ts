import { expect } from "chai";
import TagPresenceManager from "./TagPresenceManager";

describe("TagPresenceManager", () => {
  let stateMachine: TagPresenceManager;

  beforeEach(() => {
    stateMachine = new TagPresenceManager();
  });

  it("detects initial UID", () => {
    const result = stateMachine.processObservation("ABBYN0RM", 1000);

    expect(result.events).to.deep.equal([
      {
        type: "tagDetected",
        uid: "ABBYN0RM",
      },
    ]);
  });

  it("does not emit duplicate events for repeated detection of active UID", () => {
    const result1 = stateMachine.processObservation("ABBYN0RM", 1000);
    const result2 = stateMachine.processObservation("ABBYN0RM", 1100);

    expect(result1.events).to.deep.equal([
      {
        type: "tagDetected",
        uid: "ABBYN0RM",
      },
    ]);
    expect(result2.events).to.deep.equal([]);
  });

  it("refreshes the active timeout through repeated observations", () => {
    const result1 = stateMachine.processObservation("ABBYN0RM", 1000);
    stateMachine.processObservation("ABBYN0RM", 1900);
    const result2 = stateMachine.evaluate(2500);
    const result3 = stateMachine.evaluate(2900);
    const result4 = stateMachine.evaluate(3000);
    expect(result1.events).to.deep.equal([
      {
        type: "tagDetected",
        uid: "ABBYN0RM",
      },
    ]);
    expect(result2.events).to.deep.equal([]);
    expect(result3.events).to.deep.equal([
      {
        type: "tagRemoved",
        uid: "ABBYN0RM",
      },
    ]);
    expect(result4.events).to.deep.equal([]);
  });

  it("restarts candidate stability after timeout", () => {
    stateMachine.processObservation("A", 1000);
    stateMachine.processObservation("B", 1100);

    // Exactly 500ms since the previous B observation.
    const result = stateMachine.processObservation("B", 1600);

    // B should now be a fresh candidate, not an accepted active tag.
    expect(result.events).to.deep.equal([]);
  });

  it("activates a valid candidate when the active tag expires", () => {
    stateMachine.processObservation("A", 1000);
    stateMachine.processObservation("B", 1900);

    const result = stateMachine.evaluate(2000);

    // B should now be an active tag.
    expect(result.events).to.deep.equal([
      { type: "tagRemoved", uid: "A" },
      { type: "tagDetected", uid: "B" },
    ]);
  });

  it("doesn't activate an expired candidate", () => {
    stateMachine.processObservation("A", 1000);
    stateMachine.processObservation("B", 1600);

    const result = stateMachine.evaluate(2100);

    expect(result.events).to.deep.equal([
      {
        type: "tagRemoved",
        uid: "A",
      },
    ]);
  });

  it("promotes a fresh, unstable candidate when active expires", () => {
    stateMachine.processObservation("A", 1000);
    stateMachine.processObservation("B", 1700);

    const result = stateMachine.evaluate(2000);

    expect(result.events).to.deep.equal([
      {
        type: "tagRemoved",
        uid: "A",
      },
      {
        type: "tagDetected",
        uid: "B",
      },
    ]);
  });

  it("replaces active tag with a stable, fresh candidate", () => {
    stateMachine.processObservation("A", 1000);
    stateMachine.processObservation("B", 1200);
    stateMachine.processObservation("B", 1600);

    const result = stateMachine.evaluate(1700);

    expect(result.events).to.deep.equal([
      {
        type: "tagRemoved",
        uid: "A",
      },
      {
        type: "tagDetected",
        uid: "B",
      },
    ]);
  });

  it("cancels a candidate when the active tag is scanned again, and refreshes the active tag", () => {
    stateMachine.processObservation("A", 1000);
    stateMachine.processObservation("B", 1200);
    stateMachine.processObservation("A", 1600);
    stateMachine.processObservation("B", 2000);
    const result = stateMachine.processObservation("A", 2200);

    expect(result.events).to.deep.equal([]);
  });

  it("does not emit events when an expired active tag is detected again", () => {
    stateMachine.processObservation("A", 1000);
    const result = stateMachine.processObservation("A", 2100);
    const beforeExpiry = stateMachine.evaluate(3099);
    const afterExpiry = stateMachine.evaluate(3100);

    expect(result.events).to.deep.equal([]);
    expect(beforeExpiry.events).to.deep.equal([]);
    expect(afterExpiry.events).to.deep.equal([
      { type: "tagRemoved", uid: "A" },
    ]);
  });

  describe("Scheduling", () => {
    it("schedules for active tag expiry", () => {
      const result = stateMachine.processObservation("A", 1000);

      expect(result).to.deep.equal({
        nextEvaluationAt: 2000,
        events: [{ type: "tagDetected", uid: "A" }],
      });
    });

    it("schedules for candidate stability deadline when earlier", () => {
      stateMachine.processObservation("A", 1000);
      stateMachine.processObservation("B", 1200);
      const result = stateMachine.processObservation("B", 1300);

      expect(result).to.deep.equal({ nextEvaluationAt: 1700, events: [] });
    });

    it("schedules for active tag expiry when candidate stability is later", () => {
      stateMachine.processObservation("A", 1000);
      const result = stateMachine.processObservation("B", 1600);

      expect(result).to.deep.equal({ nextEvaluationAt: 2000, events: [] });
    });

    it("does not schedule another evaluation when the candidate becomes stale as the active tag expires", () => {
      stateMachine.processObservation("A", 1000);
      stateMachine.processObservation("B", 1500);
      const result = stateMachine.evaluate(2000);

      expect(result).to.deep.equal({
        events: [{ type: "tagRemoved", uid: "A" }],
        nextEvaluationAt: null,
      });
    });

    it("schedules active expiry when candidate stability and freshness deadlines coincide", () => {
      stateMachine.processObservation("A", 1000);
      stateMachine.processObservation("B", 1200);
      const activeExpiry = stateMachine.evaluate(1700);

      expect(activeExpiry.nextEvaluationAt).to.equal(2000);
    });
  });
});
