export interface ActiveTag {
  uid: string;
  lastSeenAt: number;
}

export interface CandidateTag {
  uid: string;
  firstSeenAt: number;
  lastSeenAt: number;
}

export type RFIDEvent = {
  type: "tagDetected" | "tagRemoved";
  uid: string;
};

export interface StateTransition {
  events: RFIDEvent[];
  nextEvaluationAt: number | null;
}
