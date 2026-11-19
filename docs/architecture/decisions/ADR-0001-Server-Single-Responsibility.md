# ADR-0001: Separate RFID hardware integration from media provider logic

- Status: Accepted
- Date: 2026-11-05

## Context

Player is a Raspberry Pi Zero-based application that uses RFID tags to initiate music playback.

Multiple playback providers will be supported, initially Kodi and Spotify.

The current implementation couples hardware integration, media lookup and Kodi-specific logic. This is unnecessary and creates the potential for provider-specific conditional logic in the hardware integration layer.

It should be possible to introduce providers without modifying the hardware integration code.

Proposed active tag timeout: 1000ms
Proposed candidate tag stability timeout: 500ms
Proposed candidate tag freshness timeout: 500ms

- Tag presence represents media playback: one play request when detected, one stop request when removed.
- The reader sends continuous detection events whilst an RFID tag is present. Additional play requests should not be triggered by these.
- Tag removal is inferred when no detection events are received for a configured duration.
- A different UID becomes a candidate for replacement
  - A candidate must be detected continuously for 500ms+, with no observation gap of 500ms+, before replacing active tag. The tag needs to be fresh (last seen within 500ms) and stable (having first been observed 500ms ago or more)
  - Observation of the original tag dismisses the candidate, updating active tag freshness
  - A candidate that is not scanned again within 500ms loses continuity and is dismissed.
  - If the active tag expires, a fresh candidate immediately becomes active with no stability check
  - If no UID is active, the next observed UID becomes active
- No provider-specific logic should be implemented to check whether the previous media is still playing. This may be useful future functionality.
- Media references associated with RFID tags are provider-specific.
- Provider selection and playback orchestration should not sit within the RFID hardware integration code.

## Decision

Separate RFID hardware integration from application-level playback control and provider implementations.

The architecture will separate responsibilities into three areas:

### 1. RFID hardware adapter

Responsibilities:

- Connecting/disconnection with reader.
- Reading, decoding and validating serial data and framing messages.
- Extracting RFID UIDs and reporting observations.
- Reporting hardware connection failures.

An [Eccel Pepper C1](https://eccel.co.uk/product/pepper-c1-usb/) is the assumed hardware. No current plans should be made to accommodate alternative hardware at this stage

### 2. Application-level playback control & state management

State machine:

- Due to the possibility of tag clash, there should be candidate UID filtering before replacement
- Maintaining active and candidate tags state
- Processing timestamped observations
- Determining tag presence
- Applying candidate state rules
- Reporting next state evaluation timings
- Handling repeated scans.
- Tag replacement does not require explicit removal
- Removal and detection are separate application events

Responsibilities:

- Receiving RFID lifecycle events.
- Resolving RFID tags to media references.
- Identifying the correct provider.
- Coordinating playback requests.
- Handling provider errors and playback transitions.
- Tag DB lookup
- Active playback context
- Provider selection

This component should depend on defined contracts, not provider-specific implementations.

### 3. Provider adapters

Each provider will have its own implementation, initially Kodi and Spotify.

A provider will accept application-level playback requests defined by the contracts and translate them into the relevant API calls, handling provider-specific responses and errors.

Each provider owns its provider-specific communication, authentication and error handling

## RFID event behaviour

- The first UID observation becomes active if no other active tag exists
- Repeated subsequent scans of the same tag refresh presence but emit no events.
- Observation of a different UID registers or updates a candidate
- Candidates must be continuously observed for at least 500ms before replacing an active tag. IF it isn't scanned again within that time its continuity is reset
- Observing the active UID dismisses the candidate
- Tag removal events are always sent before detections, if both are sent in the same transition
- A candidate is immediately detected if the active tag expires whilst the candidate has freshness
- A stale candidate is discarded
- Removal events include the UID of the removed tag
- Events are only emitted during state transitions
- When a tag detecttion event is detected, a playback request is created.
- A tag removal event stops playback
