# ADR-0001: Separate RFID hardware integration from media provider logic

- Status: Proposed
- Date: 11/05/2026

## Context

Player is a Rspberry Pi Zero based app that uses RFID tags to initiate music playback

Multiple backends supported, initially Kodi and Spotify

Current implementation couples hardware integration, media lookup and kodi-specific logic. This is unnecessary and creates the potential for provider specific conditional logic in the hardware integration layer.

It should be possible to introduce providers without modifying the hardware integration code.

- Tag presence represents media playback; one play request when detected, one cancellation request when removed.
- Reader sends continuous request whilst RFID is in place - additional play requests should not be triggered by these
- A stop request should be sent when no detection events are presenceved for a specific duration. Not provider specific logic should be implemented at this time to check whether the previous media is still playing, but could be useful future functionality.
- Media references associated with RFID tags are provider specific
- Provider selection and playback calling should not sit with the RFID hardware integration code.

## Decision

Separate RFID hardware integration from app-level playback control and provider implementations.

New architecture will decompose responsibility into three areas:

### 1. RFID hardware adapter

Responsibilities:

- Connecting to reader
- Reading and decoding serial messages
