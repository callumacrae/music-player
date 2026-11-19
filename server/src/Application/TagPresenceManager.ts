import type {
  ActiveTag,
  CandidateTag,
  RFIDEvent,
  StateTransition,
} from "./types";

class TagPresenceManager {
  private activeTag: ActiveTag | null = null;
  private activeTagTimeout: number = 1000;
  private candidateTag: CandidateTag | null = null;
  private candidateTagTimeout: number = 500;

  private isCandidateFresh(timestamp: number): boolean {
    return (
      this.candidateTag !== null &&
      this.candidateTag.lastSeenAt > timestamp - this.candidateTagTimeout
    );
  }

  private isCandidateStable(timestamp: number): boolean {
    return (
      this.candidateTag !== null &&
      this.candidateTag.firstSeenAt <= timestamp - this.candidateTagTimeout
    );
  }

  private isActiveAbsent(): boolean {
    return this.activeTag === null;
  }

  private isActiveExpired(timestamp: number): boolean {
    return this.activeTag?.lastSeenAt <= timestamp - this.activeTagTimeout;
  }

  private isCandidateEligible(timestamp: number): boolean {
    return (
      this.candidateTag !== null &&
      this.isCandidateStable(timestamp) &&
      this.isCandidateFresh(timestamp)
    );
  }

  private removeActiveTag(): void {
    this.activeTag = null;
  }

  private promoteCandidate(): void {
    // Promote current candidate to active if available
    if (this.candidateTag) {
      this.activeTag = {
        lastSeenAt: this.candidateTag.lastSeenAt,
        uid: this.candidateTag.uid,
      };
      this.candidateTag = null;
    }
  }

  private getEvaluationDeadline(): number | null {
    // No tags available, no deadline
    if (this.candidateTag === null && this.activeTag === null) return null;
    if (this.activeTag === null) return null;

    // Only active tag, set to active expiry
    if (this.candidateTag === null)
      return this.activeTag.lastSeenAt + this.activeTagTimeout;

    // Active and candidate tags exist, extract all relevant deadlines
    const activeTagExpiry = this.activeTag.lastSeenAt + this.activeTagTimeout;
    const candidateExpiry =
      this.candidateTag.lastSeenAt + this.candidateTagTimeout;
    const candidateStability =
      this.candidateTag.firstSeenAt + this.candidateTagTimeout;

    // If active expiry is soonest, return that
    if (
      Math.min(activeTagExpiry, candidateExpiry, candidateStability) ===
      activeTagExpiry
    )
      return activeTagExpiry;

    // Else return earliest candidate deadline
    return Math.min(candidateExpiry, candidateStability);
  }

  private evaluateTransitions(timestamp: number): StateTransition {
    const events: RFIDEvent[] = [];
    // Remove old candidate if stale or lost continuity
    if (!this.isCandidateFresh(timestamp)) {
      this.candidateTag = null;
    }
    // Tag is considered removed if it has expired or an eligible candidate is present
    if (
      !this.isActiveAbsent() &&
      (this.isActiveExpired(timestamp) || this.isCandidateEligible(timestamp))
    ) {
      events.push({ type: "tagRemoved", uid: this.activeTag.uid });
      this.removeActiveTag();
    }
    // Tag is considered detected if there is no active tag and a fresh candidate is available,
    // or if there is an eligible candidate
    if (
      (!this.activeTag && this.isCandidateFresh(timestamp)) ||
      this.isCandidateEligible(timestamp)
    ) {
      events.push({ type: "tagDetected", uid: this.candidateTag.uid });
      this.promoteCandidate();
    }

    return { events, nextEvaluationAt: this.getEvaluationDeadline() };
  }

  processObservation(uid: string, timestamp: number): StateTransition {
    if (!this.activeTag || this.activeTag.uid === uid) {
      // remove candidate if no active tag or active tag refreshed
      this.candidateTag = null;
    }
    if (this.activeTag?.uid === uid) {
      // Active tag observed - update lastSeenAt
      this.activeTag.lastSeenAt = timestamp;
    } else if (this.candidateTag?.uid != uid) {
      // Candidate tag is new - replace old candidate
      this.candidateTag = {
        uid,
        lastSeenAt: timestamp,
        firstSeenAt: timestamp,
      };
    } else {
      if (
        this.candidateTag.lastSeenAt <=
        timestamp - this.candidateTagTimeout
      ) {
        this.candidateTag.firstSeenAt = timestamp;
      }
      if (this.candidateTag) {
        this.candidateTag.lastSeenAt = timestamp;
      }
    }

    return this.evaluateTransitions(timestamp);
  }

  evaluate(timestamp: number): StateTransition {
    return this.evaluateTransitions(timestamp);
  }
}

export default TagPresenceManager;
