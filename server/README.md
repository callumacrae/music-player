# RFID Reader service

This project uses tRPC and node serialport to communicate with the client website

All procedure calls can be found in `./src/router.ts`

Currently compatibility with the Pepper C1 RFID reader is hardcoded, however compatibility with other devices may well be possible

The RFIDInterface class handles all communication via serial and will throw an error on disconnection with the reader. Error handling is implemented in the router.ts file.

When running `npm run build`, types are generated and placed in the client folder for use when running procedure calls clientside

### TODO

- move JSONRPC call to backend
- Prevent server crash when opening tRPC connection but RFID not connected
