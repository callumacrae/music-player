# ADR-0001: SepADR-0001: Separate RFID hardware integration from media provider logic

- Status: Proposed
- Date: 2026-11-05

## Context

Player is a Raspberry Pi Zero-based application that uses RFID tags to initiate music playback.

Multiple playback providers will be supported, initially Kodi and Spotify.

The current implementation couples hardware integration, media lookup and Kodi-specific logic. This is unnecessary and creates the potential for provider-specific conditional logic in the hardware integration layer.

It should be possible to introduce providers without modifying the hardware integration code.

- Tag presence represents media playback: one play request when detected, one stop request when removed.
- The reader sends continuous detection events whilst an RFID tag is present. Additional play requests should not be triggered by these.
- Tag removal is inferred when no detection events are received for a configured duration.
- A different UID should immediately replace the current tag.
- No provider-specific logic should be implemented to check whether the previous media is still playing. This may be useful future functionality.
- Media references associated with RFID tags are provider-specific.
- Provider selection and playback orchestration should not sit within the RFID hardware integration code.

## Decision

Separate RFID hardware integration from application-level playback control and provider implementations.

The architecture will separate responsibilities into three areas:

### 1. RFID hardware adapter

Responsibilities:

- Connecting to reader.
- Reading and decoding serial messages.
- RFID UID identification.
- Detecting presence and removal of tags.
- Handling repeated scans.
- Reporting hardware connection failures.
- Tag replacement does not require explicit removal
- Due to the possibility of tag clash, there should be candidate UID filtering before replacement
- Removal and detection are separate application events

An [Eccel Pepper C1](https://eccel.co.uk/product/pepper-c1-usb/) is the assumed hardware. No current plans should be made to accommodate alternative hardware at this stage

### 2. Application-level playback control

Responsibilities:

- Receiving RFID events.
- Resolving RFID tags to media references.
- Identifying the correct provider.
- Coordinating playback requests.
- Managing the active tag lifecycle.
- Handling provider errors and playback transitions.
- Tag DB lookup
- Active playback context
- Provider selection

This component should depend on defined contracts, not provider-specific implementations.

### 3. Provider adapters

Each provider will have its own implementation, initially Kodi and Spotify.

A provider will accept application-level playback requests defined by the contracts and translate them into the relevant API calls, handling provider-specific responses and errors.

## RFID event behaviour

- When a tag is first detected, a playback request is sent.
- Repeated subsequent scans of the same tag are ignored.
- If a different UID is detected, a stop request is sent for the previous item, followed by a request for the new media item.
- If tag removal is detected, playback stops.
